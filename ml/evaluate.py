"""Score narrator tagging (baseline and model) on the same gold file.

Metrics: entity precision / recall / F1 (seqeval, strict BIO) and exact chain match
(every narrator found, with the same boundaries, in order, and nothing extra).

    python ml/evaluate.py --gold ml/data/splits/test.jsonl \
        --pred baseline=ml/preds/baseline.test.jsonl --pred model=ml/preds/model.test.jsonl \
        --errors 10 --json ml/preds/scores.json
"""

import argparse
import json
from pathlib import Path

from seqeval.metrics import f1_score, precision_score, recall_score
from seqeval.scheme import IOB2


def read_jsonl(path: Path) -> list[dict]:
    with path.open(encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def spans(labels: list[str]) -> list[tuple[int, int]]:
    out, start = [], None
    for i, l in enumerate(labels + ["O"]):
        if l == "B-NAR" or l == "O" or (l == "I-NAR" and start is None):
            if start is not None:
                out.append((start, i))
                start = None
            if l == "B-NAR" or (l == "I-NAR"):
                start = i
    return out


def score(gold: list[dict], preds: dict[str, list[str]]) -> dict:
    g = [r["labels"] for r in gold]
    p = [preds[r["id"]] for r in gold]
    exact = sum(spans(a) == spans(b) for a, b in zip(g, p))
    return {
        "precision": precision_score(g, p, mode="strict", scheme=IOB2),
        "recall": recall_score(g, p, mode="strict", scheme=IOB2),
        "f1": f1_score(g, p, mode="strict", scheme=IOB2),
        "exact_chain": exact / len(gold),
        "exact_chain_count": exact,
        "n": len(gold),
    }


def names(tokens: list[str], labels: list[str]) -> list[str]:
    return [" ".join(tokens[s:e]) for s, e in spans(labels)]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--gold", type=Path, required=True)
    ap.add_argument("--pred", action="append", required=True, help="name=path")
    ap.add_argument("--errors", type=int, default=10)
    ap.add_argument("--json", type=Path, default=None)
    args = ap.parse_args()

    gold = read_jsonl(args.gold)
    results, errors = {}, {}
    for spec in args.pred:
        name, path = spec.split("=", 1)
        preds = {r["id"]: r["labels"] for r in read_jsonl(Path(path))}
        missing = [r["id"] for r in gold if r["id"] not in preds]
        if missing:
            raise SystemExit(f"{name}: {len(missing)} ids missing, e.g. {missing[:3]}")
        results[name] = score(gold, preds)
        errs = []
        for r in gold:
            if spans(r["labels"]) != spans(preds[r["id"]]):
                errs.append(
                    {
                        "id": r["id"],
                        "book": r["book"],
                        "gold": names(r["tokens"], r["labels"]),
                        "pred": names(r["tokens"], preds[r["id"]]),
                        "text": " ".join(r["tokens"]),
                    }
                )
        errors[name] = errs[: args.errors]

    print(json.dumps(results, ensure_ascii=False, indent=2))
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps({"scores": results, "errors": errors}, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
