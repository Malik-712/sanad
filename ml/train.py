"""Fine-tune a small Arabic BERT to tag narrator names (B-NAR / I-NAR / O), word by word.

Labels go on the first sub-token of each word; the other sub-tokens get -100.
Runs on CPU (no GPU needed for BERT-mini) or on a GPU if one is present.

    python ml/train.py --data ml/data/splits --model asafaya/bert-mini-arabic --out ml/out --seed 42
"""

import argparse
import json
import random
import time
from pathlib import Path

import numpy as np
import torch
from seqeval.metrics import f1_score
from transformers import (
    AutoModelForTokenClassification,
    AutoTokenizer,
    DataCollatorForTokenClassification,
    EarlyStoppingCallback,
    Trainer,
    TrainerCallback,
    TrainingArguments,
)

LABELS = ["O", "B-NAR", "I-NAR"]
L2I = {l: i for i, l in enumerate(LABELS)}
DEV_EVAL_SIZE = 2000  # fixed sample of dev (seeded) to keep each evaluation short on CPU


def read_jsonl(path: Path) -> list[dict]:
    with path.open(encoding="utf-8") as f:
        return [json.loads(line) for line in f]


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def encode(records: list[dict], tokenizer, max_len: int) -> list[dict]:
    out = []
    for r in records:
        enc = tokenizer(r["tokens"], is_split_into_words=True, truncation=True, max_length=max_len)
        labels, prev = [], None
        for wid in enc.word_ids():
            if wid is None or wid == prev:
                labels.append(-100)
            else:
                labels.append(L2I[r["labels"][wid]])
            prev = wid
        out.append({"input_ids": enc["input_ids"], "attention_mask": enc["attention_mask"], "labels": labels})
    return out


def subword_p95(records: list[dict], tokenizer, cap: int = 256) -> int:
    lengths = sorted(
        len(tokenizer(r["tokens"], is_split_into_words=True)["input_ids"]) for r in records[:5000]
    )
    return min(cap, lengths[int(0.95 * (len(lengths) - 1))])


class LogCallback(TrainerCallback):
    def __init__(self) -> None:
        self.epochs: list[dict] = []
        self.losses: list[dict] = []
        self.start = time.time()

    def on_log(self, args, state, control, logs=None, **kw):
        if logs and "loss" in logs:
            self.losses.append({"step": state.global_step, "epoch": round(state.epoch or 0, 3), "loss": logs["loss"]})
        if logs and "eval_f1" in logs:
            self.epochs.append(
                {
                    "epoch": round(state.epoch or 0, 3),
                    "dev_f1": logs["eval_f1"],
                    "dev_loss": logs.get("eval_loss"),
                    "elapsed_min": round((time.time() - self.start) / 60, 2),
                }
            )
            print("EPOCH", self.epochs[-1], flush=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", type=Path, default=Path("ml/data/splits"))
    ap.add_argument("--model", default="asafaya/bert-mini-arabic")
    ap.add_argument("--out", type=Path, default=Path("ml/out"))
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--epochs", type=int, default=3)
    ap.add_argument("--max-train", type=int, default=100_000)
    args = ap.parse_args()

    set_seed(args.seed)
    torch.set_num_threads(max(1, torch.get_num_threads()))
    tokenizer = AutoTokenizer.from_pretrained(args.model)

    train = read_jsonl(args.data / "train.jsonl")[: args.max_train]
    dev_all = read_jsonl(args.data / "dev.jsonl")
    dev = random.Random(args.seed).sample(dev_all, min(DEV_EVAL_SIZE, len(dev_all)))
    max_len = subword_p95(train, tokenizer)
    print(f"train={len(train)} dev_eval={len(dev)} max_len={max_len} threads={torch.get_num_threads()}", flush=True)

    train_ds = encode(train, tokenizer, max_len)
    dev_ds = encode(dev, tokenizer, max_len)

    model = AutoModelForTokenClassification.from_pretrained(
        args.model, num_labels=len(LABELS), id2label=dict(enumerate(LABELS)), label2id=L2I
    )

    def metrics(p):
        preds = np.argmax(p.predictions, axis=-1)
        gold_seqs, pred_seqs = [], []
        for pr, lb in zip(preds, p.label_ids):
            g, q = [], []
            for a, b in zip(pr, lb):
                if b != -100:
                    g.append(LABELS[b])
                    q.append(LABELS[a])
            gold_seqs.append(g)
            pred_seqs.append(q)
        return {"f1": f1_score(gold_seqs, pred_seqs)}

    log = LogCallback()
    targs = TrainingArguments(
        output_dir=str(args.out / "checkpoints"),
        learning_rate=5e-5,
        per_device_train_batch_size=32,
        per_device_eval_batch_size=64,
        num_train_epochs=args.epochs,
        eval_strategy="epoch",
        save_strategy="epoch",
        save_total_limit=2,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        logging_steps=200,
        seed=args.seed,
        data_seed=args.seed,
        fp16=torch.cuda.is_available(),
        group_by_length=True,
        report_to=[],
        dataloader_num_workers=0,
    )
    trainer = Trainer(
        model=model,
        args=targs,
        train_dataset=train_ds,
        eval_dataset=dev_ds,
        data_collator=DataCollatorForTokenClassification(tokenizer),
        compute_metrics=metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=1), log],
    )
    t0 = time.time()
    trainer.train()
    minutes = round((time.time() - t0) / 60, 2)

    best = args.out / "best"
    trainer.save_model(str(best))
    tokenizer.save_pretrained(str(best))
    hardware = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    (args.out / "train_log.json").write_text(
        json.dumps(
            {
                "base": args.model,
                "seed": args.seed,
                "train_records": len(train),
                "dev_eval_records": len(dev),
                "max_len": max_len,
                "lr": 5e-5,
                "batch": 32,
                "max_epochs": args.epochs,
                "early_stopping": "dev entity F1, patience 1",
                "hardware": hardware,
                "threads": torch.get_num_threads(),
                "train_minutes": minutes,
                "best_dev_f1": trainer.state.best_metric,
                "epochs": log.epochs,
                "loss": log.losses,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"done in {minutes} min, best dev F1 = {trainer.state.best_metric}", flush=True)


if __name__ == "__main__":
    main()
