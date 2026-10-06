"""Export the trained tagger to ONNX, quantise it to int8, and lay it out for Transformers.js.

Output (ml/out/sanad-ner-onnx/, git-ignored): config.json, tokenizer files, onnx/model_quantized.onnx.
Not shipped: owner decision 6 Oct (Sanadset licence unclear) — the live site runs the rule parser.
Parity: ONNX int8 vs PyTorch word labels on N test isnads must agree on >= 99 % of words.

    python ml/export_onnx.py --model ml/out/best --out ml/out/sanad-ner-onnx --parity 50
"""

import argparse
import json
import shutil
import sys
import tempfile
from pathlib import Path

import numpy as np
import onnxruntime as ort
from onnxruntime.quantization import QuantType, quantize_dynamic
from optimum.onnxruntime import ORTModelForTokenClassification
from transformers import AutoModelForTokenClassification, AutoTokenizer

sys.path.insert(0, str(Path(__file__).resolve().parent))
from predict import MAX_LEN, repair, word_labels  # noqa: E402

TOKENIZER_FILES = ["tokenizer.json", "tokenizer_config.json", "special_tokens_map.json", "vocab.txt"]


def onnx_word_labels(words, tokenizer, session, id2label) -> list[str]:
    enc = tokenizer(words, is_split_into_words=True, truncation=True, max_length=MAX_LEN, return_tensors="np")
    feeds = {i.name: enc[i.name].astype(np.int64) for i in session.get_inputs()}
    logits = session.run(None, feeds)[0][0]
    pred = logits.argmax(-1).tolist()
    labels, prev = ["O"] * len(words), None
    for pos, wid in enumerate(enc.word_ids()):
        if wid is not None and wid != prev:
            labels[wid] = id2label[pred[pos]]
        prev = wid
    return repair(labels)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", type=Path, default=Path("ml/out/best"))
    ap.add_argument("--out", type=Path, default=Path("ml/out/sanad-ner-onnx"))
    ap.add_argument("--test", type=Path, default=Path("ml/data/splits/test.jsonl"))
    ap.add_argument("--parity", type=int, default=50)
    args = ap.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        ORTModelForTokenClassification.from_pretrained(args.model, export=True).save_pretrained(tmp)
        if args.out.exists():
            shutil.rmtree(args.out)
        (args.out / "onnx").mkdir(parents=True)
        quantize_dynamic(str(tmp / "model.onnx"), str(args.out / "onnx" / "model_quantized.onnx"), weight_type=QuantType.QInt8)

    tokenizer = AutoTokenizer.from_pretrained(args.model)
    tokenizer.save_pretrained(args.out)
    shutil.copy(args.model / "config.json", args.out / "config.json")
    for extra in args.out.iterdir():
        if extra.is_file() and extra.name not in TOKENIZER_FILES + ["config.json"]:
            extra.unlink()

    # Parity on the first N test isnads.
    model = AutoModelForTokenClassification.from_pretrained(args.model).eval()
    session = ort.InferenceSession(str(args.out / "onnx" / "model_quantized.onnx"), providers=["CPUExecutionProvider"])
    id2label = {int(k): v for k, v in model.config.id2label.items()}
    same = total = 0
    with args.test.open(encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= args.parity:
                break
            words = json.loads(line)["tokens"]
            a = word_labels(words, tokenizer, model)
            b = onnx_word_labels(words, tokenizer, session, id2label)
            same += sum(x == y for x, y in zip(a, b))
            total += len(a)

    size = sum(p.stat().st_size for p in args.out.rglob("*") if p.is_file())
    report = {
        "parity_isnads": min(args.parity, i + 1),
        "parity_words": total,
        "parity": round(same / max(total, 1), 5),
        "size_mb": round(size / 1024 / 1024, 2),
        "files": sorted(str(p.relative_to(args.out)).replace("\\", "/") for p in args.out.rglob("*") if p.is_file()),
    }
    Path("ml/out/export_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    if report["parity"] < 0.99 or report["size_mb"] > 30:
        raise SystemExit("parity < 99 % or size > 30 MB")


if __name__ == "__main__":
    main()
