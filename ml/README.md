# ml/ — narrator tagger (trained and measured, not shipped)

Everything here runs on a laptop CPU (no GPU needed). Results are in `docs/EVALUATION.md`.
The trained model is **not** shipped on the site: the Sanadset licence is unclear (owner decision 6 Oct, `docs/SOURCES_LOG.md`); the live `/parse` page runs the rule parser `lib/parser/ruleParser.ts`.

## Setup (Windows PowerShell, repo root)

```powershell
python -m venv ml\.venv
ml\.venv\Scripts\python -m pip install -r ml\requirements.txt
ml\.venv\Scripts\python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
ml\.venv\Scripts\python -m pip install -r ml\requirements-train.txt
```

Download Sanadset 650K from https://data.mendeley.com/datasets/5xth87zwb5 into `ml\data\raw\sanadset.csv` (git-ignored).

## Steps

```powershell
# 0. Twin tests: Python normaliser/tokeniser == TypeScript (shared fixtures in tests/fixtures/)
ml\.venv\Scripts\python -m pytest ml\tests -q
pnpm vitest run lib/arabic lib/parser

# 1. Data: columns first, then the splits by book (writes ml/data/splits/{train,dev,test}.jsonl + stats.json), ~2 min
ml\.venv\Scripts\python -X utf8 ml\prepare_data.py --inspect
ml\.venv\Scripts\python -X utf8 ml\prepare_data.py --out ml\data\splits --test-size 300 --dev-ratio 0.05 --max-train 100000 --seed 42

# 2. Baseline predictions (rule parser)
pnpm tsx scripts/eval-baseline.ts --in ml/data/splits/test.jsonl --out ml/preds/baseline.test.jsonl

# 3. Train (~28 min on 16 CPU threads), then predict
ml\.venv\Scripts\python -X utf8 ml\train.py --data ml\data\splits --model asafaya/bert-mini-arabic --out ml\out --seed 42
ml\.venv\Scripts\python -X utf8 ml\predict.py --model ml\out\best --in ml\data\splits\test.jsonl --out ml\preds\model.test.jsonl

# 4. Export to ONNX int8 (parity >= 99 % on 50 test isnads, size <= 30 MB), and score the exported file
ml\.venv\Scripts\python -X utf8 ml\export_onnx.py --model ml\out\best --out ml\out\sanad-ner-onnx --parity 50
ml\.venv\Scripts\python -X utf8 ml\predict.py --model ml\out\best --onnx ml\out\sanad-ner-onnx\onnx\model_quantized.onnx --in ml\data\splits\test.jsonl --out ml\preds\model_int8.test.jsonl

# 5. Scores (seqeval entity P/R/F1 + exact chain match) and error examples
ml\.venv\Scripts\python -X utf8 ml\evaluate.py --gold ml\data\splits\test.jsonl --pred baseline=ml\preds\baseline.test.jsonl --pred model=ml\preds\model.test.jsonl --pred model_int8=ml\preds\model_int8.test.jsonl --errors 10 --json ml\preds\test-scores.json

# 6. Real routes in data/ (row b): rules end to end, and the model on the same words
pnpm tsx scripts/eval-e2e.ts --export ml/data/routes.jsonl
ml\.venv\Scripts\python -X utf8 ml\predict.py --model ml\out\best --onnx ml\out\sanad-ner-onnx\onnx\model_quantized.onnx --in ml\data\routes.jsonl --out ml\preds\model.routes.jsonl
pnpm tsx scripts/eval-e2e.ts --model ml/preds/model.routes.jsonl --write docs/EVALUATION.md
```

## Files

| File | What it does |
| --- | --- |
| `normalize.py`, `tokenize_words.py` | Python twins of `lib/arabic/normalize.ts` and `lib/parser/tokenize.ts` |
| `prepare_data.py` | Sanadset → word-level BIO labels from the inline `<NAR>` tags, split by book |
| `train.py` | Fine-tunes the tagger; early stopping on dev F1; writes `ml/out/best/` and `ml/out/train_log.json` |
| `predict.py` | Word labels for a split (PyTorch, or the exported ONNX file with `--onnx`) |
| `evaluate.py` | seqeval scores, exact chain match, error examples |
| `export_onnx.py` | ONNX export, dynamic int8 quantisation, parity check, size |
| `tests/test_normalize_twin.py` | Twin tests against `tests/fixtures/*.json` |

Seed 42 everywhere. `ml/data/`, `ml/out/` and `ml/preds/` are git-ignored.
