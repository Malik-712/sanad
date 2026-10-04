# CLAUDE.md — Sanad (سَنَد)

Read this file and `docs/BRIEF.md` before every task. The brief is the source of truth for scope, judging criteria and the plan.

## What we are building

Sanad is an Arabic, right-to-left web app that merges all routes (turuq) of one hadith into a single interactive isnad tree: the Prophet ﷺ at the top, the compilers at the bottom. It shows where routes meet (common link, madar) and where they split. Every route links to its source. A small ML model, running in the browser, extracts narrator names from a pasted isnad.

- Challenge: AI Challenge — Serving Islamic Content (Bathel Foundation), **Track 04: knowledge and verification tools**.
- Hard deadline: **Tue 6 Oct 2026, 23:59 Riyadh time**. Our target: 20:00. Only work done 4–6 Oct counts.
- Solo builder. Keep everything simple, finished and tested. A small complete product beats a big broken one.

## Language rules

- Code, comments, commit messages, docs, file names: **English**.
- Everything the user sees in the app: **Arabic**, `lang="ar" dir="rtl"`.
- Always write ﷺ after the Prophet's name and رضي الله عنه after a companion's name in UI text.

## Scholarly rules (non-negotiable)

1. Never invent a hadith, an isnad, a narrator, a book number, a page, or a grade. If data is missing, show "غير متوفر" — do not fill it.
2. Every route must have a source: book, hadith number, link. A route without a source is not shown.
3. Sanad never grades a hadith or a narrator by itself. It only **quotes** grades from approved sources, with who said it and where (al-Sahihayn, dorar.net, al-Maktaba al-Shamila, Taqrib al-Tahdhib).
4. ML output is always labelled as automatic. When narrator-link confidence is below the threshold, show the badge **«يحتاج تحققًا»** (needs verification), never a guess.
5. The About page states clearly: this is an AI-assisted tool; it does not grade hadiths or give fatwas; refer questions to qualified scholars.
6. Do not copy editors' footnotes (tahqiq notes) from printed editions. Use the classical text, name the edition, link to the page.
7. No real user data anywhere. Tests use made-up examples only. Pasted text stays in the browser (no server logging).

## Tech stack

- Next.js (App Router) + TypeScript (strict) + Tailwind CSS. pnpm.
- Tree: `@xyflow/react` (React Flow) + `dagre` for layout, top-to-bottom.
- Icons: `lucide-react` (1.5 px stroke).
- Fonts via `next/font/google`: **Readex Pro** (UI, 400/600/700) and **Amiri** (hadith text and narrator names, 400/700).
- Tests: Vitest for logic; Playwright for one end-to-end smoke test.
- ML (Phase 5): Python in `/ml` (pandas, transformers, datasets, onnx/optimum). Model runs in the browser with `@huggingface/transformers` (Transformers.js), loaded in a Web Worker.
- Hosting: Vercel Hobby, auto deploy from `main`. No environment secrets are needed. Never commit keys.

## Folder layout

```
app/
  page.tsx                 Home + search
  hadith/[id]/page.tsx     Tree view + narrator panel + source panel
  narrator/[id]/page.tsx   Narrator page
  parse/page.tsx           Paste an isnad (ML)
  about/page.tsx           About and method
components/                UI components (tree/, panels/, ui/)
lib/
  isnad/                   graph engine: build, merge, commonLink, branchPoints (+ tests)
  parser/                  rule-based isnad parser (baseline + fallback) (+ tests)
  linker/                  name normalisation + fuzzy matching + confidence (+ tests)
  ml/                      Web Worker + Transformers.js loader
data/
  hadiths/*.json           one file per hadith
  narrators.json           all narrator records
ml/                        Python: prepare_data.py, train.py, evaluate.py, export_onnx.py, README.md
public/brand/              logo files
public/models/             exported ONNX model (if small enough; otherwise loaded from Hugging Face Hub)
docs/
  BRIEF.md                 plan (source of truth)
  SOURCES.md               scholarly sources and how we verify them
  SOURCES_LOG.md           every tool, model, dataset, library + licence (required by Terms §9)
  EVALUATION.md            baseline vs model results
  REVIEW.md                human review log
```

## Data schema

`data/hadiths/<id>.json`
```ts
type Hadith = {
  id: string;                       // "niyyah"
  titleAr: string;                  // short Arabic title
  matnAr: string;                   // text of the hadith
  routes: Route[];
};
type Route = {
  id: string;                       // "bukhari-1"
  book: { nameAr: string; authorAr: string; edition: string };
  number: string;                   // hadith number in that edition
  volume?: string; page?: string;
  url: string;                      // dorar.net or shamela.ws page
  isnadAr: string;                  // full isnad text exactly as in the source
  chain: string[];                  // narrator ids, from the compiler up to the Prophet ﷺ
  grade: { textAr: string; byAr: string; sourceUrl: string };  // quoted, never computed
};
```

`data/narrators.json`
```ts
type Narrator = {
  id: string;                       // "yahya-ibn-said-al-ansari"
  nameAr: string;                   // common short name
  fullNameAr: string;
  aliasesAr: string[];              // other forms found in isnads (for linking)
  role: "prophet" | "companion" | "narrator" | "compiler";
  tabaqa?: number;                  // generation as in Taqrib
  deathAh?: number;
  gradeAr?: string;                 // quoted from Taqrib al-Tahdhib
  gradeSource?: { book: string; page: string; url?: string };
};
```

## Design tokens

| Token | Hex | Use |
| --- | --- | --- |
| `green` (primary) | #0E4B3B | header, buttons, tree lines |
| `parchment` (bg) | #F5F2EB | page background |
| `paper` (surface) | #FFFDF8 | cards, panels |
| `ink` (text) | #1C1C1A | body text |
| `muted` | #5E6B66 | secondary text |
| `gold` (accent) | #C9A45C | Prophet ﷺ node, common-link ring, active route — **shapes only, never text** |
| `sage` | #6F8F7F | later generations, quiet lines |
| `ok` | #2E7D5B | "source found" badge |
| `check` | #B7791F | «يحتاج تحققًا» badge |
| `bad` | #B23A3A | weak grade quoted / no source |
| `dark-bg` | #0B1F19 | dark mode page |

Tree nodes: Prophet ﷺ = gold circle (top); companions = green circle; later narrators = sage outline circle; compilers = ink square with a book icon; common link = gold ring; branch point = small gold dot. Status colours always come with a word. Respect `prefers-reduced-motion`. Mobile first; no horizontal page scroll. Target WCAG 2.1 AA.

Logo: `public/brand/sanad-mark.svg`. Never stretch or recolour it. At 16 px (favicon) drop the gold frame.

## Skills to use

Install once at the start (from the repo root):

```
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/anthropics/skills --skill webapp-testing
npx skills add vercel-labs/agent-skills
```

- UI work → `frontend-design` + `vercel-react-best-practices`.
- Before each deploy → `web-design-guidelines` review.
- Tests in a real browser → `webapp-testing`.

## How we work

1. One phase (or one clear task) per session. Start in **plan mode**, show the plan, wait for approval, then build.
2. Small commits with clear messages (`feat:`, `fix:`, `docs:`, `test:`). Push to `main`; Vercel deploys.
3. A task is done only when: it builds (`pnpm build`), tests pass (`pnpm test`), it works on mobile width, and it is pushed.
4. Every new library, dataset, model or AI tool → add a row to `docs/SOURCES_LOG.md` right away (type, source, purpose, date, licence).
5. If something is unclear or a scholarly fact is missing, stop and ask. Do not guess.
6. Keep the live demo working at all times. Never push a broken `main`.
