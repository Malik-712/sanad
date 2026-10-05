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
| `buniya-al-islam` / `muslim-iman-16-n20` | Grade stays `null`. No source gave a quotable grade; the UI shows «لم ننقل نصّ الحكم بعد، ولن نعرض حكمًا بلا مصدر». |
| `al-din-al-nasiha` / `muslim-iman-55-n96` | Unnamed «سفيان» stays the placeholder `sufyan-unidentified` (no open source names him). Its `fullNameAr` was `null`, now «غير منسوب في الإسناد» so it fits the schema. The node stays `unverified`, so the tree shows «يحتاج تحققًا». The route text itself is verified. |
| `al-din-al-nasiha` matn | Shamela's body text (1727, page 160) ends «…وعاماهم.» with a final period and no closing quote. We added the missing final period and kept the source wording. «وعامتهم» appears only in the editor's footnote, which we do not copy. |
| `man-kadhaba` / `muslim-muqaddima-n1-a/b/c`, `n2`, `n3`, `n4-a/b` | The grade «[أورده مسلم في مقدمة الصحيح]» is a note, not a grade. Set `grade: null` on all 7 routes. |

### Still open (needs a specialist)

- Narrators identified only from Taqrib context (see each route's `verification.note`), e.g. «يحيى بن زكريا» in `muslim-20`, «همام» in `muslim-3004`.
- Routes split from one numbered entry with two chains (`bukhari-13`, `muslim-71`, the `muslim-1` tahwil).

## 5 Oct 2026 — second pass: external report adopted

Source: a review report prepared with Claude from al-Maktaba al-Shamila (book ids in the report), approved by the owner as is.

- **Narrators:** the report's table (17 narrators: entry number and page in Taqrib al-Tahdhib) was cross-checked against `data/narrators.json`: 17 of 17 match. Shamela gives no publisher or edition for Taqrib, so the `edition` field still says so; add the printed edition when the owner has it.
- **«أخرجه مسلم في صحيحه»:** added as the optional route field `inclusion`, only on Muslim routes inside the Sahih, quoting Ibn al-Salah, *Muqaddima* (ed. Itr) pp. 28–29 (https://shamela.ws/book/22870/26), word for word. Not applied to the Muqaddima routes (`muslim-muqaddima-*`): those keep `grade: null`, i.e. «لم أجد». Not applied to `muslim-iman-16-n20` and `muslim-zuhd-3004-n72` (unresolved, below).
- **`al-din-al-nasiha` matn:** main text now reads «وعامتهم»; «وعاماهم» is kept in the new `matnVariants` field with the citation Sahih Muslim (ed. Abd al-Baqi) 1/74, ḥ 55 (95), and the Turkish edition 1/53.
- **`muslim-iman-55-n96`:** «سفيان» stays unattributed. Abu Nuaym, *al-Mustakhraj* 1/142 no. 193 (Ibn Mahdi from Sufyan b. Said) is recorded in the route note as «قرينة لا نصّ» (evidence, not a text).
- **Identifiers:** Muslim route ids now carry kitab, hadith number and narration number (e.g. `muslim-iman-55-n96`), and `number` holds the printed form «٩٦ - (٥٥)». Bukhari ids are unchanged (one number only).

### Left unresolved on purpose (empty fields / «لم أجد»)

- «محمد بن حاتم» in `muslim-iman-55-n96`: Ibn Maymun (Taqrib 5793) or Ibn Bazi' (5791)? Now the placeholder `muhammad-ibn-hatim-unidentified` with no Taqrib entry (before this pass it was assigned to Ibn Maymun from a different hadith; that was withdrawn).
- `muslim-iman-16-n20`: grade stays `null`; the Yahya b. Zakariyya identification is Taqrib-context only.
- `muslim-zuhd-3004-n72`: whether the hadith is marfu' or mawquf to Abu Said: «لم أجد»; nothing written from memory.
- The other isnads of «إنما الأعمال بالنيات» (all except `bukhari-1`): not reviewed by the report; they remain as the owner verified them on 5 Oct.
- Two identifications made by the report itself, not stated in the chains, are marked «قرينة لا نصّ» and should be confirmed in *Tahdhib al-Kamal*: «محمد بن عباد المكي» (= Ibn al-Zibriqan) and «همام» (= Ibn Yahya).

**Phase 2 status:** closed by the owner's authorization, with the items above left open.