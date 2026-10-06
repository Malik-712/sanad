# Cost and sustainability

How much Sanad costs to run, what it depends on, how it is kept correct, and what happens if a part fails. Figures are as measured or configured on 6 Oct 2026.

## 1. Running cost: zero

| Item | What Sanad uses | Cost |
| --- | --- | --- |
| Hosting | Vercel, Hobby plan (free), auto-deploy from `main` | $0 |
| Server code | None. Every page is generated at build time from JSON (`generateStaticParams`); no API route, no server function at runtime | $0 |
| Database | None. The data is `data/*.json` in the repository | $0 |
| AI at runtime | None called. `/parse` runs the rule parser and the linker in the visitor's browser; no model API, no GPU, no key | $0 |
| Secrets | None needed; none in the repository (history scanned, 56 commits) | — |
| Source code and CI | GitHub public repository; GitHub Actions on every push | $0 |
| Domain | The free `*.vercel.app` address | $0 |

What a visitor downloads (Lighthouse, median of 3 runs, mobile): **510–718 KB per page**, fonts included (`docs/EVALUATION.md` (c)).

**One-off costs already paid (not running costs):** the model was trained once on a laptop CPU in 27.9 minutes; no cloud GPU was used.

## 2. Dependencies

**Shipped with the site:** 5 direct packages, 18 with their dependencies (`docs/licenses/npm.md`):

| Package | Role | If it went away |
| --- | --- | --- |
| `next` 16.3.8, `react` / `react-dom` 19.2.8 | Framework and UI | Pinned versions keep building; the generated pages are plain HTML, CSS and JS |
| `@dagrejs/dagre` 3.1.1 | Tree layout, computed when pages are generated | Pinned; layouts for the 5 hadiths are produced at build time |
| `zod` 4.6.5 | Data schema and validation at build time | Pinned |

**Fonts:** IBM Plex Sans Arabic (via `next/font`, self-hosted with the site, no request to Google at runtime) and one file of Scheherazade New for the sign «﵁». Both SIL OFL 1.1.

**Development only (not shipped):** Vitest, Playwright, axe-core, ESLint, TypeScript, Lighthouse (357 packages, `docs/licenses/npm.md`). **Offline ML only:** 65 Python packages (`docs/licenses/python.md`).

**Lock files:** `pnpm-lock.yaml` pins every version; CI installs with `--frozen-lockfile`.

## 3. Critical parts and their fallbacks

| Part | What could fail | Fallback |
| --- | --- | --- |
| Vercel | Outage, or the free plan changes | The same `pnpm build` output deploys to any host that runs Next.js (Netlify, Cloudflare, a small Node server). No data or secret is tied to Vercel. |
| Source links (shamela.ws, dorar.net) | A page moves | The isnad text, book, edition, number, volume and page are stored in `data/`, so the citation stays complete without the link; a broken link is fixed in one JSON field. |
| Narrator extraction on `/parse` | Wrong or missing names | It never decides alone: uncertain names are «يحتاج تحققًا» with choices; unknown ones are «لا مصدر بعد». The trained model, if its data licence is cleared, can replace the rules with the rules kept as the fallback (`docs/EVALUATION.md`). |
| The browser | Old browser, JavaScript off | Pages are generated as static HTML (the hadith list, the drawn tree, narrator pages, About). Interaction needs JavaScript: search filtering, choosing an isnad and its source panel, pan and zoom, and `/parse`. |
| A data error | A wrong or unsourced fact | `pnpm validate:data` runs before every build and fails it if an isnad lacks a source, number or book, or a chain names an unknown narrator. |

## 4. Upkeep and review plan

| When | What | Who | Where it is logged |
| --- | --- | --- | --- |
| Each new hadith | Copy every isnad word for word with its page link (`method`, `retrieved`), add missing narrators, run `pnpm validate:data`; new data starts «unverified» | Owner | `data/`, `docs/SOURCES.md` |
| Before marking «verified» | Check each isnad and narrator against its page; record what was checked | Owner, then a hadith specialist | `docs/REVIEW.md` |
| Next | Review the 92 narrator records (all «يحتاج تحققًا» today) with a specialist | Owner + specialist | `docs/REVIEW.md` |
| Every push | Lint, 130 unit tests, data validation, hard cases ×3, build | GitHub Actions | `.github/workflows/ci.yml` |
| Monthly | Open every source link (37 isnad pages, Taqrib pages); fix moved ones | Owner | `docs/REVIEW.md` |
| On each dependency update | Re-run `pnpm test:e2e`, Lighthouse and the licence lists | Owner | `docs/EVALUATION.md`, `docs/licenses/` |

## 5. Alternatives considered

| Instead of | We use | Why |
| --- | --- | --- |
| An LLM API to read isnads | Rule parser in the browser (a trained model kept offline) | No per-call cost, no key, text stays on the device, deterministic (3 runs, identical output) |
| A server and database | Static pages from JSON | Nothing to pay for or patch at runtime; the data is reviewable in git |
| A canvas or graph library for the tree | Own SVG renderer + dagre | Matches the design exactly; small; no runtime layout cost |
