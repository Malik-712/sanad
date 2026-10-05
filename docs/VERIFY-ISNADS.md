# Isnad verification report — all 37 routes against Shamela

Date: 5 Oct 2026. Branch: `phase2-verification`. Nothing in `data/hadiths/` was changed to fix a difference found here (report only).

## Method

- Every route was compared with its Shamela page (same book id and page id as the route's `url`): Sahih al-Bukhari ط السلطانية (1681) and Sahih Muslim ت عبد الباقي (1727).
- Compared for each route: isnad wording, hadith number, narration number, kitab, volume, printed page, and that the link opens the page that carries the isnad.
- The matn of each hadith was compared at its `matnSource` page.
- The comparison is a word-level reading of each Shamela page against our text (diacritics ignored, spacing ignored). It is not a byte-level diff. Footnotes (editor's notes) were not read or copied.
- Shamela printed pages are the labels Shamela shows (`printed_page`), not Shamela page ids.

## Result

| Check | Routes | Differences |
| --- | --- | --- |
| Isnad wording (word level) | 37 / 37 | 0 |
| Chain order vs our `chain` ids (names in the isnad vs narrator records) | 37 / 37 | 0 |
| Link opens the page that holds the isnad | 37 / 37 | 0 |
| Bukhari hadith number, volume, printed page | 17 / 17 | 0 |
| Muslim printed page and volume | 20 / 20 | 1 (see D3) |
| Muslim `number` field vs the printed form | 20 / 20 | 5 + 1 (see D1, D2) |
| Hadith-level matn at its `matnSource` | 5 / 5 | 1 intentional (D5) |

## Differences (route id, field, our value, Shamela value, source)

| # | Route | Field | Our value | Shamela value | Source | Kind |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | `muslim-muqaddima-n1-a/b/c` | `number` | «١» | «١ - (١)» | Sahih Muslim (Abd al-Baqi) 1/1 (Shamela label), https://shamela.ws/book/1727/11 | our value is shorter than the printed form |
| D1 | `muslim-muqaddima-n2` | `number` | «٢» | «٢ - (٢)» | 1/10, https://shamela.ws/book/1727/12 | same |
| D1 | `muslim-muqaddima-n3` | `number` | «٣» | «٣ - (٣)» | 1/10, https://shamela.ws/book/1727/13 | same |
| D1 | `muslim-muqaddima-n4-a/b` | `number` | «٤» | «٤ - (٤)» | 1/10, https://shamela.ws/book/1727/14 | same |
| D2 | `muslim-iman-55-unnumbered` | `number` | «(٥٥) - بلا رقم تسلسلي» | «(٥٥) -» (no narration number) | 1/75, https://shamela.ws/book/1727/162 | we added a descriptive phrase that is not in the book |
| D3 | `muslim-muqaddima-n1-a/b/c` | `page` | omitted | Shamela label «1/ 1» | https://shamela.ws/book/1727/11 | the label looks wrong (neighbours are 1/10), so `page` was left out on purpose; check the printed volume |
| D4 | all Bukhari routes | `number` | Western digits («54») | Arabic-Indic digits («٥٤») | 1681 | digit style differs from the Muslim routes; not an error of content |
| D5 | `al-din-al-nasiha` hadith | `matnAr` | «…ولأئمة المسلمين وعامتهم.» | «…ولأئمة المسلمين وعاماهم.» | 1/74, https://shamela.ws/book/1727/160 | intentional (owner decision 5 Oct, Turkish ed. 1/53); the Shamela wording is kept in `matnVariants` |

**Status (5 Oct, evening): D1 and D2 are fixed** (owner approved; 
umber now holds the printed form). D3 stays open. The rest of this section describes the state before the fix.

D1 and D2 are caused by my own migration on 5 Oct (the `number` values I wrote for the Muqaddima and the unnumbered isnad). They are not copy errors from the source. Suggested fix, for the owner to approve: set `number` to the printed form («١ - (١)», «٢ - (٢)», «٣ - (٣)», «٤ - (٤)», «(٥٥) -»).

## Not a difference, but worth knowing

- **Route wording is not stored.** `matnAr` is one text per hadith. The wording of the matn differs between routes (for example «الأعمال بالنية» vs «إنما الأعمال بالنيات» in the niyyah routes; «بني الإسلام على خمسة» in `muslim-iman-16-n19`). `bukhari-1` matches `matnAr` exactly.
- **Page markers inside the text.** Shamela puts page markers (⦗٤⦘) inside some Bukhari texts; they are not part of our isnad text (removed on purpose).
- **Two chains in one entry.** `bukhari-13-a/b`, `muslim-iman-45-n71-a/b` and the `muslim-muqaddima-n1-*`/`n4-*` routes are split from one printed entry; each route keeps the full printed isnad text.
- **Chain interpretation is not checked here.** This report checks the text. Who each name is (identification) is in `docs/VERIFY-NARRATORS.md`.

## Per-route table (all 37)

| Route | Printed number | Printed place | Text | Link |
| --- | --- | --- | --- | --- |
| `bukhari-1` | ١ | 1/6 | ✅ | ✅ |
| `bukhari-54` | ٥٤ | 1/20 | ✅ | ✅ |
| `bukhari-2529` | ٢٥٢٩ | 3/145–146 | ✅ | ✅ |
| `bukhari-3898` | ٣٨٩٨ | 5/56–57 | ✅ | ✅ |
| `bukhari-5070` | ٥٠٧٠ | 7/3–4 | ✅ | ✅ |
| `bukhari-6689` | ٦٦٨٩ | 8/140 | ✅ | ✅ |
| `bukhari-6953` | ٦٩٥٣ | 9/22–23 | ✅ | ✅ |
| `muslim-imara-1907-n155` | ١٥٥ - (١٩٠٧) | 3/1515–1516 | ✅ | ✅ |
| `bukhari-8` | ٨ | 1/11 | ✅ | ✅ |
| `muslim-iman-16-n19` | ١٩ - (١٦) | 1/45 | ✅ | ✅ |
| `muslim-iman-16-n20` | ٢٠ - (١٦) | 1/45 | ✅ | ✅ |
| `muslim-iman-16-n21` | ٢١ - (١٦) | 1/45 | ✅ | ✅ |
| `muslim-iman-16-n22` | ٢٢ - (١٦) | 1/45 | ✅ | ✅ |
| `bukhari-13-a` / `-b` | ١٣ | 1/12 | ✅ | ✅ |
| `muslim-iman-45-n71-a` / `-b` | ٧١ - (٤٥) | 1/67 | ✅ | ✅ |
| `muslim-iman-45-n72` | ٧٢ - (٤٥) | 1/68 | ✅ | ✅ |
| `bukhari-106` … `bukhari-110` | ١٠٦–١١٠ | 1/33 | ✅ | ✅ |
| `bukhari-1291` | ١٢٩١ | 2/80 | ✅ | ✅ |
| `bukhari-3461` | ٣٤٦١ | 4/170 | ✅ | ✅ |
| `bukhari-6197` | ٦١٩٧ | 8/44 | ✅ | ✅ |
| `muslim-muqaddima-n1-a/b/c` | ١ - (١) | «1/1» (label) | ✅ | ✅ |
| `muslim-muqaddima-n2` | ٢ - (٢) | 1/10 | ✅ | ✅ |
| `muslim-muqaddima-n3` | ٣ - (٣) | 1/10 | ✅ | ✅ |
| `muslim-muqaddima-n4-a/b` | ٤ - (٤) | 1/10 | ✅ | ✅ |
| `muslim-zuhd-3004-n72` | ٧٢ - (٣٠٠٤) | 4/2298–2299 | ✅ | ✅ |
| `muslim-iman-55-n95` | ٩٥ - (٥٥) | 1/74 | ✅ | ✅ |
| `muslim-iman-55-n96` | ٩٦ - (٥٥) | 1/75 | ✅ | ✅ |
| `muslim-iman-55-unnumbered` | (٥٥) - | 1/75 | ✅ | ✅ |

## What needs a human

- Decide D1/D2 (printed form of `number`) and D3 (the page of `muslim-muqaddima-n1-*`, from the printed copy).
- The comparison is by reading, not by byte diff; a second pair of eyes on any route the owner cites is welcome.
