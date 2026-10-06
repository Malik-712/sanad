"""Python twin of lib/arabic/normalize.ts. Both must give the same output on tests/fixtures/normalize-cases.json."""

import re
import unicodedata

MARKS = re.compile("[ؐ-ًؚ-ٰٟۖ-ۭـ]")
FOLDS = [
    (re.compile("[أإآٱ]"), "ا"),  # أ إ آ ٱ -> ا
    (re.compile("ى"), "ي"),  # ى -> ي
    (re.compile("ة"), "ه"),  # ة -> ه
    (re.compile("ؤ"), "و"),  # ؤ -> و
    (re.compile("ئ"), "ي"),  # ئ -> ي
]
HONORIFIC_SIGNS = re.compile("[﵀-﵏ﷺ]")
# Matched after folding (so ى -> ي and no diacritics), as in the TypeScript version.
HONORIFIC_PHRASES = re.compile(
    r"(?:^|\s)(?:صلي الله عليه وسلم|رضي الله عنهما|رضي الله عنها|رضي الله عنه)(?=\s|$)"
)
SPACES = re.compile(r"\s+")


def normalize_arabic(text: str, strip_honorifics: bool = False) -> str:
    out = unicodedata.normalize("NFC", text)
    if strip_honorifics:
        out = HONORIFIC_SIGNS.sub(" ", out)
    out = MARKS.sub("", out)
    for pattern, repl in FOLDS:
        out = pattern.sub(repl, out)
    out = SPACES.sub(" ", out).strip()
    if strip_honorifics:
        out = SPACES.sub(" ", HONORIFIC_PHRASES.sub(" ", out)).strip()
    return out


def strip_honorifics(text: str) -> str:
    return normalize_arabic(text, strip_honorifics=True)
