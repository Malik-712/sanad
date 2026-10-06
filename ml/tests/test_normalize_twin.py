"""The Python normaliser must give the same output as lib/arabic/normalize.ts on the shared fixture."""

import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "ml"))

from normalize import normalize_arabic, strip_honorifics  # noqa: E402
from tokenize_words import tokenize  # noqa: E402

FIXTURES = ROOT / "tests" / "fixtures"
CASES = json.loads((FIXTURES / "normalize-cases.json").read_text(encoding="utf-8"))
TOKEN_CASES = json.loads((FIXTURES / "tokenize-cases.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("case", CASES, ids=[str(i) for i in range(len(CASES))])
def test_twin(case):
    assert normalize_arabic(case["input"]) == case["normalized"]
    assert strip_honorifics(case["input"]) == case["stripped"]


@pytest.mark.parametrize("case", TOKEN_CASES, ids=[str(i) for i in range(len(TOKEN_CASES))])
def test_tokenize_twin(case):
    assert tokenize(case["input"]) == case["tokens"]
