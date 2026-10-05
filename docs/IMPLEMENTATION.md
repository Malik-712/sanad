# Sanad — Implementation Playbook

This is the build order for Claude Code. Work on **one session at a time**, in plan mode first. Each session ends with everything in its "Done when" list true, a push to `main`, and a working Vercel deploy.

Read `CLAUDE.md` (rules, stack, schema, tokens) and `docs/BRIEF.md` (goals and judging criteria) before any session.

## Schedule (Riyadh time)

| Session | When | Builds | Judging criteria it serves |
| --- | --- | --- | --- |
| A — Foundation and screens | Mon 06:00–10:00 | Next.js app, design system, all 5 routes, live on Vercel | UX 10%, presentation 5% |
| B — Isnad engine and tree | Mon 10:00–14:00 | Data schema + validator, graph engine, interactive tree, panels | Technical 25%, reliability 15%, innovation 15% |
| *Data track (owner + mentor)* | Mon 10:00–19:00 | 5 real hadiths with sources; one checked by a mentor | Reliability 15%, benefit 20% |
| C — ML narrator tagger | Mon 14:00–21:00 | Baseline parser, Sanadset prep, training, evaluation, ONNX export | Technical 25%, benefit 20% |
| D — Linking and /parse | Mon 21:00–Tue 01:00 | Real data in, linker, model in the browser, fallback | Technical 25%, reliability 15%, cost 10% |
| E — Quality and evidence | Tue 08:00–13:00 | Hard cases ×3, e2e + a11y tests, Lighthouse, user test + 1 fix | Reliability 15%, UX 10%, benefit 20% |
| F — Submission package | Tue 13:00–19:00 | README, source docs, logs, video script, deck content, final checks | Presentation 5%, all deliverables |

If a session runs late, cut scope inside it (never skip its "Done when" basics: build passes, tests pass, live link works). Keep at least 2 hours of buffer before 20:00 on Tuesday.

---

## Session A — Foundation and screens

**Goal:** a live site on Vercel that looks exactly like the design, with every route working on sample data.

**Inputs:** `design/*.html` (exported from Claude Design), `CLAUDE.md` tokens and layout.

**Steps**

1. Read every file in `design/`. Write `design/NOTES.md`: a table mapping each artboard to a route or component; the tokens and font sizes you found; each interaction (tree pan/zoom, select a route, select a narrator, panels, the «سفيان» chooser, mobile tabs «الشجرة / الطرق»). Note anything in the design that conflicts with `CLAUDE.md` and ask about it.
2. Install the skills listed in `CLAUDE.md`.
3. Scaffold Next.js in the existing repo (TypeScript, Tailwind, ESLint, App Router, `@/*` alias). Do not overwrite `CLAUDE.md`, `README.md`, `LICENSE`, `docs/`, `public/brand/`; merge `.gitignore`.
4. Tokens: all colours from `CLAUDE.md` in Tailwind `@theme`. One font with `next/font/google`: IBM Plex Sans Arabic (Arabic subset, `display: swap`). Root layout: `lang="ar" dir="rtl"`. Put every Arabic UI string and the fixed sentences in `lib/copy/ar.ts`.
5. Shared components (match the design): `SiteHeader` (logo, nav, gold underline on the current page), `SiteFooter` (disclaimer), `GoldFrame` (thin gold frame with corner diamonds), `StatusBadge` (ok / check / none, always with its word; none is grey), `SourceLine` (source, place, «افتح الموضع في المصدر», «انسخ التوثيق»), `DemoTag` («بيانات توضيحية»), `SectionHeading`, `HadithCard`, `NarratorChip` (with confidence badge), `ChainList` (the vertical chain from the Paste screen), `TreeLegend`.
6. Routes:
   - `/` — Home from the design, with the slogan «لكلِّ حديثٍ إسناد». Featured hadith cards come from `data/hadiths/*.json`. The search box filters on the client (simple for now; Session B adds the real index).
   - `/hadith/[id]` — mobile layout from `Tree`, desktop layout (≥1024px) from `TreeDesktop`: route list | tree | panel. In this session the tree area is a clear placeholder; the route list and the route panel already work from data.
   - `/narrator/[id]` — a page built from the narrator panel content.
   - `/parse` — the full UI from `Paste`; the analyse button is disabled with «قريبًا».
   - `/about` — from `About` (three evidence statuses, AI limits, privacy); the editions line stays as a visible placeholder until Session F.
7. Sample data: `data/hadiths/demo-niyyah.json` and `data/narrators.json`, following the schema, with `demo: true` and every entry `unverified`. Use only obviously sample values (for example «[رقم الحديث]»), never values that look real. Every page that shows demo data shows `DemoTag`.
8. Metadata: page titles in Arabic, description, Open Graph image (logo on green), favicon (logo without the gold frame).
9. Scripts in `package.json`: `dev`, `build`, `lint`, `test` (Vitest, even if few tests yet), `validate:data` (stub that loads every JSON file), `prebuild` → `validate:data`.
10. Commit, push. Ask the owner to import the repo in Vercel (Add New → Project → `Malik-712/sanad` → Deploy, default settings) and add the live URL to `README.md`.

**Done when**

- [ ] `pnpm lint`, `pnpm test`, `pnpm build` pass.
- [ ] All 5 routes render and match the design at 390px and 1440px, with no horizontal scroll.
- [ ] Every link and button works with the keyboard and shows a visible focus ring.
- [ ] The live Vercel URL works and is in `README.md`.
- [ ] `docs/SOURCES_LOG.md` lists every package added (name, licence).

---

## Session B — Isnad engine and tree

**Goal:** the tree is drawn from data by a tested engine, and it behaves like the design.

**Steps**

1. `lib/arabic/normalize.ts`: remove tashkeel and tatweel; unify أ إ آ → ا, ى → ي, ة → ه; remove honorifics (ﷺ, صلى الله عليه وسلم, رضي الله عنه/عنها/عنهما); collapse spaces. Used by search, parser, linker. Unit tests with real-looking Arabic strings.
2. `lib/data/schema.ts` (zod, exactly the schema in `CLAUDE.md`) and `scripts/validate-data.ts`. The validator fails when: a route has no URL, book or number; a chain id is not in `narrators.json`; a chain does not end at the Prophet ﷺ; `sighas` has the wrong length; a grade has no `byAr` or `sourceUrl`; a route has no `retrieved` date or `method`; a narrator is never used; a file without `demo: true` contains a placeholder like «[...]». Print clear Arabic-free English errors with file and route id.
3. `lib/isnad/graph.ts` — `buildGraph(hadith, narrators)`: one node per narrator id (merged across routes); one edge per teacher → student pair, holding the route ids and sighas that use it. Each node knows its route ids and its depth (generations from the Prophet ﷺ).
4. `lib/isnad/analyze.ts`:
   - `routeCount(node)` = number of routes through it.
   - **Branch point** = a node with two or more distinct students.
   - **Common link (madar)** = among narrators other than the Prophet ﷺ, the one shared by the most routes (at least 2); on a tie, the one farthest from the Prophet ﷺ. None if no narrator is shared by 2+ routes.
   - **Partial common links** = every other branch point shared by 2+ routes (shown, but not with the main gold ring).
   - Per-generation counts (how many narrators and routes at each depth).
   - Unit tests on small fixtures: a single route (no branch, no madar); one chain that splits at depth 4 (madar = the split node, even though the nodes above it carry the same count); two companions with 3 and 2 routes (madar is in the 3-route branch; the other branch point is partial); a narrator with two teachers in two routes (a DAG, no crash); a missing id (validator error).
5. `lib/isnad/layout.ts`: dagre, top-to-bottom, ranked by depth; compilers aligned on the bottom row as in the design; elbow connectors as in the design. A pure function with a test that no two nodes overlap.
6. `components/tree/IsnadTree.tsx`: SVG, node shapes and colours from `CLAUDE.md`; names in IBM Plex Sans Arabic; gold ring on the madar with the tag «نقطة الالتقاء»; gold diamonds on branch points; pan by drag, zoom with the design's buttons, the wheel and pinch; a reset button. Selecting a route highlights its path and dims the others (300ms draw; none if reduced motion). Each node is focusable (`tabIndex=0`, `role="button"`, Arabic `aria-label`), Enter opens its panel.
7. Panels from the design: `NarratorPanel` (generation, death, Taqrib quote and reference, or «لم ننقل نصّ الحكم بعد، ولن نعرض حكمًا بلا مصدر»; «يمرّ به ن من م طرق»), `RoutePanel` (full isnad text, chain, book, number, place, quoted grade, the line «ذِكرُ الحديث في كتابٍ ليس حكمًا عليه…», source link, and «انسخ التوثيق» which copies the isnad text + book + number + link). Counts come from the engine, never from text. The madar tag on the tree reads «نقطة الالتقاء». In all UI text a route is «إسناد» (plural «أسانيد»).
8. Mobile: the design's tabs «الشجرة / الطرق» — the route list is also the accessible alternative to the SVG.
9. URL state: `?route=<id>&narrator=<id>` so a view can be shared and the demo video can link to it.
10. `lib/search/index.ts`: search hadith text and narrator names with `normalize`; tests.

**Done when**

- [ ] `pnpm test` covers normalize, validator, graph, analyze, layout, search — all pass.
- [ ] `pnpm validate:data` passes and fails on a broken copy of the sample file (show both runs).
- [ ] The tree on `/hadith/demo-niyyah` matches the design at 390px and 1440px; pan, zoom, select and keyboard work.
- [ ] Pushed; the live site shows the tree.

---

## Data track — 5 real hadiths (owner, with Claude in chat, and a mentor)

Not a Claude Code session. Claude Code must never type this data from memory.

- Hadiths (from the design's home page): «إنما الأعمال بالنيات»، «من كذب عليّ متعمدًا»، «الدين النصيحة»، «لا يؤمن أحدكم حتى يحب لأخيه»، «بُني الإسلام على خمس».
- For each route: the isnad text word for word, book, edition, number, volume/page, URL, the date you copied it, and how (`manual-checked` once you have checked it). For each narrator: name forms, the Taqrib text with entry number and page. Grades only as quoted.
- Everything starts `unverified`. The owner checks each entry against its source page and marks it `verified` in `docs/REVIEW.md`. A mentor reviews at least one hadith in full (Mon, mentoring hours); log who, what, and what changed.
- Files: `data/hadiths/<id>.json` and `data/narrators.json` in the schema; `pnpm validate:data` must pass.

---

## Session C — ML narrator tagger

**Goal:** a trained model that finds narrator names in an isnad, measured against a rule-based baseline on held-out data.

**Steps**

0. Licences first: open the Sanadset 650K page (Mendeley Data, DOI 10.17632/5xth87zwb5) and the `asafaya/bert-mini-arabic` model card. Record both licences in `docs/SOURCES_LOG.md`. If either is unclear or forbids this use, stop and ask (fallback base model: a CAMeLBERT model with a clear licence).
1. **Data** — `ml/prepare_data.py`. The owner downloads the dataset to `ml/data/` (git-ignored). Print the columns and 5 rows first; do not assume column names. Take the isnad part of each record (the text before the matn). Normalise with the same rules as `lib/arabic/normalize.ts` (write a Python twin and a test that both give the same output on 20 strings). Align each listed narrator name, in order, to a token span; label tokens `B-NAR` / `I-NAR` / `O`. Keep only fully aligned records; report the alignment rate. Split **by book** (no book in both train and test); remove exact duplicate isnads across splits. Test set: 300 isnads from held-out books, seed 42. Save `train/dev/test.jsonl`.
2. **Baseline** — `lib/parser/ruleParser.ts` (TypeScript, because it is also the in-browser fallback): split on transmission words (حدثنا، حدثني، أخبرنا، أخبرني، أنبأنا، ثنا، نا، أنا، سمعت، سمع، عن، أن، قال، يقول، ح for تحويل), strip honorifics, return narrator strings and sighas. Unit tests. `scripts/eval-baseline.ts` writes its predictions for `test.jsonl`.
3. **Train** — `ml/train.ipynb` (runs on Colab or Kaggle GPU; the owner clicks Run all) and `ml/train.py` (same code). Token classification on `asafaya/bert-mini-arabic`; max length from the data (95th percentile, ≤ 256); cap training at ~100k records; early stopping on dev F1; seed 42. Must finish in under 45 minutes on a free T4.
4. **Evaluate** — `ml/evaluate.py`: entity-level precision, recall and F1 (`seqeval`), and **exact chain match** (all narrators found, in order). Run for baseline and model on (a) the 300 held-out isnads and (b) the routes in `data/hadiths/` (hand-checked gold chains). Write `docs/EVALUATION.md`: method, a results table, 10 error examples with a short reason each, and limits. Report the numbers as measured — never round up or pick the best run without saying so.
5. **Export** — `ml/export_onnx.py`: ONNX export (token classification) + dynamic int8 quantisation, in the Transformers.js folder layout under `public/models/sanad-ner/` (`config.json`, tokenizer files, `onnx/model_quantized.onnx`). Add a `.gitignore` exception for that folder. Check that ONNX and PyTorch agree on at least 99% of tokens on 50 test isnads; record the model size.

**Done when**

- [ ] `docs/EVALUATION.md` has baseline vs model numbers on both test sets.
- [ ] Model files are in `public/models/sanad-ner/` and under 30 MB.
- [ ] `ml/README.md` explains how to reproduce every step.
- [ ] Licences are recorded.

---

## Session D — Linking and /parse

**Goal:** paste an isnad → narrators found, linked with confidence, drawn as a chain, matched to a tree — all in the browser.

**Steps**

1. Replace the sample data with the real data track files (keep `demo-niyyah` only if the owner asks). `pnpm validate:data` passes.
2. `lib/ml/worker.ts` + `client.ts`: a Web Worker running a Transformers.js token-classification pipeline from `/models/sanad-ner`. Load on the first visit to `/parse`, show progress. If it fails or takes longer than 15 s, use `ruleParser` and show «تعمل الآن الطريقة البديلة (القواعد)».
3. `lib/linker/linker.ts`: for each extracted name — candidates from `aliasesAr` (exact normalised match = 1.0), then fuzzy match (Jaro-Winkler on normalised tokens); re-rank with context: a boost when the previous or next narrator is a known teacher or student in our data. Confidence ≥ 0.90 → high; 0.60–0.90, or the top two within 0.10 → «يحتاج تحققًا» with the candidates as buttons (the design's «سفيان» chooser); < 0.60 → «لا مصدر». Unit tests, including the «سفيان بن عيينة / سفيان الثوري» case.
4. Chain match: compare the linked chain with every route in `data/`; on a match, show the design's green card «وجدناه في شجرة …» linking to `/hadith/<id>?route=<routeId>`.
5. Input rules: empty text, text that is not an isnad (no transmission words and no names found), more than 2,000 characters — each gets a clear Arabic message. The page says pasted text stays on the device.

**Done when**

- [ ] On the live site, pasting a route from `data/` shows the right narrators, the chain, and the match card.
- [ ] The fallback works when the model is blocked (test it in DevTools by blocking `/models/`).
- [ ] Linker tests pass; no network request contains the pasted text.

---

## Session E — Quality and evidence

**Goal:** proof that Sanad is reliable, accessible and useful — the evidence the judges ask for.

**Steps**

1. `tests/hard-cases.json` with at least 12 cases: an ambiguous name (سفيان، حماد), an unknown narrator, a broken chain, text that is not an isnad, matn only, a very long isnad, full tashkeel, short forms (ثنا، نا، أنا), mixed honorifics, an isnad with «ح» (tahwil). Run each 3 times; outputs must be identical. Write `docs/HARD_CASES.md`: case, expected, actual, pass/fail.
2. Playwright: home → search → tree → select route → open source link; the /parse flow; one run at 390px and one at 1440px.
3. Accessibility: `@axe-core/playwright` on every route — zero serious or critical issues; keyboard-only path through the main flow; contrast checks; reduced motion.
4. Lighthouse (mobile) on `/` and `/hadith/<id>`: 90+ in all four categories. Fix what blocks it (font loading, image sizes, model loading only on /parse).
5. `docs/USER_TEST.md`: a script for 5 users — task 1: build the tree of one hadith by hand from its route texts (time it); task 2: do the same with Sanad (time it); 3 short questions. A results table. Then make one fix from the findings and log it.
6. Run the `web-design-guidelines` review and fix the issues found.
7. GitHub Actions: `.github/workflows/ci.yml` runs lint, test, validate:data and build on every push; add the badge to `README.md`.

**Done when**

- [ ] All hard cases documented; repeated runs identical.
- [ ] e2e and axe tests pass in CI mode (`pnpm test:e2e`).
- [ ] Lighthouse scores recorded in `docs/EVALUATION.md`.
- [ ] User test results and the fix are logged.

---

## Session F — Submission package

**Goal:** every required deliverable is complete and checked.

**Steps**

1. `README.md`: what Sanad is, the live link, 3 screenshots, how it works (a Mermaid diagram: data → engine → tree; text → model/fallback → linker → chain), how to run (`pnpm i`, `pnpm dev`, `pnpm test`, `pnpm validate:data`, ML reproduce steps), limits, licences, AI-use disclosure.
2. `docs/SOURCES.md` (a required deliverable): the books and editions used, which sites, how each entry was copied and checked, who reviewed what, what each status means. Also fill the editions line on `/about`.
3. `docs/SOURCES_LOG.md`: complete, including package licences (`npx license-checker --production --summary`, `pip-licenses`).
4. `docs/REVIEW.md`: the mentor review and the owner's checks.
5. `docs/VIDEO_SCRIPT.md`: a demo of 2 minutes or less, scene by scene with timings: the problem (15 s), search and tree (45 s), narrator and source panels (20 s), paste an isnad with the «سفيان» choice (25 s), evidence numbers (10 s), close (5 s).
6. `docs/DECK.md`: slide-by-slide content for the official template, in its suggested order: problem, solution, how it works, demo, impact (the measured numbers), team, next steps. Keep "built" and "planned" on separate slides. Use the slogan «لكلِّ حديثٍ إسناد» on the cover and the last slide.
6b. `docs/REQUIREMENTS.md`: one row per requirement in the official guide, the scientific standards and the judging criteria → the feature that meets it → the evidence (test, doc, screenshot) → status.
6c. `docs/JUDGES.md` (Arabic + English): 5 things to try on the live site, and one command that re-runs the tests and the evaluation.
6d. `docs/BASELINE.md`: the prior project `Malik-712/sanad2` (link and tag), anything adapted from it, and what was built on 4–6 Oct.
7. Final checks: the live link in a private window on a phone and a desktop; every route; no console errors; no secrets in the repo; tag `v1.0.0`.

**Done when**

- [ ] All seven deliverables in `docs/BRIEF.md` are ticked.
- [ ] The owner submits on the portal before 20:00 and keeps the confirmation email.
