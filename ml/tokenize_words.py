"""Python twin of lib/parser/tokenize.ts. Checked against tests/fixtures/tokenize-cases.json."""

import re

from normalize import normalize_arabic

PUNCT = re.compile("([،,:؛;.!?؟\"«»()\\[\\]{}\\-–—*'“”])")


def tokenize(text: str) -> list[str]:
    out: list[str] = []
    for word in text.split():
        for piece in PUNCT.split(word):
            if piece:
                norm = normalize_arabic(piece)
                if norm:
                    out.append(norm)
    return out
