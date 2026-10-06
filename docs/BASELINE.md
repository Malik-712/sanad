# Baseline: the earlier version

The challenge Terms (§8) ask for an open note about any earlier version. An earlier version of this project exists. Hiding it is the risk, not having it.

| Item | Value |
| --- | --- |
| Earlier repository | https://github.com/Malik-712/sanad2 |
| Tag of its last version | `challenge-baseline` → commit `e53189a` (1 Oct 2026, «Mark sanad2 as prior project; point to new sanad repo»). Checked with `git ls-remote` on 6 Oct. |
| What sanad2 is | A Python project (`sanad_core/`, `pipeline/`, `api/`, `evaluation/`, 79 files): BM25 search over the six books, an isnad reader, a tree view, grades from the Dorar API. Its own README says Sanad was rebuilt from scratch in this repository during the challenge days. |
| This repository | https://github.com/Malik-712/sanad, created empty on 4 Oct 2026. First commit `65ff4ff` (4 Oct 16:52, +03:00): «docs: starting version — planning files only». |

## How reuse was checked (6 Oct)

- **Identical files:** every file tracked in this repository was compared with every file in `sanad2` at `challenge-baseline` by git blob hash. **No file is byte-identical.**
- **Same artwork, re-saved:** the logo. See the table.
- **Code:** no code was copied. This repository is TypeScript / Next.js; sanad2 is Python. The ideas below exist in both, and were written again here.

## Reused from sanad2

Per `CLAUDE.md` rule 10, each adapted file has the header `Adapted from sanad2: <path>`.

| File in this repo | Source in sanad2 | What was adapted |
| --- | --- | --- |
| `public/brand/sanad-mark.svg` | `design/sanad-mark.source.svg` | The Sanad mark: same badge, gold frame, corner diamonds and square-Kufic «سند» path. Re-saved without the source file's embedded metadata. |
| `public/brand/sanad-mark-small.svg`, `app/icon.svg` | `design/sanad-mark.source.svg` | The small mark (the same artwork without the gold frame), used below 48 px and as the favicon. |

**Ideas present in both (not code):** the name and slogan «لكلِّ حديثٍ إسناد»; one tree per hadith from the Prophet ﷺ to the compilers; grades only as quotes with their author; a rule-based isnad reader that handles «ح» (tahwil) and two narrators joined by «و». The reader in `lib/parser/` was written on 6 Oct in TypeScript without opening sanad2's reader.

## Built during the challenge (4–6 Oct 2026)

Everything else in this repository. Summary by day (details in `docs/PROGRESS.md` and `git log`):

| Day | Built |
| --- | --- |
| Sun 4 Oct | Planning files: brief, rules (`CLAUDE.md`), sources log, logo file |
| Mon 5 Oct | Build playbook; the approved design (Claude Design export); Next.js app, design tokens, Arabic copy file, layout, pages; the data track: 5 hadiths, 37 isnads, 92 narrator records copied from al-Maktaba al-Shamila with page links and checked by the owner |
| Tue 6 Oct | Isnad engine and drawn tree (Session B); narrator tagger trained and evaluated on Sanadset, rule parser, linker, the live `/parse` page (Sessions C–D); tests, accessibility, Lighthouse, documentation and submission material (Sessions E–F) |
