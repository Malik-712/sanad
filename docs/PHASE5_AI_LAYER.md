# Phase 5 — AI Layer (Sessions C + D)

> Engineering spec for the AI part of Sanad: a narrator tagger trained on Sanadset, a rule-based baseline that is also the fallback, an in-browser runtime, a narrator linker with confidence levels, and a hard-cases file.
> This file replaces the "Session C" and "Session D" sections of `docs/IMPLEMENTATION.md`. Where they differ, this file wins.

|                             |                                                                                                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Window (adjusted)**       | Session C: Mon 5 Oct 16:30–23:00 · Session D: Mon 23:00 → Tue 6 Oct 03:00 (Riyadh)                                                                                          |
| **Owner**                   | Malik (decisions, downloads, Colab clicks, checks) · Claude Code (code, docs, tests)                                                                                        |
| **Inputs**                  | `CLAUDE.md`, `docs/PROGRESS.md`, Sessions A+B merged, data-track files (for Session D)                                                                                      |
| **Judging criteria served** | Technical quality 25% · Benefit 20% · Reliability 15% · Cost 10%                                                                                                            |
| **Hard rules**              | No pasted text leaves the browser. ML output is always labelled as automatic. Low confidence → «يحتاج تحققًا». No record → «لا مصدر بعد». Numbers are reported as measured. |

---

## 1. Requirements

### Functional

- **F1.** Given an Arabic isnad (pasted text), return the narrator names in order, together with the transmission words (sighas) between them.
- **F2.** Link each name to a record in `data/narrators.json`, with a confidence score and one of three states:
  - high
  - needs checking, with candidate choices to pick from
  - no record
- **F3.** Compare the linked chain with every route in `data/`. On a match, show «وجدناه في شجرة …» with a link to `/hadith/<id>?route=<routeId>`.
- **F4.** If the model cannot load, use the rule parser, and say so on screen.

### Non-functional

| ID  | Requirement       | Target                                        | How we measure                                |
| --- | ----------------- | --------------------------------------------- | --------------------------------------------- |
| N1  | Privacy           | 0 network requests that contain pasted text   | Playwright request spy                        |
| N2  | Model size        | ≤ 30 MB on disk (expect ~12 MB int8)          | `Measure-Object` on `public/models/sanad-ner` |
| N3  | Model load        | ≤ 15 s, else fallback                         | Timer in `client.ts`                          |
| N4  | Inference         | ≤ 500 ms per isnad on a laptop CPU            | `performance.now()` log in dev                |
| N5  | Determinism       | 3 runs → identical output                     | SHA-256 of outputs, `pnpm hardcases`          |
| N6  | Running cost      | 0 (static files, no API, no server GPU)       | Vercel Hobby, no API routes                   |
| N7  | Honest evaluation | Held-out books, fixed seed, baseline vs model | `docs/EVALUATION.md`                          |
| N8  | Training time     | ≤ 45 min on a free T4                         | Colab cell timer                              |

### Constraints

- One builder. About 10.5 hours in total for both sessions.
- No paid API key. Claude Pro only. Free Colab or Kaggle GPU.
- Windows + PowerShell, Node 24, pnpm.
- Static Next.js on Vercel Hobby.

---

## 2. Architecture

### 2.1 Offline pipeline (Session C, runs once)

```
Sanadset 650K (CSV, Mendeley)          asafaya/bert-mini-arabic (HF)
        │                                         │
        ▼                                         │
ml/prepare_data.py ──► splits/{train,dev,test}.jsonl   (BIO labels, split BY BOOK, test = 300)
        │                       │                 │
        │                       ▼                 ▼
        │            scripts/eval-baseline.ts   ml/train.py  (Colab T4, seed 42, early stop on dev F1)
        │            (lib/parser/ruleParser)      │
        │                       │                 ├──► ml/out/best/   (PyTorch checkpoint)
        │                       ▼                 ▼
        │        preds/baseline.test.jsonl   preds/model.test.jsonl
        │                       └───────┬─────────┘
        │                               ▼
        │                      ml/evaluate.py ──► docs/EVALUATION.md   (P / R / F1 + exact chain match)
        ▼
ml/export_onnx.py ──► public/models/sanad-ner/{config.json, tokenizer*, onnx/model_quantized.onnx}
                      (int8, parity ≥ 99% vs PyTorch on 50 isnads)
```

### 2.2 Runtime pipeline (Session D, in the browser, on `/parse` only)

```
 textarea ──► input rules (empty / > 2,000 chars / not an isnad)
                │
                ▼
          lib/ml/client.ts ──postMessage──► lib/ml/worker.ts  (Web Worker)
                │                               │  Transformers.js, token-classification, dtype q8, WASM
                │                               │  loads /models/sanad-ner once (cached, immutable)
                │◄───── tokens + labels ────────┘
                │   (on error or after 15 s ──► lib/parser/ruleParser.ts  + banner «تعمل الآن الطريقة البديلة (القواعد)»)
                ▼
          group B-NAR / I-NAR spans  ──►  names[] + sighas[]
                ▼
          lib/linker/linker.ts   (aliases → Jaro-Winkler → context rerank)  ──►  LinkResult[]
                ▼
          chain match against data/hadiths/*.json  ──►  match card / no match
                ▼
          UI: ChainList + NarratorChip (confidence badge) + «سفيان» chooser
```

Nothing in this pipeline calls a server. The model files are static assets.

### 2.3 Contracts (types)

```ts
// ml/data/splits/*.jsonl — one record per line
type TokenRecord = {
  id: string;
  book: string;
  tokens: string[];
  labels: ("B-NAR" | "I-NAR" | "O")[];
};

// ml/preds/*.jsonl — same ids, predicted labels (baseline and model share this format)
type PredRecord = { id: string; labels: ("B-NAR" | "I-NAR" | "O")[] };

// lib/parser + lib/ml output
type ParseResult = {
  engine: "model" | "rules"; // shown in the UI as «استخراج آلي» + which method
  names: { text: string; start: number; end: number; score?: number }[];
  sighas: string[]; // length = names.length - 1 (may contain "" if unknown)
};

// lib/linker output, one per name
type LinkResult = {
  name: string;
  state: "high" | "check" | "none"; // UI: مصدر موثق* / يحتاج تحققًا / لا مصدر بعد
  best?: { narratorId: string; score: number };
  candidates: { narratorId: string; score: number }[]; // top 3, shown as buttons when state = "check"
};
// *"high" only means the link is confident. The badge «مصدر موثق» still requires verification.status === "verified".
```

---

## 3. Work breakdown

Each part lists: who does it, files, skills/tools, commands, and "Done when". Commands are for **Windows PowerShell** from the repo root, unless they are marked _Colab_.

**Skills legend**

- **[CC]** = Claude Code built-in: plan mode (`claude --permission-mode plan`, Shift+Tab), `/clear` between sessions, `!` to run a shell command inside Claude Code.
- **[Proj]** = project skills from `CLAUDE.md`: `frontend-design`, `vercel-react-best-practices`, `web-design-guidelines`, `webapp-testing`.
- **[Opt]** = optional, only if the engineering plugin is enabled in Claude Code: `/engineering:code-review`, `/engineering:testing-strategy`, `/engineering:debug`.
- **[Chat]** = Claude in the chat (claude.ai): Shamela library connector, web research, reviewing plans.

---

### 5.1 Check the licences of Sanadset and BERT-mini, and log them — _Session C · 16:30–16:45_

|        |                                                                               |
| ------ | ----------------------------------------------------------------------------- |
| Who    | Malik opens the pages and reads the licence. Claude Code writes the log rows. |
| Files  | `docs/SOURCES_LOG.md`                                                         |
| Skills | [CC] plan mode · [Chat] to read a licence text if it is unclear               |

**Sources to open**

- Sanadset 650K: `https://data.mendeley.com/datasets/5xth87zwb5` (DOI 10.17632/5xth87zwb5)
- Base model: `https://huggingface.co/asafaya/bert-mini-arabic`
  **Log rows** (one per asset): `type | name | link | purpose | date | licence | allows research + derived model? (yes/no/unclear)`

```powershell
git add docs/SOURCES_LOG.md
git commit -m "docs: record Sanadset and bert-mini-arabic licences"
```

**Gate.** If a licence is missing, unclear, or forbids this use → **stop**. Malik decides. The options are:

- (a) ask a mentor;
- (b) pick another base model with a clear licence, and accept a larger size;
- (c) ship the rule parser as the main engine, and report the model as "trained, not shipped".
  **Done when**
- [ ] Two rows in `SOURCES_LOG.md`, each with an exact licence name and a link.
- [ ] The gate decision is written in `docs/PROGRESS.md`.

---

### 5.2 Turn Sanadset into word-level labels, split by book (train + 300-isnad test) — _Session C · 16:45–18:00_

|        |                                                                                                                                                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Who    | Malik downloads the dataset. Claude Code writes and runs the script.                                                                                                                                                                        |
| Files  | `ml/requirements.txt`, `ml/prepare_data.py`, `ml/normalize.py` (Python twin of `lib/arabic/normalize.ts`), `ml/tests/test_normalize_twin.py`, `tests/fixtures/normalize-cases.json` (shared by Vitest and pytest), `ml/data/` (git-ignored) |
| Skills | [CC] plan mode, `!` shell · [Opt] `/engineering:testing-strategy` for the twin test                                                                                                                                                         |

**Setup (one time)**

```powershell
python --version                      # need 3.10+. If missing: winget install Python.Python.3.12
python -m venv ml\.venv
Set-ExecutionPolicy -Scope Process Bypass
ml\.venv\Scripts\Activate.ps1
pip install -r ml\requirements.txt    # pandas, datasets, seqeval, pytest
```

**Steps**

1. Malik downloads the Sanadset files from Mendeley into `ml\data\raw\`. Check that `.gitignore` contains `ml/data/`.
2. Inspect before coding. Never assume column names:
   ```powershell
   python ml\prepare_data.py --inspect      # prints columns, dtypes, 5 rows, row count; then exits
   ```
3. Normalisation twin. One fixture file, two test runners, same expected output:
   ```powershell
   pnpm vitest run lib/arabic
   python -m pytest ml\tests\test_normalize_twin.py -q
   ```
4. Build the splits:
   ```powershell
   python ml\prepare_data.py --out ml\data\splits --test-size 300 --dev-ratio 0.05 --max-train 100000 --seed 42
   ```

   - Take only the isnad part of each record. Normalise it. Align each listed narrator, in order, to a token span. Label `B-NAR` / `I-NAR` / `O`. Keep only fully aligned records.
   - **Split by book**: no book appears in two splits. Remove exact duplicate isnads across splits.
   - Write `ml/data/splits/stats.json` with: rows read, alignment rate, records per split, books per split, `book_overlap: 0`, `dup_overlap: 0`, and the 95th-percentile token length (`max_len`, capped at 256).
     **Done when**

- [ ] `stats.json` shows `book_overlap = 0` and `dup_overlap = 0`, and `test = 300`.
- [ ] The alignment rate is reported (any value; it is never hidden).
- [ ] The twin test passes in both Vitest and pytest.
  > **No local Python?** Run steps 2–4 as the first cells of the Colab notebook (5.4) instead, then download `splits/` back.

---

### 5.3 Rule-based baseline parser, evaluated on the test set — _Session C · 18:00–19:00 (runs while Colab trains)_

|        |                                                                                              |
| ------ | -------------------------------------------------------------------------------------------- |
| Who    | Claude Code                                                                                  |
| Files  | `lib/parser/ruleParser.ts` (+ `ruleParser.test.ts`), `scripts/eval-baseline.ts`, `ml/preds/` |
| Skills | [CC] plan mode · [Opt] `/engineering:code-review` before the commit                          |

**Design**

- Split on transmission words: حدثنا، حدثني، أخبرنا، أخبرني، أنبأنا، ثنا، نا، أنا، سمعت، سمع، عن، أن، قال، يقول. Treat «ح» as tahwil (a new branch).
- Strip honorifics. Return a `ParseResult` with `engine: "rules"`.
- For evaluation, map the spans back to BIO labels on the same tokens as `test.jsonl`, so that baseline and model are scored the same way.

```powershell
pnpm add -D tsx
pnpm vitest run lib/parser
pnpm tsx scripts/eval-baseline.ts --in ml\data\splits\test.jsonl --out ml\preds\baseline.test.jsonl
git add lib/parser scripts/eval-baseline.ts
git commit -m "feat(parser): rule-based isnad parser (baseline + fallback)"
```

**Done when**

- [ ] Unit tests cover all transmission words, «ح», honorifics, full tashkeel and empty input.
- [ ] `baseline.test.jsonl` has 300 lines, with the same ids as `test.jsonl`.

---

### 5.4 Fine-tune BERT-mini, evaluate both on the same set, save results to `docs/EVALUATION.md` — _Session C · 19:00–21:00_

|        |                                                                                                                                    |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Who    | Claude Code writes the code. Malik runs it on Colab (or Kaggle).                                                                   |
| Files  | `ml/train.py`, `ml/predict.py`, `ml/train.ipynb` (thin wrapper that calls the two scripts), `ml/evaluate.py`, `docs/EVALUATION.md` |
| Skills | [CC] plan mode · [Opt] `/engineering:debug` if training fails · [Chat] to read a Colab error                                       |

**Training config (fixed, written into `train.py`)**

| Setting             | Value                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Base                | `asafaya/bert-mini-arabic` (unless the gate in 5.1 changed it)                                   |
| Task                | Token classification, labels `O, B-NAR, I-NAR`; label on the first sub-token, `-100` on the rest |
| `max_len`           | from `stats.json` (p95, ≤ 256)                                                                   |
| LR / batch / epochs | 5e-5 / 32 / ≤ 3, fp16                                                                            |
| Early stopping      | on dev entity F1, patience 1                                                                     |
| Seed                | 42 (Python, NumPy, torch)                                                                        |
| Budget              | ≤ 45 min on a T4. If one epoch takes more than 15 min, lower `--max-train` and log it            |

**Colab steps** (Malik)

1. Upload `ml/train.py`, `ml/predict.py`, `ml/requirements-train.txt` and `splits.zip` to Google Drive → `MyDrive/sanad/`.
2. In Colab: _Runtime → Change runtime type → T4 GPU_. Open `train.ipynb` and click _Run all_. The notebook runs:
   ```bash
   # Colab
   !nvidia-smi
   from google.colab import drive; drive.mount('/content/drive')
   %cd /content/drive/MyDrive/sanad
   !unzip -oq splits.zip -d splits
   !pip -q install -r requirements-train.txt     # transformers, datasets, accelerate, seqeval
   !python train.py   --data splits --model asafaya/bert-mini-arabic --out out --seed 42
   !python predict.py --model out/best --in splits/test.jsonl --out preds/model.test.jsonl
   ```
3. Download `out/best/` → `ml\out\best\`, and `preds/model.test.jsonl` → `ml\preds\`. Neither is committed: `ml/out/` is git-ignored, and only the exported ONNX is shipped.
   **Evaluate (local, CPU)**

```powershell
python ml\evaluate.py --gold ml\data\splits\test.jsonl `
  --pred baseline=ml\preds\baseline.test.jsonl `
  --pred model=ml\preds\model.test.jsonl `
  --errors 10 --out docs\EVALUATION.md
git add ml/*.py ml/train.ipynb ml/requirements*.txt docs/EVALUATION.md
git commit -m "feat(ml): train and evaluate narrator tagger vs baseline"
```

**`docs/EVALUATION.md` must contain:**

- The method: dataset, split by book, seed, sizes.
- A table with entity P / R / F1 (seqeval) and **exact chain match** for baseline and model on (a) the 300 held-out isnads. Row (b), the real routes in `data/`, is filled in Session D (5.6).
- 10 error examples, each with a one-line reason.
- Limits.
- Training time and hardware.
  **Done when**
- [ ] Both rows of table (a) are filled with the measured numbers (no rounding up, no hidden runs).
- [ ] The training log (loss, dev F1 per epoch) is saved to `ml/out/train_log.json` and summarised in EVALUATION.md.

---

### 5.5 Export to ONNX and run it in the browser, with the rule fallback — _C: 21:00–21:45 (export) · D: 23:20–00:30 (runtime)_

#### 5.5a Export (Session C)

|        |                                                                                                       |
| ------ | ----------------------------------------------------------------------------------------------------- |
| Files  | `ml/export_onnx.py`, `public/models/sanad-ner/`, `.gitignore` exception `!public/models/sanad-ner/**` |
| Skills | [CC] plan mode                                                                                        |

```powershell
pip install "optimum[onnxruntime]" onnx onnxruntime
python ml\export_onnx.py --model ml\out\best --out public\models\sanad-ner --parity 50
(Get-ChildItem public\models\sanad-ner -Recurse | Measure-Object Length -Sum).Sum / 1MB
git add public/models/sanad-ner ml/export_onnx.py .gitignore
git commit -m "feat(ml): export int8 ONNX model for Transformers.js"
```

- Export with Optimum (token classification), then apply dynamic int8 quantisation (`onnxruntime.quantization.quantize_dynamic`).
- Keep only `onnx/model_quantized.onnx`, `config.json` and the tokenizer files. Delete the fp32 file to stay small.
- Parity check: the ONNX and PyTorch labels agree on ≥ 99% of tokens across 50 test isnads. Print the result and save it in EVALUATION.md.

#### 5.5b Browser runtime (Session D)

|        |                                                                                                                                        |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Files  | `lib/ml/worker.ts`, `lib/ml/client.ts`, `components/parse/*`, `next.config.ts` (cache headers), `lib/copy/ar.ts`                       |
| Skills | [Proj] `frontend-design` + `vercel-react-best-practices` for the `/parse` UI, `web-design-guidelines` before the push · [CC] plan mode |

```powershell
pnpm add @huggingface/transformers
```

**Rules**

- `worker.ts`:
  - `env.allowRemoteModels = false`
  - `env.allowLocalModels = true`
  - `env.localModelPath = "/models/"`
  - `pipeline("token-classification", "sanad-ner", { dtype: "q8" })`
  - Group the `B-NAR`/`I-NAR` tokens into names ourselves. Do not rely on a library aggregation option.
- `client.ts`: start loading on the first visit to `/parse` only, and show progress. On an error, **or after 15 s**, switch to `ruleParser` and show «تعمل الآن الطريقة البديلة (القواعد)».
- Every result is labelled «استخراج آلي» and shows which engine produced it.
- `next.config.ts`: `Cache-Control: public, max-age=31536000, immutable` for `/models/:path*`.
- The model is never imported on `/`, `/hadith/*` or `/about`, to protect Lighthouse scores.
  **Test the fallback**
- Manual: DevTools → Network → Request blocking → `*/models/*` → reload `/parse`.
- Automatic: a Playwright test with `page.route("**/models/**", r => r.abort())` ([Proj] `webapp-testing`).
  **Done when**
- [ ] The model files are ≤ 30 MB and parity is ≥ 99% (both numbers recorded).
- [ ] On the live site, `/parse` loads the model, and the fallback works when `/models/` is blocked.

---

### 5.6 Link narrators with a confidence score — _Session D · 00:30–01:45_

|              |                                                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prerequisite | Data-track files are in `data/` and `pnpm validate:data` passes (Session D, first 20 min)                                                                         |
| Files        | `lib/linker/linker.ts`, `lib/linker/jaroWinkler.ts` (own ~30 lines, no dependency), `lib/linker/linker.test.ts`, `lib/isnad/chainMatch.ts`, `scripts/eval-e2e.ts` |
| Skills       | [CC] plan mode · [Opt] `/engineering:code-review` · [Proj] `webapp-testing` for the privacy test                                                                  |

**Algorithm**

1. **Candidates.** Normalise the extracted name.
   - An exact match on `nameAr` or `aliasesAr` scores 1.0.
   - Otherwise, use Jaro-Winkler on the normalised tokens (keep the top 5).
2. **Context rerank.** Add +0.10 (capped at 1.0) when the previous or next linked narrator is a known teacher or student of this candidate in `data/` (edges from `lib/isnad/graph.ts`).
3. **State.**
   | Condition | State | UI |
   | --- | --- | --- |
   | best ≥ 0.90 **and** (best − second) ≥ 0.10 | `high` | chip, linked to `/narrator/<id>` |
   | 0.60 ≤ best < 0.90, **or** top two within 0.10 | `check` | «يحتاج تحققًا» + candidate buttons (the «سفيان» chooser) |
   | best < 0.60 | `none` | «لا مصدر بعد» (grey) |

4. **Chain match** (`chainMatch.ts`). If every name is `high` (or chosen by the user) and the id sequence equals a route's `chain`, show «وجدناه في شجرة …» → `/hadith/<id>?route=<routeId>`.

```powershell
pnpm vitest run lib/linker lib/isnad
pnpm tsx scripts/eval-e2e.ts --out docs\EVALUATION.md     # fills row (b): data/ routes → parser/model → linker → exact chain match
pnpm test:e2e -- parse                                    # includes the privacy spy: no request body or URL contains the pasted text
git commit -m "feat(linker): narrator linking with confidence and chain match"
```

**Required tests**

- «سفيان بن عيينة / سفيان الثوري»: a bare «سفيان» → `check` with both as candidates; with a known neighbour → the right one ranks first.
- An unknown name → `none`.
- An alias written with full tashkeel → `high`.
- Thresholds on their exact edges: 0.60, 0.90, and a gap of 0.10.
  **Done when**
- [ ] Linker tests pass.
- [ ] Row (b) is in EVALUATION.md.
- [ ] The privacy test passes.
- [ ] On the live site, pasting a route from `data/` shows the right chain and the match card.

---

### 5.7 Hard-cases file, run 3 times, results must match — _Session D · 01:45–02:30_

|        |                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------ |
| Files  | `tests/hard-cases.json`, `scripts/hardcases.ts`, `docs/HARD_CASES.md` (the full write-up is finished in Session E) |
| Skills | [Opt] `/engineering:testing-strategy` · [CC] plan mode                                                             |

**At least 12 cases.** The four from the tracker come first:

1. An unknown narrator → `none`, and the chain continues.
2. A broken chain (a missing link) → no match card, and a gap shown.
3. Two people with one name (سفيان، حماد) → `check` with candidates.
4. Text that is not an isnad → the Arabic message, and no chips.
   Then:

5. Matn only.
6. An empty input.
7. More than 2,000 characters.
8. Full tashkeel.
9. Short forms (ثنا، نا، أنا).
10. Mixed honorifics.
11. «ح» (tahwil).
12. A very long isnad.
    All the cases are made-up or copied from `data/` with their source. No real user text.

```powershell
pnpm tsx scripts/hardcases.ts --runs 3 --engine rules
pnpm tsx scripts/hardcases.ts --runs 3 --engine model    # Node build of Transformers.js, same files
```

The script hashes each run's JSON output (SHA-256). It fails if the hashes differ, and writes a table to `docs/HARD_CASES.md`: case, expected, actual, pass/fail, hash.

**Done when**

- [ ] ≥ 12 cases.
- [ ] 3 runs give identical hashes for both engines.
- [ ] The table is written.

---

## 4. Timeline

| Time (Riyadh) | Part    | Malik                      | Claude Code                         |
| ------------- | ------- | -------------------------- | ----------------------------------- |
| 16:30–16:45   | 5.1     | Read licences, decide      | Log rows                            |
| 16:45–18:00   | 5.2     | Download Sanadset          | prepare_data, twin test             |
| 18:00–19:00   | 5.3     | Upload to Drive            | Rule parser + baseline preds        |
| 19:00–20:15   | 5.4     | Colab _Run all_ (≤ 45 min) | EVALUATION.md template              |
| 20:15–21:00   | 5.4     | Download model + preds     | evaluate.py, write numbers          |
| 21:00–21:45   | 5.5a    | —                          | Export ONNX, parity, size           |
| 21:45–23:00   | buffer  | Check numbers              | Push, update PROGRESS.md            |
| 23:00–23:20   | D start | Data-track files ready     | Swap in real data, validate         |
| 23:20–00:30   | 5.5b    | —                          | Worker, client, /parse UI, fallback |
| 00:30–01:45   | 5.6     | Test the «سفيان» case      | Linker, chain match, e2e eval       |
| 01:45–02:30   | 5.7     | —                          | Hard cases ×3                       |
| 02:30–03:00   | close   | Check live site            | Push, PROGRESS.md, Done-when report |

---

## 5. Architecture decisions (ADR summary)

### ADR-5.1 — Small fine-tuned encoder, not an LLM API

**Status:** Accepted · **Date:** 2026-10-05 · **Decider:** Malik

| Option                            | Cost                  | Privacy                  | Measurable                    | Fit to 2 days                        |
| --------------------------------- | --------------------- | ------------------------ | ----------------------------- | ------------------------------------ |
| **BERT-mini token classifier** ✅ | 0                     | Text stays on the device | Yes (seqeval, held-out books) | Yes                                  |
| LLM API (prompted extraction)     | Per call + key needed | Text leaves the device   | Hard to make deterministic    | No API key                           |
| Rules only                        | 0                     | On the device            | Yes                           | Yes, but no AI contribution to judge |

**Consequence:** we must report the model honestly against the baseline. If it does not beat the baseline, we say so and ship whichever is better.

### ADR-5.2 — Run inference in the browser (Transformers.js + Web Worker)

- **Chosen over** a serverless inference API on Vercel (cold starts, function size limits, the text would reach a server) and over the main thread (it would freeze the UI).
- **Consequence:** model size matters (≤ 30 MB, int8), and the first load is slow → we cache it and use a 15 s fallback.

### ADR-5.3 — The rule parser is both baseline and fallback

- One TypeScript module serves two jobs: an honest comparison point, and a safety net when the model fails.
- **Consequence:** it must have its own tests. It is never "throwaway".

### ADR-5.4 — Three linker states with fixed thresholds (0.90 / 0.60 / gap 0.10)

- Chosen over always picking the best candidate (a silent guess, which breaks scholarly rule 5).
- **Consequence:** more «يحتاج تحققًا» results. This is the intended behaviour, and the «سفيان» chooser makes it usable.

### ADR-5.5 — Split by book, test = 300 isnads, seed 42

- A random split would leak the same isnads and the same compiler style into the test set and inflate the scores.
- **Consequence:** lower but honest numbers.

---

## 6. Risks and the cut-scope ladder

| Risk                            | Signal                         | Action                                                                                                                                     |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Licence unclear                 | 5.1 gate                       | Options (a), (b) or (c) in 5.1                                                                                                             |
| Low alignment rate              | `stats.json` < 50%             | Keep only aligned records; report the rate; continue                                                                                       |
| Colab GPU unavailable or slow   | No T4, or > 15 min per epoch   | Kaggle notebook (same scripts), or lower `--max-train` to 50k                                                                              |
| Model ≤ baseline                | EVALUATION.md                  | Ship the better engine as the default; report both                                                                                         |
| Export or parity fails          | Parity < 99%                   | Ship the rule parser in the browser; keep the model numbers in the docs                                                                    |
| Transformers.js fails on Vercel | Console error on the live site | Fallback is automatic; fix in Session E                                                                                                    |
| Behind schedule                 | 23:00 and 5.5a not done        | Cut in this order: 5.7 runs on rules only → context rerank → model in browser. **Never cut:** baseline, evaluation, fallback, privacy test |

---

## 7. Prompts for Claude Code (copy as is)

**Start of Session C** (new session, plan mode):

```
claude --permission-mode plan
```

```
نفّذ الجلسة C من docs/PHASE5_AI_LAYER.md: البنود 5.1 و5.2 و5.3 و5.4 و5.5a فقط.
قبل أي شيء: اقرأ CLAUDE.md و docs/PROGRESS.md و docs/PHASE5_AI_LAYER.md كاملًا.
اعرض خطتك: الملفات، الحزم، الأوامر بالترتيب، ونقاط التوقف التي تحتاجني فيها (قرار الترخيص، تنزيل Sanadset، تشغيل Colab، تنزيل النموذج).
لا تفترض أسماء أعمدة البيانات؛ ابدأ بـ --inspect.
لا تبدأ التنفيذ قبل موافقتي، ولا تتجاوز حدود الجلسة C.
```

**Start of Session D** (after `/clear`, plan mode):

```
نفّذ الجلسة D من docs/PHASE5_AI_LAYER.md: إدخال البيانات الحقيقية، ثم 5.5b و5.6 و5.7.
اقرأ CLAUDE.md و docs/PROGRESS.md و docs/PHASE5_AI_LAYER.md أولًا.
تأكد أن pnpm validate:data ينجح على ملفات مسار البيانات قبل أي كود.
اعرض خطتك وانتظر موافقتي. لا تكتب أي اسم راوٍ أو إسناد من الذاكرة.
```

**End of each session:**

```
اعرض لي قائمة «Done when» لكل بند في هذه الجلسة من docs/PHASE5_AI_LAYER.md، مع ✅ أو ❌ لكل بند، والأرقام المقيسة، والرابط الحي.
أصلح أي ❌ إن أمكن، ثم حدّث docs/PROGRESS.md وقل لي ما الجلسة التالية.
```

---

## 8. Tracker mapping (Phase 5 checkboxes)

| Tracker item                                             | Part        | Proof                               |
| -------------------------------------------------------- | ----------- | ----------------------------------- |
| فحص ترخيصي Sanadset وBERT-mini وتسجيلهما                 | 5.1         | 2 rows in `SOURCES_LOG.md`          |
| تحويل Sanadset إلى وسوم والتقسيم بحسب الكتاب + ٣٠٠ إسناد | 5.2         | `stats.json`                        |
| محلل أساس قائم على القواعد وتقييمه                       | 5.3         | `baseline.test.jsonl` + tests       |
| الضبط الدقيق لـ BERT-mini وتقييمه وحفظ النتيجتين         | 5.4         | `docs/EVALUATION.md` table (a)      |
| التصدير إلى ONNX وتشغيله في المتصفح وبديل القواعد        | 5.5a + 5.5b | size + parity; fallback test        |
| ربط الرواة بدرجة ثقة                                     | 5.6         | linker tests; EVALUATION.md row (b) |
| ملف الحالات الصعبة ×٣ ويجب أن تتطابق                     | 5.7         | `docs/HARD_CASES.md` hashes         |
