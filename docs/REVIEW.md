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

**Phase 2 status (superseded by the verification pass below):** not closed. The earlier pass was authorised to close it; the verification pass of 5 Oct (evening) was told not to mark it complete.

## 5 Oct 2026 — verification pass (branch `phase2-verification`)

Reports: [`docs/VERIFY-ISNADS.md`](VERIFY-ISNADS.md), [`docs/VERIFY-NARRATORS.md`](VERIFY-NARRATORS.md). Source for everything: Shamela (Bukhari ط السلطانية 1681, Muslim ت عبد الباقي 1727, Taqrib 8609, Nawawi's sharh 1711, Ibn al-Salah ed. Itr 22870).

### Result in numbers

| Item | Count |
| --- | --- |
| Routes compared with Shamela | 37 |
| Differences found | 6 kinds, 0 in isnad wording (D1–D5 in `VERIFY-ISNADS.md`; D1, D2 are mistakes from my own 5 Oct migration) |
| Narrators compared with Taqrib in this pass | 73 (+17 cross-checked by number and page against the external report) |
| Narrator mismatches | 0 |
| Narrators with same-name entries flagged (`identification: null`) | 9 (8 same-name + «يحيى بن زكريا») |
| `identification`: «نص» / «قرينة» / empty | 19 / 27 / 47 |

### What changed in the data

- New optional narrator field `identification` (rules in `CLAUDE.md`), and `verification.note` documented for narrators. The 9 flagged records carry their candidate Taqrib entry numbers in `verification.note`.
- `sad-ibn-tariq-abu-malik-al-ashjai`: evidence added from Nawawi, *Sharh Muslim* 1/177–178 («أبو مالك الأشجعي فهو سعد بن طارق»).
- `muhammad-ibn-hatim-unidentified`: note now lists all five Taqrib entries (5791–5795) and the two marked «م».
- The routes with a null grade (`muslim-muqaddima-*`, `muslim-iman-16-n20`) now say in their note what was searched; no grade was added or changed.
- `inclusion` was not added anywhere new. It stays on the Muslim routes inside the Sahih proper, never on the Muqaddima, and is not applied to `muslim-iman-16-n20` or `muslim-zuhd-3004-n72` (left open by the owner).
- Transcription fixes in the data: none (there were no copy errors).

### Not changed on purpose (as instructed)

`muhammad-ibn-hatim-unidentified`, the grade of `muslim-iman-16-n20`, marfu'/mawquf of `muslim-zuhd-3004-n72`, «سفيان» in `muslim-iman-55-n96`, and the grades of the Muqaddima routes. The Taqrib `edition` field.

### Top problems found

1. `number` of the four Muqaddima entries is shorter than the printed form («١» vs «١ - (١)», …, `muslim-muqaddima-n1…n4`) and the unnumbered isnad has an added phrase. Caused by my migration; not fixed because this pass was report-only.
2. Same-name narrators were linked by one id without a text that decides: Anas (565/566), «محمد بن جعفر» (5785–5789) in `muslim-iman-45-n71`, «محمد بن كثير» (6251–6255), «يحيى بن سعيد» (7554–7559) in six niyyah routes, Ali ibn Rabia (4733 vs the Bajali), Ibn Umar.
3. Muhammad ibn Hatim: Ibn Maymun or Ibn Bazi' is still undecided.
4. «يحيى بن زكريا» in `muslim-iman-16-n20` (7548 vs 7549): Nawawi does not settle it.
5. `muslim-muqaddima-n1-*` has no `page`: Shamela's label «1/ 1» looks wrong; the printed volume must be checked.
6. The route-level matn is not stored, and route wordings differ (e.g. «بالنية» vs «بالنيات»).
7. The Muqaddima routes and `muslim-iman-16-n20` have no ruling; Nawawi's sharh gives none for them in the passages searched.
8. The two identifications made by the external report itself (`muhammad-ibn-abbad-al-makki`, `hammam-ibn-yahya`) are «قرينة» only.
9. The Taqrib `edition` is still the Shamela placeholder text.
10. The comparison of isnads is by reading, not a byte diff (see the method in `VERIFY-ISNADS.md`).

### What remains for the owner (Phase 2 is not complete)

- [ ] The five hadith names confirmed, and the deadline (the first request had them in square brackets).
- [ ] Confirm that `muslim-96` meant **narration 96** (hadith (55)), not hadith (96).
- [ ] The Taqrib edition (publisher, editor, year) from the printed copy.
- [ ] Resolve Muhammad ibn Hatim in *Tahdhib al-Kamal* or *Tuhfat al-Ashraf*.
- [ ] Decide the same-name table in `VERIFY-NARRATORS.md`.
- [ ] Approve the fix for D1/D2 in `VERIFY-ISNADS.md` and check the page of `muslim-muqaddima-n1-*`.
- [ ] A specialist's review of at least one full hadith.

## 5 Oct 2026 — owner decisions after the verification pass

Decisions given by the owner (Malek) and applied:

1. **Merged** `phase2-verification` into `main` (merge commit `260eb32`).
2. **Muqaddima numbers fixed** (D1/D2 in `VERIFY-ISNADS.md`): `muslim-muqaddima-n1-a/b/c` «١ - (١)», `n2` «٢ - (٢)», `n3` «٣ - (٣)», `n4-a/b` «٤ - (٤)», `muslim-iman-55-unnumbered` «(٥٥) -». 8 routes; structure check passes.
3. **`muslim-iman-55-n96` = narration 96 (hadith (55))**: confirmed. Shamela prints «٩٦ - (٥٥)» on Sahih Muslim (Abd al-Baqi) 1/75, https://shamela.ws/book/1727/161, and the id `muslim-iman-55-n96` already says so; it is not hadith (96).
4. **Accepted as they are** (no change): all current narrator `identification` values (19 «نص», 27 «قرينة», 47 empty, 9 of them flagged same-name) and all null grades (the 7 Muqaddima routes and `muslim-iman-16-n20` stay «لم أجد»).
5. **Phase 2 checklist** (`docs/BRIEF.md`): tasks 1–5 ticked.

### Honest note on task 5

The owner marked task 5 complete. This log records no named specialist or mentor review of a full hadith, so that part of the task rests on the owner's own checks. When a mentor reviews one (the best candidate is «إنما الأعمال بالنيات»), add the name, date and changes here.

### Still open after this (no longer blocking Session A)

- Same-name narrators (`VERIFY-NARRATORS.md`) — accepted as null for now.
- Muhammad ibn Hatim, «يحيى بن زكريا» in `n20`, marfu'/mawquf of `muslim-zuhd-3004-n72`, «سفيان» in `n96`.
- The Taqrib `edition` (publisher, editor, year) from the printed copy.
- D3: the printed page of `muslim-muqaddima-n1-*`.