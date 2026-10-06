# Requirements → feature → evidence

Each official requirement, as recorded in `docs/BRIEF.md` from the challenge guide and Terms, mapped to what meets it and where to check. Numbers are as measured on 6 Oct 2026. Status: ✅ done · ⏳ waiting for the owner (a step only a person can do) · ⚠️ done with a stated limit.

## 1. Required deliverables

| # | Requirement | What meets it | Evidence | Status |
| --- | --- | --- | --- | --- |
| D1 | Working, complete product (not a prototype) | Five page types live: Home with search, hadith tree with source panels, 92 narrator pages, `/parse`, About | https://sanad-pi-five.vercel.app · 35 / 35 Playwright tests on the live site (`tests/e2e/`) | ✅ |
| D2 | Public GitHub repo with setup docs, licences, no secrets | Public repo; README with install, run and test steps; licence; package licences | https://github.com/Malik-712/sanad · `README.md` · `LICENSE` · `docs/licenses/` · history scan: 56 commits, no key or password found | ✅ |
| D3 | Demo video, 2 minutes or less | Shot-by-shot script with timings and recording steps | `docs/VIDEO_SCRIPT.md` | ⏳ owner records |
| D4 | Presentation on the official template | Slide-by-slide content in the template's order, built and planned on separate slides | `docs/DECK.md`, `docs/PITCH.md` (the official template file is not in the repo) | ⏳ owner pastes into the template |
| D5 | Source documentation: which sources, how used, how verified | Sources and editions, how text is copied and checked, how to verify any fact, index of all 37 isnads | `docs/SOURCES.md` | ✅ |
| D6 | Live demo link that works during judging (7–22 Oct) | Static site on Vercel Hobby; no server, database or API key that can expire | https://sanad-pi-five.vercel.app · `docs/COST.md` | ✅ |
| D7 | Tools, models and data log with licences (Terms §9) | Every AI tool, model, dataset, service, source site and package | `docs/SOURCES_LOG.md` · `docs/licenses/npm.md` (18 shipped + 357 dev packages) · `docs/licenses/python.md` (65) | ✅ |

## 2. Rules from the Terms

| Rule | What meets it | Evidence | Status |
| --- | --- | --- | --- |
| Disclose every AI tool, model, dataset, service and open-source part, with licence (§9) | Log kept the same day as each use, including Claude Code and Claude Design | `docs/SOURCES_LOG.md` | ✅ |
| Only work from 4–6 Oct is judged; the repo started empty (§8) | First commit is planning files only | commit `65ff4ff` (4 Oct 16:52 +03:00) · `git log` | ✅ |
| Disclose the prior project (§8) | `sanad2` named with its tag; the reused logo marked in the files | `docs/BASELINE.md` (tag `challenge-baseline`, `e53189a`) · header «Adapted from sanad2» in `public/brand/*.svg`, `app/icon.svg` | ✅ |
| No real user data in tests or in any AI service (§9) | Tests use made-up names or text from `data/`; pasted text never leaves the browser | `tests/e2e/parse.spec.ts` privacy test (no request carries the pasted text) · `tests/hard-cases.json` | ✅ |
| No passwords or keys in the repo (§10) | No secrets needed (static site); history scanned | scan of all 56 commits on 6 Oct: no hit (README, «AI use and sources») | ✅ |
| Do not copy protected material, e.g. editors' footnotes (§8–9) | Classical text only, edition named, page linked | `docs/SOURCES.md` §2 · CLAUDE.md rule 7 | ✅ |
| Use the challenge logo only in the deck and project materials (§19) | The site does not use the challenge logo | `public/brand/` holds only Sanad's own mark | ✅ |

## 3. Track 04 success test

> Does the tool make finding or checking knowledge more accurate, show the source and the status of the evidence clearly and traceably, and separate what the sources support from what needs more checking or referral?

| Part | What meets it | Evidence | Status |
| --- | --- | --- | --- |
| Finding and checking more accurately | One merged tree per hadith with the meeting point computed from the chains; `/parse` finds a pasted isnad's tree | Engine tests (`lib/isnad/*.test.ts`) · 27 of 37 real isnads found in the right tree with no help (`docs/EVALUATION.md` b) | ✅ · ⏳ user test for speed (`docs/USER_TEST.md`) |
| Source and status shown clearly and traceably | Every isnad: book, edition, number, volume, page, link; three status badges with words | Source panel («افتح الموضع في المصدر») · `docs/SOURCES.md` §3b · e2e test «source link» | ✅ |
| Separating what is supported from what needs checking | «مصدر موثق» only when verified with a source; «يحتاج تحققًا» for unchecked data and uncertain links; «لا مصدر بعد» (grey, never red) | `lib/data/derive.ts` (`routeStatus`, `narratorStatus`) · linker states (`lib/linker/linker.ts`) · hard cases 1–4 | ✅ |

## 4. Judging criteria

| Criterion (weight) | What meets it | Evidence | Status |
| --- | --- | --- | --- |
| Technical quality and AI use (25 %) | Narrator tagger trained, measured against a rule baseline on 300 isnads from 9 held-out books; linker with confidence states | Rules F1 0.757 · model F1 0.916 (ONNX int8) · whole chain 33.3 % vs 71.7 % (`docs/EVALUATION.md` a) · 130 unit tests · CI | ⚠️ model trained and measured, **not published** (data licence unclear); the site runs the rules |
| Benefit per the track test (20 %) | Tree in one page vs drawing by hand; isnad lookup on `/parse` | User-test protocol ready (`docs/USER_TEST.md`); routes end to end (`docs/EVALUATION.md` b) | ⏳ 5-user test not run yet |
| Reliability and scholarly safety (15 %) | Every isnad cited; grades only quoted; abstains when unsure; repeatable | 15 / 15 hard cases, 3 runs, identical SHA-256 (`docs/HARD_CASES.md`) · `pnpm validate:data` before every build | ✅ |
| Innovation and added value (15 %) | All isnads of one hadith merged into one sourced tree with its meeting point, and a pasted isnad matched to it, instead of reading one isnad at a time | Live site · `docs/PITCH.md` | ✅ |
| Running cost and continuity (10 %) | $0 running cost; static pages; no API, database or key; rules work offline in the browser | `docs/COST.md` | ✅ |
| User experience and accessibility (10 %) | Arabic RTL, mobile first; errors explained in Arabic; keyboard path; WCAG 2.1 AA | axe: 0 serious or critical issues on every page at 390 and 1440 px · keyboard e2e test · Lighthouse accessibility (`docs/EVALUATION.md`) | ✅ · ⏳ user test and the fix it leads to |
| Clear presentation (5 %) | Short scripts; built and planned kept apart; easy re-test | `docs/PITCH.md` · `docs/DECK.md` · `docs/JUDGES.md` (one command: `pnpm eval:all`) | ✅ · ⏳ video and slides |

## 5. Scholarly rules (CLAUDE.md)

| Rule | How it is enforced | Evidence |
| --- | --- | --- |
| No hadith, isnad or narrator fact from memory; each with its source URL | Data copied from source pages; the validator fails the build without a source | `pnpm validate:data` · `docs/SOURCES.md` |
| Never grade; only quote with the author | Grades are a quoted field with `byAr` and `sourceUrl`; no grading code exists | `lib/data/schema.ts` (`gradeSchema`) |
| New data unverified until the owner checks it | `verification.status`; badges follow it | `docs/REVIEW.md` · 37 / 37 isnads verified, 0 / 92 narrator records verified |
| Automatic output labelled; low confidence never guessed | «استخراج آلي» notice on `/parse`; «يحتاج تحققًا» with candidates | `components/parse/` · hard cases 3–4 |
| Disclaimer on About and in the footer; source note in every source panel | Fixed sentences in `lib/copy/ar.ts` | e2e tests (About, source panel) |
| Pasted text stays in the browser | No API route; analysis runs in the page | privacy test in `tests/e2e/parse.spec.ts` |
