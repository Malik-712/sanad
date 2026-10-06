# Tools, models and data log

Required by the challenge Terms and Conditions, §9. Add a row for every AI tool, model, service, dataset, library or source the moment we start using it.

| Date | Type | Name | Source / link | Purpose in Sanad | Licence / legal basis |
| --- | --- | --- | --- | --- | --- |
| 2026-10-04 | AI tool | Claude (claude.ai) | https://claude.ai | Planning, brief, logo draft (`sanad-mark.svg`) | Anthropic Consumer Terms (Claude Pro) — the terms assign outputs to the user: «we assign to you all of our right, title, and interest—if any—in Outputs» (anthropic.com/legal/consumer-terms, read 6 Oct) |
| 2026-10-04 | AI tool | Claude Code | https://claude.com/claude-code | Writing and testing code, with human review | Anthropic Consumer Terms (Claude Pro) |
| 2026-10-04 | AI tool | Claude Design | https://claude.ai | UI design system and screen designs | Anthropic Consumer Terms (Claude Pro) — the terms assign outputs to the user: «we assign to you all of our right, title, and interest—if any—in Outputs» (anthropic.com/legal/consumer-terms, read 6 Oct) |
| 2026-10-04 | Font | IBM Plex Sans Arabic | https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic | The only font: interface, hadith text, narrator names | SIL Open Font License 1.1, Reserved Font Name «Plex» (read from `ofl/ibmplexsansarabic/OFL.txt` in github.com/google/fonts, 6 Oct); self-hosted by `next/font` from the Google Fonts files |
| 2026-10-04 | Hosting | Vercel (Hobby) | https://vercel.com | Live demo hosting | Vercel Terms of Service |
| 2026-10-05 | Tool | pnpm 12.9.1 | https://pnpm.io | Package manager | MIT |
| 2026-10-05 | Library | next 16.3.8 | https://www.npmjs.com/package/next | Web framework (App Router, static pages, `next/font`) | MIT |
| 2026-10-05 | Library | react 19.2.8, react-dom 19.2.8 | https://www.npmjs.com/package/react | UI library | MIT |
| 2026-10-05 | Library | tailwindcss 4.3.3, @tailwindcss/postcss 4.3.3 | https://www.npmjs.com/package/tailwindcss | Styling and design tokens (`@theme`) | MIT |
| 2026-10-05 | Dev tool | typescript 5.9.3 | https://www.npmjs.com/package/typescript | Type checking (`strict`) | Apache-2.0 |
| 2026-10-05 | Dev tool | eslint 9.39.5, eslint-config-next 16.3.8 | https://www.npmjs.com/package/eslint | Linting | MIT |
| 2026-10-05 | Dev tool | @types/node 20.19.43, @types/react 19.3.0, @types/react-dom 19.3.0 | https://www.npmjs.com/package/@types/react | Type definitions | MIT |
| 2026-10-05 | Dev tool | vitest 5.0.3, vite-tsconfig-paths 6.1.1 | https://www.npmjs.com/package/vitest | Unit tests (logic) | MIT |
| 2026-10-05 | Dev tool | tsx 4.23.15 | https://www.npmjs.com/package/tsx | Runs `scripts/validate-data.ts` | MIT |
| 2026-10-05 | AI tool | Agent skills: frontend-design, webapp-testing (anthropics/skills) | https://github.com/anthropics/skills | Claude Code guidance for UI work and browser tests (dev only, not shipped) | Apache-2.0 (LICENSE.txt in each skill) |
| 2026-10-05 | AI tool | Agent skills: vercel-labs/agent-skills (vercel-react-best-practices, web-design-guidelines, …) | https://github.com/vercel-labs/agent-skills | Claude Code guidance for React/Next.js and UI review (dev only, not shipped) | MIT |
| 2026-10-05 | Service | shields.io badges | https://shields.io | Static badges in `README.md` | Apache-2.0 (licence of the badges/shields repository, read from the GitHub API) |
| 2026-10-05 | Dev tool | playwright-core 1.63.0 (with the installed Google Chrome) | https://www.npmjs.com/package/playwright-core | One-off screenshot, keyboard and focus checks at 390px and 1440px; run outside the repo, not shipped | Apache-2.0 |
| 2026-10-05 | Dev tool | kill-port 2.0.1 (via npx) | https://www.npmjs.com/package/kill-port | Stops the local test server between checks; not in the repo | MIT |
| 2026-10-05 | AI tool | Vercel connector (claude.ai) | https://vercel.com | Read-only checks of deployments and project protection settings | Vercel Terms of Service |
| 2026-10-05 | AI tool | Context7 (documentation lookup) | https://github.com/upstash/context7 | Checking current Tailwind CSS docs | MIT (server code); the hosted service has its own terms |
| 2026-10-05 | AI tool | Shamela connector («وصلة الشاملة», local Shamela library) | — | Reading Taqrib and al-Isaba pages for the companion honorific checks (`docs/RESOLUTIONS.md`) | unclear — no licence stated; not used by the public site (see `docs/REVIEW.md`) |
| 2026-10-05 | Source | Ibn Hajar, *al-Isaba fi Tamyiz al-Sahaba* (al-Maktaba al-Shamila, book 9767) | https://shamela.ws/book/9767 | Evidence for the honorific decision (entries cited in `docs/RESOLUTIONS.md`); nothing copied into `data/` | unclear — cited by name and link only, no text reproduced (owner decision, 6 Oct; see `docs/REVIEW.md`) |

| 2026-10-06 | Font | Scheherazade New, Regular (unmodified file from github.com/google/fonts, `ofl/scheherazadenew`) | https://software.sil.org/scheherazade/ | Fallback for one sign only, «﵁» (U+FD41), which IBM Plex Sans Arabic lacks; `unicode-range: U+FD41`, fetched only on pages that contain the sign | SIL Open Font License 1.1, Reserved Font Names «Scheherazade» and «SIL»; the file is shipped unmodified with `app/fonts/OFL-ScheherazadeNew.txt` |

| 2026-10-06 | Dev tool | axe-core 4.14.0 (with playwright-core) | https://www.npmjs.com/package/axe-core | One-off accessibility scan of all pages at 390px and 1440px; run outside the repo, not shipped | MPL-2.0 |
| 2026-10-04 | Source | al-Maktaba al-Shamila (shamela.ws): Bukhari (1681), Muslim (1727), Taqrib (8609), Ibn al-Salah (22870), and the books cited in notes | https://shamela.ws | Where the hadith, isnad and narrator texts in `data/` were read and copied from (see `docs/SOURCES.md`) | unclear — no terms or licence page found on the site (checked 6 Oct); the texts are classical, no editor's notes copied |
| 2026-10-05 | Source | dorar.net (الدرر السنية) | https://dorar.net | The short grade quoted on 29 isnads, with its author and a link | unclear — FAQ (dorar.net/feedback, read 28 Sep) says the content is for searching on the site and not to be copied; only a short attributed quote and link are stored; owner decision pending |

| 2026-10-06 | Library | zod 4.6.5 | https://www.npmjs.com/package/zod | Data schema and validation (`lib/data/schema.ts`, `pnpm validate:data`) | MIT |
| 2026-10-06 | Library | @dagrejs/dagre 3.1.1 | https://www.npmjs.com/package/@dagrejs/dagre | Tree layout (positions of the isnad tree nodes) | MIT |
| 2026-10-06 | Dataset | Sanadset 650K (Mendeley Data, DOI 10.17632/5xth87zwb5.5) | https://data.mendeley.com/datasets/5xth87zwb5 | Training and evaluation data for the narrator tagger (`ml/`); the raw file is not committed | unclear — no licence line shown on the page (checked 6 Oct). Owner decision 6 Oct: proceed for research and evaluation only; the rule parser stays the default engine, and the trained model is reported in `docs/EVALUATION.md` with this note |
| 2026-10-06 | Model | asafaya/bert-mini-arabic (base model for fine-tuning) | https://huggingface.co/asafaya/bert-mini-arabic | Starting weights for the narrator tagger | unclear — the Hugging Face card has no licence field; the author's code repository (github.com/alisafaya/Arabic-BERT) shows MIT, with no separate terms for the pretrained weights. Citation requested: Safaya et al., 2020 (SemEval) |
| 2026-10-06 | Dev tool (Python) | pandas 3.0.6, numpy 2.5.3 | https://pypi.org/project/pandas/ | Reading Sanadset in chunks (`ml/prepare_data.py`); offline only | pandas: BSD-3-Clause; numpy: BSD-3-Clause AND 0BSD AND MIT AND Zlib AND CC0-1.0 (package metadata) |
| 2026-10-06 | Dev tool (Python) | seqeval 1.2.2 | https://pypi.org/project/seqeval/ | Entity precision / recall / F1 (`ml/evaluate.py`, `ml/train.py`) | MIT (package metadata) |
| 2026-10-06 | Dev tool (Python) | pytest 9.1.1 | https://pypi.org/project/pytest/ | Twin tests of the Python normaliser and tokeniser | MIT (package metadata) |
| 2026-10-06 | Library (Python) | torch 2.14.1+cpu | https://pytorch.org | Training the narrator tagger on CPU; offline only, not shipped | Apache-2.0 AND Apache-2.0 WITH LLVM-exception AND BSD-2-Clause AND BSD-3-Clause AND BSL-1.0 AND MIT (package metadata) |
| 2026-10-06 | Library (Python) | transformers 4.57.6, datasets 5.0.1, accelerate 1.15.0 | https://pypi.org/project/transformers/ | Fine-tuning and prediction (`ml/train.py`, `ml/predict.py`); offline only | Apache-2.0 (package metadata) |
| 2026-10-06 | Library (Python) | optimum 2.1.0, onnx 1.23.2, onnxruntime 1.30.0 | https://pypi.org/project/optimum/ | ONNX export, int8 quantisation and parity check (`ml/export_onnx.py`); the exported model is not shipped | optimum, onnx: Apache-2.0; onnxruntime: MIT (package metadata) |
| 2026-10-06 | Dev tool | @playwright/test 1.63.0, @axe-core/playwright 4.13.0 | https://www.npmjs.com/package/@playwright/test | End-to-end tests of `/parse` (flow, privacy spy, axe scan) in the installed Edge; not shipped | @playwright/test: Apache-2.0; @axe-core/playwright: MPL-2.0 (package.json) |

## To add when used

- Every npm and Python package (name, version, licence) — can be generated with `npx license-checker --summary` and `pip-licenses`.

## How licences were checked

Each licence was read from the package's `license` field or LICENSE file, the font's `OFL.txt`, the service's terms page, or the GitHub API for the repository. Where no licence or terms could be found, the row says «unclear» and the item is listed for the owner in `docs/REVIEW.md` or `docs/SOURCES.md`.

## Starting version (Terms §8)

The repository `Malik-712/sanad` was created empty. The first commit on 4 Oct 2026 contains only planning files (`CLAUDE.md`, `docs/`, logo). All code was written during the challenge window (4–6 Oct 2026).
