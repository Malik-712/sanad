# Tools, models and data log

Required by the challenge Terms and Conditions, §9. Add a row for every AI tool, model, service, dataset, library or source the moment we start using it.

| Date | Type | Name | Source / link | Purpose in Sanad | Licence / legal basis |
| --- | --- | --- | --- | --- | --- |
| 2026-10-04 | AI tool | Claude (claude.ai) | https://claude.ai | Planning, brief, logo draft (`sanad-mark.svg`) | Anthropic Consumer Terms (Claude Pro) |
| 2026-10-04 | AI tool | Claude Code | https://claude.com/claude-code | Writing and testing code, with human review | Anthropic Consumer Terms (Claude Pro) |
| 2026-10-04 | AI tool | Claude Design | https://claude.ai | UI design system and screen designs | Anthropic Consumer Terms (Claude Pro) |
| 2026-10-04 | Font | IBM Plex Sans Arabic | https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic | The only font: interface, hadith text, narrator names | SIL Open Font License 1.1 (check on the font page) |
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

## To add when used

- Sanadset 650K (training and evaluation data) — licence to be checked on Mendeley Data.
- asafaya/bert-mini-arabic (base model) — licence to be checked on Hugging Face.
- Every npm and Python package (name, version, licence) — can be generated with `npx license-checker --summary` and `pip-licenses`.
- Every hadith source page used in `data/` (dorar.net, shamela.ws).

## Starting version (Terms §8)

The repository `Malik-712/sanad` was created empty. The first commit on 4 Oct 2026 contains only planning files (`CLAUDE.md`, `docs/`, logo). All code was written during the challenge window (4–6 Oct 2026).
