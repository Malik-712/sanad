"""Turn Sanadset 650K into word-level BIO labels, split by book.

Sanadset marks narrators inline in the `Hadith` column:
    حدثنا <SANAD> <NAR> name </NAR> ، عن <NAR> name </NAR> </SANAD> <MATN> ... </MATN>
so labels come from the tags, not from fuzzy alignment. Words inside <NAR> are B-NAR / I-NAR, the rest O.
<IDF> (e.g. «يعني» inside a name) is kept as part of the name.

Usage:
    python ml/prepare_data.py --inspect
    python ml/prepare_data.py --out ml/data/splits --test-size 300 --dev-ratio 0.05 --max-train 100000 --seed 42
"""

import argparse
import json
import random
import re
import sys
from collections import Counter
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tokenize_words import tokenize  # noqa: E402

RAW = Path(__file__).resolve().parent / "data" / "raw" / "sanadset.csv"
TAG = re.compile(r"(</?(?:SANAD|NAR|MATN|IDF)>)")
MATN_CONTEXT = 8  # words of matn kept after the isnad (all O), so the model learns where the isnad ends
TEST_POOL_MIN = 3000  # held-out books are added until their pool has at least this many isnads
CHUNK = 50_000


def to_record(hadith: str):
    """Return (tokens, labels) for the first isnad, or None if the tags are missing or unbalanced."""
    if hadith.count("<SANAD>") != 1 or hadith.count("</SANAD>") != 1:
        return None
    if hadith.count("<NAR>") == 0 or hadith.count("<NAR>") != hadith.count("</NAR>"):
        return None
    head, _, tail = hadith.partition("</SANAD>")
    tokens: list[str] = []
    labels: list[str] = []
    in_nar = False
    start_of_name = False
    for part in TAG.split(head):
        if part == "<NAR>":
            if in_nar:
                return None
            in_nar, start_of_name = True, True
        elif part == "</NAR>":
            if not in_nar:
                return None
            in_nar = False
        elif part in ("<SANAD>", "</SANAD>", "<IDF>", "</IDF>", "<MATN>", "</MATN>"):
            continue
        else:
            for tok in tokenize(part):
                tokens.append(tok)
                if in_nar:
                    labels.append("B-NAR" if start_of_name else "I-NAR")
                    start_of_name = False
                else:
                    labels.append("O")
    if in_nar or "B-NAR" not in labels:
        return None
    matn = TAG.sub(" ", tail)
    for tok in tokenize(matn)[:MATN_CONTEXT]:
        tokens.append(tok)
        labels.append("O")
    return tokens, labels


def read_chunks(path: Path):
    yield from pd.read_csv(path, usecols=["Hadith", "Book"], chunksize=CHUNK, dtype=str)


def inspect(path: Path) -> None:
    head = pd.read_csv(path, nrows=5, dtype=str)
    print("columns:", list(head.columns))
    print(head.dtypes)
    print(head.head(5))
    rows = sum(len(c) for c in read_chunks(path))
    print("rows:", rows)


def write_jsonl(path: Path, records: list[dict]) -> None:
    with path.open("w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", type=Path, default=RAW)
    ap.add_argument("--inspect", action="store_true")
    ap.add_argument("--out", type=Path, default=Path("ml/data/splits"))
    ap.add_argument("--test-size", type=int, default=300)
    ap.add_argument("--dev-ratio", type=float, default=0.05)
    ap.add_argument("--max-train", type=int, default=100_000)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    if args.inspect:
        inspect(args.raw)
        return

    rng = random.Random(args.seed)

    # Pass 1: isnads per book (rows that have an isnad tag).
    per_book: Counter[str] = Counter()
    rows_read = 0
    for ch in read_chunks(args.raw):
        rows_read += len(ch)
        has = ch["Hadith"].fillna("").str.contains("<SANAD>", regex=False)
        per_book.update(ch.loc[has, "Book"].fillna("?"))

    # Choose books: test first (held out), then dev (~dev_ratio of isnads), the rest is train.
    books = sorted(per_book)
    rng.shuffle(books)
    test_books: set[str] = set()
    dev_books: set[str] = set()
    pool = 0
    total = sum(per_book.values())
    it = iter(books)
    for b in it:
        test_books.add(b)
        pool += per_book[b]
        if pool >= TEST_POOL_MIN:
            break
    dev_count = 0
    for b in it:
        if dev_count >= args.dev_ratio * total:
            break
        dev_books.add(b)
        dev_count += per_book[b]
    train_books = set(books) - test_books - dev_books
    train_total = sum(per_book[b] for b in train_books)
    keep_p = min(1.0, 1.15 * args.max_train / max(train_total, 1))

    # Pass 2: build records.
    splits: dict[str, list[dict]] = {"train": [], "dev": [], "test": []}
    seen_rows = kept_rows = 0
    for ch in read_chunks(args.raw):
        for i, (hadith, book) in enumerate(zip(ch["Hadith"].fillna(""), ch["Book"].fillna("?"))):
            if "<SANAD>" not in hadith:
                continue
            split = "test" if book in test_books else "dev" if book in dev_books else "train"
            if split == "train" and rng.random() > keep_p:
                continue
            seen_rows += 1
            rec = to_record(hadith)
            if rec is None:
                continue
            kept_rows += 1
            tokens, labels = rec
            splits[split].append({"id": f"{split}-{ch.index[i]}", "book": book, "tokens": tokens, "labels": labels})

    # Test: 300 isnads from the held-out books. Then remove exact duplicates across splits.
    rng.shuffle(splits["test"])
    test_keys: set[str] = set()
    test: list[dict] = []
    for r in splits["test"]:
        key = " ".join(r["tokens"])
        if key not in test_keys:
            test_keys.add(key)
            test.append(r)
        if len(test) == args.test_size:
            break
    dev_keys: set[str] = set()
    dev: list[dict] = []
    for r in splits["dev"]:
        key = " ".join(r["tokens"])
        if key not in test_keys and key not in dev_keys:
            dev_keys.add(key)
            dev.append(r)
    train_keys: set[str] = set()
    train: list[dict] = []
    removed_dups = 0
    for r in splits["train"]:
        key = " ".join(r["tokens"])
        if key in test_keys or key in dev_keys or key in train_keys:
            removed_dups += 1
            continue
        train_keys.add(key)
        train.append(r)
    rng.shuffle(train)
    train = train[: args.max_train]

    final = {"train": train, "dev": dev, "test": test}
    args.out.mkdir(parents=True, exist_ok=True)
    for name, recs in final.items():
        write_jsonl(args.out / f"{name}.jsonl", recs)

    keys = {n: {" ".join(r["tokens"]) for r in recs} for n, recs in final.items()}
    books_of = {n: {r["book"] for r in recs} for n, recs in final.items()}
    lengths = sorted(len(r["tokens"]) for r in train)
    p95 = lengths[int(0.95 * (len(lengths) - 1))] if lengths else 0
    stats = {
        "rows_read": rows_read,
        "rows_with_isnad": total,
        "isnads_parsed": seen_rows,
        "kept_after_tag_check": kept_rows,
        "kept_rate_of_parsed": round(kept_rows / max(seen_rows, 1), 4),
        "note": "kept_rate is over the rows actually parsed (train rows are sampled first to stay near max_train).",
        "records": {n: len(r) for n, r in final.items()},
        "books": {n: len(b) for n, b in books_of.items()},
        "book_overlap": len(books_of["train"] & books_of["test"])
        + len(books_of["train"] & books_of["dev"])
        + len(books_of["dev"] & books_of["test"]),
        "dup_overlap": len(keys["train"] & keys["test"]) + len(keys["train"] & keys["dev"]) + len(keys["dev"] & keys["test"]),
        "duplicates_removed_from_train": removed_dups,
        "p95_words": p95,
        "matn_context_words": MATN_CONTEXT,
        "seed": args.seed,
    }
    (args.out / "stats.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(stats, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
