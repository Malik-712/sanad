<p align="center">
  <img src="public/brand/sanad-mark.svg" alt="Sanad logo" width="120" height="120">
</p>

<h1 align="center">Sanad (سَنَد)</h1>

<p align="center"><strong dir="rtl">لكلِّ حديثٍ إسناد</strong><br>Every hadith has its isnad.</p>

<p align="center">
  An Arabic, right-to-left web app that merges every chain of narration (isnad) of one hadith into a single interactive, source-linked tree.
</p>

<p align="center">
  <a href="https://sanad-pi-five.vercel.app"><strong>Live demo →</strong></a>
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-1C1C1A?labelColor=0E4B3B">
  <img alt="TypeScript strict" src="https://img.shields.io/badge/TypeScript-strict-1C1C1A?labelColor=0E4B3B">
  <img alt="Licence: all rights reserved" src="https://img.shields.io/badge/licence-all%20rights%20reserved-1C1C1A?labelColor=0E4B3B">
</p>

Built for the AI Challenge — Serving Islamic Content, **Track 04: knowledge and verification tools** (4–6 Oct 2026).

## What it does

- Shows all routes of one hadith merged into one tree: the Prophet ﷺ at the top, the compilers at the bottom, with the common link (*madar*) and the points where routes split.
- Every route links to its source: book, hadith number, volume, page and a page URL.
- Click a narrator to see who he is, with his ruling quoted from the book that says it.
- A small machine learning model, running in the browser, reads a pasted isnad, finds the narrator names and links each one to a narrator record. Pasted text never leaves the browser.

## Status

The challenge window is 4–6 Oct 2026. This table is kept in step with [docs/PROGRESS.md](docs/PROGRESS.md).

| Built | Next |
| --- | --- |
| Foundation: Arabic RTL layout, design tokens, IBM Plex Sans Arabic, live deployment | Screens: Home, hadith tree, narrator page, paste page, about page |
| Data: 5 hadiths, 37 isnads, 92 narrator records, each with a source URL | Isnad engine and the interactive tree |
| Data validator that runs before every build | ML narrator tagger and `/parse` |

The live page is a placeholder until the screens are built.

## How Sanad treats hadith

- **Every fact has a source.** Hadith text, isnads, book numbers and pages are copied word for word from a source page, and its URL is stored next to the fact. If there is no source, the interface says «لا مصدر بعد».
- **Sanad quotes, it never grades.** A ruling is shown only as a quote with who said it and where. Sanad does not call a hadith or a narrator sound or weak in its own voice.
- **When unsure, it says so.** Unverified data and low-confidence matches are marked «يحتاج تحققًا» and offer candidates, instead of a silent guess.

> أداة مساعدة بالذكاء الاصطناعي، لا تحكم على الأحاديث ولا تُفتي

## Run locally

Needs Node 20.9 or newer and pnpm (`corepack enable` or `npm i -g pnpm`).

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Checks that must pass before every push to `main`:

```bash
pnpm lint
pnpm test
pnpm validate:data
pnpm build
```

## Tech stack

- Next.js 16 (App Router, static pages from JSON), TypeScript `strict`
- Tailwind CSS 4 with the design colours as the only tokens (flat, no shadows)
- IBM Plex Sans Arabic as the only font
- Vitest for logic tests
- Planned: Playwright with axe for end-to-end and accessibility tests, Transformers.js for the in-browser model
- Hosting: Vercel Hobby. No database and no server secrets.

## Repository map

| Path | Contents |
| --- | --- |
| `app/` | Pages, layout, global styles |
| `lib/` | Arabic UI copy (`lib/copy/ar.ts`), helpers |
| `data/` | Hadiths and narrators as JSON, each with its source |
| `design/` | The approved UI design, for reference only |
| `docs/` | Brief, playbook, progress, sources and review logs |
| `scripts/` | Data validation |
| `public/` | Logo and static files |

## Documentation

- [docs/BRIEF.md](docs/BRIEF.md): concept, goals and judging criteria
- [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md): build playbook
- [docs/PROGRESS.md](docs/PROGRESS.md): what is done
- [docs/SOURCES_LOG.md](docs/SOURCES_LOG.md): every tool, model, dataset and package, with its licence
- [docs/BASELINE.md](docs/BASELINE.md): the earlier version of this project
- [CLAUDE.md](CLAUDE.md): project rules, scholarly rules, schema and design tokens

## AI use and sources

Sanad is built with Claude Code and Claude Design, with human review of the code and of every scholarly fact. The full log of AI tools, models, data and open-source packages, with licences, is in [docs/SOURCES_LOG.md](docs/SOURCES_LOG.md). An earlier version of the project exists and is disclosed in [docs/BASELINE.md](docs/BASELINE.md).

## Licence

All rights reserved — see [LICENSE](LICENSE). Third-party packages keep their own licences, listed in [docs/SOURCES_LOG.md](docs/SOURCES_LOG.md).
