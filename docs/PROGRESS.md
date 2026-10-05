# Sanad — Progress Tracker

Live record of what is done, per session in `docs/IMPLEMENTATION.md`. All times are Riyadh time (UTC+3). Update this file at the end of every session.

Last updated: Mon 5 Oct 2026, 08:45.

## Summary

| Session | Status | Planned (original) | Planned (adjusted) |
| --- | --- | --- | --- |
| Setup | ✅ Done | Sun 4 Oct | — |
| A — Foundation and screens | ⏳ Next | Mon 06:00–10:00 | Mon 09:00–12:30 |
| B — Isnad engine and tree | ⬜ Not started | Mon 10:00–14:00 | Mon 12:30–16:30 |
| Data track (owner + mentor) | ⬜ Not started | Mon 10:00–19:00 | Mon 10:00–19:00 (fixed: mentor hours) |
| C — ML narrator tagger | ⬜ Not started | Mon 14:00–21:00 | Mon 16:30–23:00 |
| D — Linking and /parse | ⬜ Not started | Mon 21:00–Tue 01:00 | Mon 23:00–Tue 03:00 |
| E — Quality and evidence | ⬜ Not started | Tue 08:00–13:00 | Tue 08:30–13:00 |
| F — Submission package | ⬜ Not started | Tue 13:00–19:00 | Tue 13:00–18:00 |
| Buffer + submit | — | Tue 19:00–20:00 | Tue 18:00–20:00 (submit by 19:00) |

## Setup

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ✅ Done | Sun 4 Oct 16:52 | `65ff4ff` | Starting version: planning files only (CLAUDE.md, BRIEF, SOURCES_LOG, README, LICENSE, logo). |
| ✅ Done | Mon 5 Oct 07:38 | `d758a43` | Build playbook (`docs/IMPLEMENTATION.md`), updated CLAUDE.md/BRIEF/SOURCES_LOG/.gitignore, design bundle `design/sanad-design.html`. |
| ✅ Done | Mon 5 Oct 08:45 | see `git log` | Readable design source in `design/screens/` (6 screens + canvas.json + README), this tracker. |
| ⚠️ Open | Mon 5 Oct 08:41 | — | Node v24.14.0 OK. **pnpm is not installed.** Run `corepack enable pnpm` in an admin PowerShell (Node is in `C:\Program Files\nodejs`), or `npm i -g pnpm`. Needed before Session A step 3. |

## Session A — Foundation and screens

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ⏳ Next | Planned Mon 09:00–12:30 | — | Starts ~3 h late. If short on time, cut the Open Graph image polish first; keep every "Done when" item. Owner imports the repo in Vercel at the end. |

## Session B — Isnad engine and tree

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ⬜ Not started | Planned Mon 12:30–16:30 | — | If short on time, cut pinch-zoom (keep buttons + wheel) and URL state polish; keep engine tests and the validator. |

## Data track — 5 real hadiths (owner + mentor)

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ⬜ Not started | Planned Mon 10:00–19:00 | — | Fixed by mentoring hours, runs in parallel with A/B/C. Not a Claude Code session; never typed from memory. Finish «إنما الأعمال بالنيات» first and book the mentor review for it in the afternoon. Must be in `data/` before Session D. |

## Session C — ML narrator tagger

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ⬜ Not started | Planned Mon 16:30–23:00 | — | Licences first (Sanadset, bert-mini-arabic). Owner downloads Sanadset to `ml/data/` early (during A/B) and runs the Colab notebook. If short on time, cap training at 50k records. |

## Session D — Linking and /parse

| Status | Date and time | Commit ID | Notes |
| --- | --- | --- | --- |
| ⬜ Not started | Planned Mon 23:00–Tue 03:00 | — | Needs the real data files from the data track. Sleep Tue 03:00–08:30. |

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
