"""Download the pinned hadith corpus and read every isnad with the trained tagger (offline, ONNX int8, CPU).

Source: https://github.com/fawazahmed0/hadith-api at the pinned commit (Arabic editions `ara-<book>`).
The corpus is NOT hand-copied: it is fetched as is, its SHA-256 is recorded, and nothing in it is edited.
Output (git-ignored): corpus/raw/<book>.min.json and corpus/names/<book>.jsonl with, per hadith,
the narrator names the model found before the Prophet ﷺ is mentioned (folded, in order).

    python ml/index_corpus.py --model ml/out/best --onnx ml/out/sanad-ner-onnx/onnx/model_quantized.onnx
"""

import argparse
import hashlib
import json
import sys
import time
import urllib.request
from pathlib import Path

import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tokenize_words import tokenize  # noqa: E402

PIN = "df57907be35291c91ad6a6691180e22ca9920784"
BOOKS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "malik"]
MAX_WORDS = 90  # the isnad is at the start; longer texts are cut (the matn is not needed)
LABELS = ["O", "B-NAR", "I-NAR"]
MAX_NAMES = 16


def fetch(book: str, raw: Path) -> Path:
    path = raw / f"{book}.min.json"
    if not path.exists():
        url = f"https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@{PIN}/editions/ara-{book}.min.json"
        req = urllib.request.Request(url, headers={"user-agent": "sanad-corpus-build"})
        with urllib.request.urlopen(req, timeout=120) as r:
            path.write_bytes(r.read())
    return path


def prophet_index(words: list[str]) -> int:
    """First word where the Prophet ﷺ is mentioned («رسول الله», «النبي»): the isnad ends before it."""
    for i, w in enumerate(words):
        if (w == "رسول" and i + 1 < len(words) and words[i + 1] == "الله") or w in ("النبي", "نبي"):
            return i
    return len(words)


def names_from(words: list[str], labels: list[str]) -> list[str]:
    end = prophet_index(words)
    out, cur = [], []
    for i in range(min(end, len(words))):
        l = labels[i]
        if l == "B-NAR" or (l == "I-NAR" and not cur):
            if cur:
                out.append(" ".join(cur))
            cur = [words[i]]
        elif l == "I-NAR":
            cur.append(words[i])
        elif cur:
            out.append(" ".join(cur))
            cur = []
    if cur:
        out.append(" ".join(cur))
    return out[:MAX_NAMES]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", type=Path, default=Path("ml/out/best"))
    ap.add_argument("--onnx", type=Path, default=Path("ml/out/sanad-ner-onnx/onnx/model_quantized.onnx"))
    ap.add_argument("--out", type=Path, default=Path("corpus"))
    ap.add_argument("--books", nargs="*", default=BOOKS)
    ap.add_argument("--batch", type=int, default=64)
    args = ap.parse_args()

    raw, names_dir = args.out / "raw", args.out / "names"
    raw.mkdir(parents=True, exist_ok=True)
    names_dir.mkdir(parents=True, exist_ok=True)
    tok = AutoTokenizer.from_pretrained(args.model)
    so = ort.SessionOptions()
    so.intra_op_num_threads = 16
    sess = ort.InferenceSession(str(args.onnx), so, providers=["CPUExecutionProvider"])
    input_names = {i.name for i in sess.get_inputs()}

    for book in args.books:
        t0 = time.time()
        path = fetch(book, raw)
        sha = hashlib.sha256(path.read_bytes()).hexdigest()
        data = json.loads(path.read_text(encoding="utf-8"))
        hadiths = data["hadiths"]
        words_all = [tokenize(h["text"])[:MAX_WORDS] for h in hadiths]
        order = sorted(range(len(hadiths)), key=lambda i: len(words_all[i]))  # similar lengths per batch
        result: dict[int, list[str]] = {}
        for s in range(0, len(order), args.batch):
            idx = order[s : s + args.batch]
            batch_words = [words_all[i] or ["."] for i in idx]
            enc = tok(batch_words, is_split_into_words=True, truncation=True, max_length=256, padding=True, return_tensors="np")
            feeds = {k: enc[k].astype(np.int64) for k in enc.keys() if k in input_names}
            pred = sess.run(None, feeds)[0].argmax(-1)
            for b, i in enumerate(idx):
                labels = ["O"] * len(batch_words[b])
                prev = None
                for pos, wid in enumerate(enc.word_ids(b)):
                    if wid is not None and wid != prev:
                        labels[wid] = LABELS[pred[b][pos]]
                    prev = wid
                for j, l in enumerate(labels):  # an I-NAR that does not follow a name starts one
                    if l == "I-NAR" and (j == 0 or labels[j - 1] == "O"):
                        labels[j] = "B-NAR"
                result[i] = names_from(batch_words[b], labels)
        with (names_dir / f"{book}.jsonl").open("w", encoding="utf-8") as f:
            for i, h in enumerate(hadiths):
                f.write(json.dumps({"n": h["hadithnumber"], "a": h.get("arabicnumber"), "names": result[i]}, ensure_ascii=False) + "\n")
        print(f"{book}: {len(hadiths)} hadiths, sha256 {sha[:12]}, {time.time() - t0:.0f}s", flush=True)
        (names_dir / f"{book}.sha256").write_text(sha, encoding="utf-8")


if __name__ == "__main__":
    main()
