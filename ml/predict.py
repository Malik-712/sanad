"""Word-level predictions of the trained tagger, in the same {id, labels} format as the baseline.

    python ml/predict.py --model ml/out/best --in ml/data/splits/test.jsonl --out ml/preds/model.test.jsonl
"""

import argparse
import sys
import json
from pathlib import Path

import torch
from transformers import AutoModelForTokenClassification, AutoTokenizer

sys.path.insert(0, str(Path(__file__).resolve().parent))

MAX_LEN = 512


def repair(labels: list[str]) -> list[str]:
    """An I-NAR that does not follow a name starts one (same rule as lib/ml/labels.ts)."""
    out = []
    for i, l in enumerate(labels):
        if l == "I-NAR" and (i == 0 or out[i - 1] == "O"):
            l = "B-NAR"
        out.append(l)
    return out


def word_labels(words: list[str], tokenizer, model) -> list[str]:
    enc = tokenizer(words, is_split_into_words=True, truncation=True, max_length=MAX_LEN, return_tensors="pt")
    with torch.no_grad():
        logits = model(**{k: v for k, v in enc.items() if k in ("input_ids", "attention_mask", "token_type_ids")}).logits[0]
    pred = logits.argmax(-1).tolist()
    labels = ["O"] * len(words)
    prev = None
    for pos, wid in enumerate(enc.word_ids()):
        if wid is not None and wid != prev:
            labels[wid] = model.config.id2label[pred[pos]]
        prev = wid
    return repair(labels)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", type=Path, default=Path("ml/out/best"))
    ap.add_argument("--in", dest="inp", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--onnx", type=Path, default=None, help="score the exported int8 file instead (the one the browser runs)")
    args = ap.parse_args()

    torch.manual_seed(42)
    tokenizer = AutoTokenizer.from_pretrained(args.model)
    model = AutoModelForTokenClassification.from_pretrained(args.model).eval()
    predict = lambda words: word_labels(words, tokenizer, model)  # noqa: E731
    if args.onnx:
        import onnxruntime as ort

        from export_onnx import onnx_word_labels

        session = ort.InferenceSession(str(args.onnx), providers=["CPUExecutionProvider"])
        id2label = {int(k): v for k, v in model.config.id2label.items()}
        predict = lambda words: onnx_word_labels(words, tokenizer, session, id2label)  # noqa: E731
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.inp.open(encoding="utf-8") as f, args.out.open("w", encoding="utf-8") as g:
        for line in f:
            rec = json.loads(line)
            g.write(json.dumps({"id": rec["id"], "labels": predict(rec["tokens"])}, ensure_ascii=False) + "\n")
    print(f"predictions → {args.out}")


if __name__ == "__main__":
    main()
