# Review log

Who checked what, and what changed. Only the owner changes `verification.status` to `verified` (CLAUDE.md rule 4).

## 5 Oct 2026 — data track, all 5 hadiths

- **Checked by:** Malek (owner), "through a trusted source" against the Shamela pages linked in each route.
- **Scope:** every isnad text, book, number and link in `data/hadiths/*.json`: 37 routes in 5 hadiths (`niyyah`, `man-kadhaba`, `al-din-al-nasiha`, `la-yuminu`, `buniya-al-islam`).
- **Result:** all 37 routes set to `verification.status: "verified"`, `checkedBy: "Malek"`, `checkedAt: "2026-10-05"`, `method: "manual-checked"`.
- **Not covered:** narrator records in `data/narrators.json` stay `unverified` (the owner's check covered isnads and texts). No named mentor/specialist review is recorded here; add one when it happens.

### Changes made at review time

| Item | Change |
| --- | --- |
| `buniya-al-islam` / `muslim-20` | Grade stays `null`. No source gave a quotable grade; the UI shows «لم ننقل نصّ الحكم بعد، ولن نعرض حكمًا بلا مصدر». |
| `la-yuminu` etc. / `muslim-96` | Unnamed «سفيان» stays the placeholder `sufyan-unidentified` (no open source names him). Its `fullNameAr` was `null`, now «غير منسوب في الإسناد» so it fits the schema. The node stays `unverified`, so the tree shows «يحتاج تحققًا». The route text itself is verified. |
| `al-din-al-nasiha` matn | Shamela's body text (1727, page 160) ends «…وعاماهم.» with a final period and no closing quote. We added the missing final period and kept the source wording. «وعامتهم» appears only in the editor's footnote, which we do not copy. |
| `man-kadhaba` / `muslim-1-a/b/c`, `muslim-2`, `muslim-3`, `muslim-4-a/b` | The grade «[أورده مسلم في مقدمة الصحيح]» is a note, not a grade. Set `grade: null` on all 7 routes. |

### Still open (needs a specialist)

- Narrators identified only from Taqrib context (see each route's `verification.note`), e.g. «يحيى بن زكريا» in `muslim-20`, «همام» in `muslim-3004`.
- Routes split from one numbered entry with two chains (`bukhari-13`, `muslim-71`, the `muslim-1` tahwil).
