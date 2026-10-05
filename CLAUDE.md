# CLAUDE.md — Sanad (سَنَد)

Read this file first in every session. Then read:

- `docs/BRIEF.md` — concept, judging criteria, scope (the source of truth for *what* and *why*).
- `docs/IMPLEMENTATION.md` — the build playbook (the source of truth for *how* and *in what order*). Each session works on ONE section of it.
- `design/` — the approved UI design, exported as HTML from Claude Design. Match it.

## What we are building

Sanad is an Arabic, right-to-left web app that merges all routes (turuq) of one hadith into a single interactive isnad tree: the Prophet ﷺ at the top, the compilers at the bottom. It shows where routes meet (common link, madar) and where they split. Every route links to its source. A small ML model, running in the browser, extracts narrator names from a pasted isnad and links them to narrator records.

- Challenge: AI Challenge — Serving Islamic Content, **Track 04: knowledge and verification tools**.
- Hard deadline: **Tue 6 Oct 2026, 23:59 Riyadh time**. Our target: **20:00**. Only work done 4–6 Oct counts.
- Solo builder. A small, finished, tested product beats a big, broken one. Never start a "Later" feature from the brief.
- Slogan: **«لكلِّ حديثٍ إسناد»** ("Every hadith has its isnad"). It is the product's promise: no hadith is shown without its isnad, word for word from its book.

## Language rules

- Code, comments, commit messages, docs, file names: **English**.
- Everything the user sees in the app: **Arabic**, `<html lang="ar" dir="rtl">`. Arabic-Indic digits (٠١٢٣) in UI text, as in the design.
- Always write ﷺ after the Prophet's name and رضي الله عنه after a companion's name in UI text.
- In the UI a route is called «إسناد» (plural «أسانيد»), as in the design — never «طريق» or «طرق».
- All Arabic UI text lives in ONE file, `lib/copy/ar.ts`, so the owner can review it in one place. Components import from it; no Arabic strings hard-coded in components (data files are the exception).

## Scholarly rules (non-negotiable)

1. **Never write a hadith, isnad, narrator fact, book number, page, or grade from memory.** Every fact in `data/` must be copied word for word from a source page whose URL is stored next to it. If you cannot find a source, leave the field empty — the UI then shows its "not yet sourced" state.
2. Every route has a source: book, hadith number, URL. The data validator fails the build if one is missing.
3. Sanad never grades a hadith or a narrator by itself. It only **quotes** grades, with who said it and where (al-Sahihayn, dorar.net, al-Maktaba al-Shamila, Taqrib al-Tahdhib).
4. New data starts as `verification.status: "unverified"` and shows «يحتاج تحققًا». Only the human owner changes it to `"verified"`, after checking it, and logs it in `docs/REVIEW.md`.
5. ML output is always labelled as automatic. Low confidence → «يحتاج تحققًا» with candidate choices, never a silent guess. No record found → «لا مصدر بعد».
   Never use «صحيح», «ضعيف», «موضوع» or «متواتر» in Sanad's own voice — only inside a quoted grade with its author.
6. The About page and the footer state: «أداة مساعدة بالذكاء الاصطناعي، لا تحكم على الأحاديث ولا تُفتي». Every source panel also states: «ذِكرُ الحديث في كتابٍ ليس حكمًا عليه. الأحكام تُنقل منسوبةً إلى قائليها.»
7. Do not copy editors' footnotes (tahqiq notes) from printed editions. Use the classical text, name the edition, link to the page.
8. No real user data anywhere. Tests use made-up examples. Text pasted on /parse never leaves the browser.
9. Values in the design files (counts like «سبعة طرق», percentages, Taqrib pages, death dates) are **sample content only**. Never copy them into `data/`.
10. Prior project: an earlier version exists at `Malik-712/sanad2`. If you adapt any code or idea from it, add a header `Adapted from sanad2: <path>` in the file and list it in `docs/BASELINE.md`. Never hide it.

## Tech stack (decided — do not swap without asking)

- Next.js (latest stable, App Router) + TypeScript `strict` + Tailwind CSS (v4, tokens in `@theme`). Package manager: pnpm (run `corepack enable` if missing). Node ≥ 20.
- Pages are statically generated from JSON (`generateStaticParams`). No database, no server secrets, no API routes needed.
- Tree: our own SVG renderer (to match the design exactly), positions from `@dagrejs/dagre`, pan/zoom with pointer events + the design's zoom buttons. No canvas libraries.
- Validation: `zod` schemas for all data.
- Icons: `lucide-react` (1.5 px stroke), only where the design has an icon.
- Font via `next/font/google`: **IBM Plex Sans Arabic only** (400/500/600/700, Arabic subset) for everything, including hadith text and narrator names. No second font. Source text is marked by «» and the source line under it, not by a font.
- Tests: Vitest (logic), Playwright + `@axe-core/playwright` (end-to-end and accessibility).
- ML: Python in `ml/` (pandas, datasets, transformers, seqeval, optimum). Training runs on Google Colab or Kaggle (free GPU). In the browser: `@huggingface/transformers` (Transformers.js) inside a Web Worker.
- Hosting: Vercel Hobby, auto-deploy from `main`.

## Folder layout

```
app/
  layout.tsx               fonts, <html lang="ar" dir="rtl">, header, footer
  page.tsx                 Home + search                 (design: Home)
  hadith/[id]/page.tsx     Tree + route list + panels    (design: Tree on mobile, TreeDesktop at ≥1024px)
  narrator/[id]/page.tsx   Narrator page (built from the narrator panel)
  parse/page.tsx           Paste an isnad                (design: Paste)
  about/page.tsx           About and method              (design: About)
components/
  layout/  ui/  tree/  panels/  parse/
lib/
  arabic/      normalize.ts (+ tests)
  data/        schema.ts (zod), load.ts
  isnad/       graph.ts, analyze.ts, layout.ts (+ tests)
  search/      index.ts (+ tests)
  parser/      ruleParser.ts — baseline AND fallback (+ tests)
  linker/      linker.ts (+ tests)
  ml/          worker.ts, client.ts
  copy/        ar.ts — every Arabic UI string and the fixed sentences
data/
  hadiths/<id>.json
  narrators.json
design/                    exported HTML from Claude Design + NOTES.md (reference only, not shipped)
ml/                        prepare_data.py, train.ipynb, evaluate.py, export_onnx.py, README.md
public/brand/              logo files
public/models/sanad-ner/   exported ONNX model + tokenizer (Transformers.js layout)
scripts/                   validate-data.ts, eval-baseline.ts
tests/                     e2e/, hard-cases.json
docs/                      BRIEF, IMPLEMENTATION, SOURCES, SOURCES_LOG, EVALUATION, REVIEW, HARD_CASES, USER_TEST
```

## Data schema

`data/hadiths/<id>.json`
```ts
type Hadith = {
  id: string;                         // "niyyah"
  demo?: boolean;                     // true = sample data → UI shows «بيانات توضيحية»
  titleAr: string;                    // short title for cards
  matnAr: string;                     // text of the hadith, copied from a source
  matnSource: { url: string; book: string; number: string };
  routes: Route[];
};
type Route = {
  id: string;                         // "bukhari-1"
  book: { nameAr: string; authorAr: string; edition: string };
  number: string;                     // hadith number in that edition
  volume?: string; page?: string;
  url: string;                        // source page (dorar.net, shamela.ws, sunnah.com)
  retrieved: string;                  // date the text was copied, ISO "2026-10-05" (kept for docs/SOURCES.md; not shown in the UI)
  method: "manual-checked" | "manual" | "automatic";   // how it was copied (kept for docs; not shown in the UI)
  isnadAr: string;                    // full isnad text, word for word from the source
  chain: string[];                    // narrator ids, from the compiler UP TO the Prophet ﷺ
  sighas?: string[];                  // transmission words between links, same order (length = chain.length - 1)
  grade: null | { textAr: string; byAr: string; sourceUrl: string };   // quoted, never computed
  verification: { status: "verified" | "unverified"; checkedBy?: string; checkedAt?: string; note?: string };
};
```

`data/narrators.json`
```ts
type Narrator = {
  id: string;                         // "yahya-ibn-said-al-ansari"
  nameAr: string;                     // short name shown on the tree
  fullNameAr: string;
  aliasesAr: string[];                // other forms found in isnads (used by the linker)
  role: "prophet" | "companion" | "narrator" | "compiler";
  tabaqa?: string;                    // as written in Taqrib, e.g. «من الخامسة»
  deathAr?: string;                   // as written in the source
  taqrib?: { quoteAr: string; entryNo: string; page: string; edition: string; url?: string };
  verification: { status: "verified" | "unverified"; checkedBy?: string; checkedAt?: string };
};
```

Status shown in the UI (the design's three badges):
- **مصدر موثق** — `verification.status === "verified"` and a source URL exists.
- **يحتاج تحققًا** — unverified, or produced by the ML model, or linker confidence below threshold.
- **لا مصدر بعد** — no source or record found yet. Neutral grey, never red: a missing source does not mean the hadith is fabricated.
- Grades are not statuses. A grade is quoted text with its author, shown without colour.

## Design tokens

| Token | Hex | Use |
| --- | --- | --- |
| `green` (primary) | #0E4B3B | header band, buttons, tree lines |
| `green-deep` | #0A3A2D | hover, inner panels on green |
| `parchment` (bg) | #F5F2EB | page background |
| `paper` (surface) | #FFFDF8 | cards, panels, inputs |
| `ink` (text) | #1C1C1A | body text, strong borders |
| `muted` | #5E6B66 | secondary text |
| `on-green-muted` | #CFDAD4 | secondary text on green |
| `line` | #DDD6C6 | list dividers |
| `line-strong` | #C9C2B0 | chip and card borders |
| `gold` (accent) | #C9A45C | Prophet ﷺ node, common-link ring, branch diamonds, gold frame, focus on green — **shapes only, never text** |
| `sage` | #6F8F7F | later-generation node outlines |
| `ok` / `ok-bg` / `ok-fg` | #2E7D5B / #E6F0EA / #1F5E44 | «مصدر موثق» |
| `check` / `check-bg` / `check-fg` | #B7791F / #F7EBD6 / #7A4F0F | «يحتاج تحققًا» |
| `none` / `none-bg` / `none-fg` | #8B908D / #ECEBE7 / #45494A | «لا مصدر بعد» (neutral, not red) |

Shapes follow the design: square corners (radius 2px), flat, no shadows or gradients, 1.5px ink borders on inputs and key cards. Tree nodes: Prophet ﷺ = gold diamond with green outline (top); companion = filled green square; later narrator = sage outline square; compiler = ink rectangle; common link = gold diamond ring around the node; branch point = small gold diamond on the line. Status colours always come with a word. Respect `prefers-reduced-motion`. Mobile first (390px), desktop tree layout at ≥1024px. Touch targets ≥ 44px. Target WCAG 2.1 AA.

Logo: `public/brand/sanad-mark.svg`. Full mark (with gold frame) at 48px and larger; below 48px use the small mark without the gold frame (favicon, icons); one-colour version = green letters only. Clear space ≥ ¼ of its width. Never stretch, rotate, recolour or add a shadow. The identity board «هوية سند» in `design/` is the reference.

## Skills to use

Install once (Session A):

```
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/anthropics/skills --skill webapp-testing
npx skills add vercel-labs/agent-skills
```

- UI work → `frontend-design` + `vercel-react-best-practices`.
- Before each push of UI changes → `web-design-guidelines` review.
- Browser tests → `webapp-testing`.

## How we work

1. One playbook session at a time. Start in **plan mode**; the plan lists files, packages, steps and open questions. Wait for approval, then build.
2. Small commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). Push to `main` only when `pnpm lint`, `pnpm test`, `pnpm validate:data` and `pnpm build` all pass. Vercel deploys every push — never push a broken `main`.
3. A session is done only when its "Done when" list in `docs/IMPLEMENTATION.md` is all true. Report what was done, what was not, and the live URL.
4. Every new package, dataset, model, AI tool or source site → a row in `docs/SOURCES_LOG.md` the same day (type, name, link, purpose, date, licence).
5. If a scholarly fact is missing or a decision is unclear: stop and ask. Do not guess.
