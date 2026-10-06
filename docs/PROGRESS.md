# Sanad — Progress Tracker

Live record of what is done, per session in `docs/IMPLEMENTATION.md`. All times are Riyadh time (UTC+3). Update this file at the end of every session.

Last updated: Tue 6 Oct 2026 (Sessions C and D).

## Summary

| Session | Status | Planned (original) | Planned (adjusted) |
| --- | --- | --- | --- |
| Setup | ✅ Done | Sun 4 Oct | — |
| A — Foundation and screens | ✅ Done 6 Oct | Mon 06:00–10:00 | Mon 09:00–12:30 |
| B — Isnad engine and tree | ✅ Done 6 Oct | Mon 10:00–14:00 | Mon 12:30–16:30 |
| Data track (owner + mentor) | ✅ Done 5 Oct | Mon 10:00–19:00 | Mon 10:00–19:00 (fixed: mentor hours) |
| C — ML narrator tagger | ✅ Done 6 Oct | Mon 14:00–21:00 | Mon 16:30–23:00 |
| D — Linking and /parse | ✅ Done 6 Oct | Mon 21:00–Tue 01:00 | Mon 23:00–Tue 03:00 |
| E — Quality and evidence | ⬜ Not started | Tue 08:00–13:00 | Tue 08:30–13:00 |
| F — Submission package | ⬜ Not started | Tue 13:00–19:00 | Tue 13:00–18:00 |
| Buffer + submit | — | Tue 19:00–20:00 | Tue 18:00–20:00 (submit by 19:00) |

## Setup

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ✅ Done | Sun 4 Oct 16:52 | `65ff4ff` | Starting version: planning files only (CLAUDE.md, BRIEF, SOURCES_LOG, README, LICENSE, logo). |
| ✅ Done | Mon 5 Oct 07:38 | `d758a43` | Build playbook (`docs/IMPLEMENTATION.md`), updated CLAUDE.md/BRIEF/SOURCES_LOG/.gitignore, design bundle `design/sanad-design.html`. |
| ✅ Done | Mon 5 Oct 08:45 | see `git log` | Readable design source in `design/screens/` (6 screens + canvas.json + README), this tracker. |
| ✅ Closed | Mon 5 Oct 20:10 | — | pnpm 12.9.1 installed with `npm i -g pnpm` (user-level, no admin). Was: Node v24.14.0 OK. **pnpm is not installed.** Run `corepack enable pnpm` in an admin PowerShell (Node is in `C:\Program Files\nodejs`), or `npm i -g pnpm`. Needed before Session A step 3. |

## Session A — Foundation and screens

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ✅ Done | Mon 5 Oct 20:30 | see `git log` | Item 1: Next.js 16.3.8 + TypeScript strict + Tailwind 4 tokens (design colours only, no shadows, 2px radius), IBM Plex Sans Arabic as the only font, `lang="ar" dir="rtl"`, `lib/copy/ar.ts`, favicon (small mark), Vitest, `validate:data` stub + prebuild. lint/test/validate/build pass. Home is a temporary placeholder. |
| ✅ Done | Mon 5 Oct | see `git log` | Step 10: repo imported in Vercel (project `sanad`, deployment `dpl_5Wu4FANi4bPYe6Ay2D8h9dHXobPq`, production, READY, from `dc0e28d`). Live URL: https://sanad-pi-five.vercel.app (HTTP 200, `lang="ar" dir="rtl"`). README rewritten, `docs/BASELINE.md` added. |
| ✅ Done | Mon 5 Oct – Tue 6 Oct | `e100ccc` … see `git log` | PLAN-A stages 1–10: design notes, companion honorifics, helpers and shared UI, Home, hadith page, 92 narrator pages, Paste (labelled sample), About, 404, focus and axe checks (0 violations), the U+FD41 fallback font, `docs/SOURCES.md`, licence pass of `docs/SOURCES_LOG.md`. All 100 pages live at https://sanad-pi-five.vercel.app. |
| ↪ Replaced | — | — | Items 2+ (now done above): design/NOTES.md, shared components, the 5 routes, demo data, metadata/OG image. Originally: starts ~3 h late. If short on time, cut the Open Graph image polish first; keep every "Done when" item. Owner imports the repo in Vercel at the end. |

## Session B — Isnad engine and tree

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ✅ Done | Tue 6 Oct | see `git log` | zod schema + stricter validator (one test per rule; passes on data, fails on a broken copy), engine (graph, analysis, dagre layout) with tests incl. the five real common links, the drawn tree with pan/zoom/pinch/keyboard, narrator panel on the hadith page, counts sentence from the engine, citation copies the isnad text. 63 tests. |
| ↪ Was | Planned Mon 12:30–16:30 | — | If short on time, cut pinch-zoom (keep buttons + wheel) and URL state polish; keep engine tests and the validator. |

## Data track — 5 real hadiths (owner + mentor)

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ✅ Done | Mon 5 Oct | see `git log` | 5 hadiths, 37 isnads, 92 narrators in `data/` (count from `pnpm validate:data`). All isnads marked verified by the owner (see `docs/REVIEW.md`). Narrator records stay unverified. |

## Session C — ML narrator tagger

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ✅ Done | Tue 6 Oct | see `git log` | Run as one session with D (`docs/PHASE5_AI_LAYER.md`). Sanadset → BIO labels from its inline `<NAR>` tags (85.2 % of parsed rows kept), split by book (overlap 0, duplicates 0, test 300). Rule parser `lib/parser/` (baseline and live reader). BERT-mini trained **on the laptop CPU** (no Colab), 27.9 min, early stop after epoch 2. Test (300 isnads, 9 held-out books): rules F1 0.756 / exact chain 32 %; model F1 0.916 / 71 %. ONNX int8 12.24 MB, parity 99.49 %. **Model not shipped** (owner decision 6 Oct: Sanadset licence unclear); kept in `ml/out/`, numbers in `docs/EVALUATION.md`. |
| ↪ Was | Planned Mon 16:30–23:00 | — | Licences first (Sanadset, bert-mini-arabic). Owner downloads Sanadset to `ml/data/` early (during A/B) and runs the Colab notebook. If short on time, cap training at 50k records. |

## Session D — Linking and /parse

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ✅ Done | Tue 6 Oct | see `git log` | `/parse` is live and runs fully in the browser: rule parser → linker (`lib/linker/`: exact alias = 1.0, token Jaro-Winkler, three states, context from known teacher/student pairs that orders and pre-selects but never raises a link to «high») → chain match across «ح» branches and «فلان وابن فلان» readings. The «سفيان» chooser, «جرّب مثالًا», Ctrl+Enter, input messages (empty / > 2,000 / not an isnad), meeting-point ring on the matched tree. On the 37 routes in `data/`: right tree found without help 27/37 (EVALUATION.md row b). Playwright (Edge, 390 + 1440): 12/12 incl. **privacy spy** and axe (0 serious/critical). Hard cases 15/15, 3 runs identical (`docs/HARD_CASES.md`, done here instead of Session E). No browser model runtime (5.5b) because the model is not shipped. About page and notice no longer say a model runs in the browser. |
| ↪ Was | Planned Mon 23:00–Tue 03:00 | — | Needs the real data files from the data track. Sleep Tue 03:00–08:30. |

## Session E — Quality and evidence

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ⬜ Not started | Planned Tue 08:30–13:00 | — | Owner recruits 5 test users on Monday so the user test can run Tuesday morning. |

## Session F — Submission package

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ⬜ Not started | Planned Tue 13:00–18:00 | — | Shortened by 1 h to keep the 2 h buffer the playbook requires. Owner records the video and fills the official deck. Submit on the portal by 19:00 at the latest; keep the confirmation email. |

## Schedule notes

- At 08:41 Monday, Session A has not started; the original plan had it 2 h 41 min in. We are about **3 hours behind**.
- The adjusted schedule absorbs the delay by shortening A (−30 min), C (−30 min), D (end at 03:00 instead of 01:00, less sleep), and F (−1 h). Total build time stays close to the original.
- The data track does not move: mentor hours are fixed (Mon 10:00–19:00).
- Hard rule from the playbook: if a session runs late, cut scope inside it, never its "Done when" basics (build, tests, live link).
