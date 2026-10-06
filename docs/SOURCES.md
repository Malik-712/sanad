# Source documentation

Which scholarly sources Sanad uses, how the text is taken from them, and how it is checked. Every value shown in the app comes from `data/`, and every fact in `data/` carries the URL of the page it was copied from (CLAUDE.md, scholarly rules 1–2).

> أداة مساعدة بالذكاء الاصطناعي، لا تحكم على الأحاديث ولا تُفتي.
> ذِكرُ الحديث في كتابٍ ليس حكمًا عليه. الأحكام تُنقل منسوبةً إلى قائليها.

## 1. Sources

Book details are as recorded in al-Maktaba al-Shamila's own catalogue. Where Shamela does not record an editor or publisher, it is left as «غير مذكور» — nothing is filled in from memory.

### Texts shown in the app

| Source | Author | Edition (as named in Shamela) | Shamela book | Used for |
| --- | --- | --- | --- | --- |
| صحيح البخاري | البخاري (ت ٢٥٦) | ط السلطانية (publisher: السلطانية; editor غير مذكور) | [1681](https://shamela.ws/book/1681) | Isnad text, number, volume and page of the Bukhari isnads; matn of the Bukhari hadiths |
| صحيح مسلم | مسلم (ت ٢٦١) | ت عبد الباقي (publisher غير مذكور) | [1727](https://shamela.ws/book/1727) | Isnad text, number, volume and page of the Muslim isnads (and his Muqaddima); matn and its other reading |
| تقريب التهذيب | ابن حجر العسقلاني (ت ٨٥٢) | غير مذكور (editor and publisher not recorded by Shamela) | [8609](https://shamela.ws/book/8609) | The quoted narrator entry (`taqrib.quoteAr`), entry number and page; tabaqa and death as written there |
| مقدمة ابن الصلاح = معرفة أنواع علوم الحديث | ابن الصلاح (ت ٦٤٣) | ت عتر (publisher غير مذكور) | [22870](https://shamela.ws/book/22870) | The quote behind «أخرجه مسلم في صحيحه» on isnads inside Muslim's Sahih (`inclusion`) |
| الدرر السنية — الموسوعة الحديثية | — | — | [dorar.net](https://dorar.net) | The short grade quoted on 29 isnads, with who said it and a link (`grade`); licence **unclear** (§4) |

### Sources cited as evidence in notes (not shown as text)

Used in route and narrator notes, `docs/RESOLUTIONS.md` and `docs/REVIEW.md` to identify narrators or settle readings. Cited by page link.

| Source | Author | Edition (as named in Shamela) | Shamela book |
| --- | --- | --- | --- |
| فتح الباري بشرح البخاري | ابن حجر العسقلاني | ط السلفية | [1673](https://shamela.ws/book/1673) |
| شرح النووي على مسلم | النووي | غير مذكور | [1711](https://shamela.ws/book/1711) |
| تهذيب الكمال في أسماء الرجال | المزي | publisher: مؤسسة الرسالة - بيروت (editor غير مذكور) | [3722](https://shamela.ws/book/3722) |
| تحفة الأشراف بمعرفة الأطراف | المزي | editor: عبد الصمد شرف الدين | [11385](https://shamela.ws/book/11385) |
| الأنساب | السمعاني | ط الهندية | [12317](https://shamela.ws/book/12317) |
| صحيح الجامع الصغير وزيادته | الألباني | غير مذكور | [10757](https://shamela.ws/book/10757) |
| مستخرج أبي نعيم (as the notes cite it: «١/ ١٤٢ ح ١٩٣») | أبو نعيم | not recorded | no link stored in the data — cited in two notes as supporting evidence only |
| الإصابة في تمييز الصحابة | ابن حجر العسقلاني | — | [9767](https://shamela.ws/book/9767) — cited by name and link only; licence **unclear** (owner decision, 6 Oct) |

## 2. How text is taken

- **Word for word.** Hadith text, isnads, narrator entries and grades are copied exactly from the source page. The URL is stored next to the fact (`url`, `sourceUrl`, `taqrib.url`), with the date (`retrieved`) and the method (`method`). All 37 isnads today: `method: "manual-checked"`, retrieved 2026-10-05.
- **No editors' notes.** Footnotes and tahqiq notes of printed editions are not copied (CLAUDE.md rule 7). The classical text is used, the edition is named, and the page is linked.
- **Grades are quoted, never computed.** A grade appears only as quoted text with who said it and a link (`grade`). For isnads inside Muslim's Sahih, `inclusion` quotes Ibn al-Salah. Where no ruling was found, the app says «لم ننقل نصّ الحكم بعد، ولن نعرض حكمًا بلا مصدر.» Sanad never calls a hadith or narrator «صحيح» or «ضعيف» in its own voice.
- **Narrator identification.** A name in an isnad is linked to a narrator record only with written evidence: «نص» when the isnad names him fully, «قرينة» when a quoted source settles it. Shared names are not resolved by choice; the candidates are listed for the owner.
- **Other readings** of a matn are kept in `matnVariants` with their source, out of the main text.
- **Honorifics** after companions' names come from the data field `honorificAr`, decided by the owner (`docs/RESOLUTIONS.md`).

## 3. How it is checked

- **Owner review.** New data starts as `unverified`. Only the owner sets `verified`, after checking it, and logs it in `docs/REVIEW.md`. Today: all 37 isnads verified by the owner (5 Oct 2026); all 92 narrator records unverified. The app shows «مصدر موثق» only for verified records with a source URL.
- **Specialist review.** `docs/REVIEW.md` records the owner's statement that a hadith specialist reviewed all 5 hadiths on 5 Oct 2026.
- **Checks against the sources.** `docs/VERIFY-ISNADS.md`, `docs/VERIFY-NARRATORS.md` and `docs/RESOLUTIONS.md` record each check with the page read.
- **Automatic checks.** `pnpm validate:data` runs before every build: valid JSON, unique ids, every isnad has a source URL, number and book, every narrator in a chain exists, every companion has its honorific.

## 3b. How to verify any fact yourself

Every fact on the site can be checked against its source in under a minute:

1. **An isnad.** On a hadith page, choose the isnad. The source panel shows the book, the edition, the number, the volume and page, and the button «افتح الموضع في المصدر». It opens the Shamela page the text was copied from. Compare the isnad text in the panel with the page, word for word.
2. **A grade.** Under «الحكم» the panel quotes the ruling with who said it, and links to where it was read. If no ruling was copied, the panel says so instead of showing one.
3. **A narrator.** Click a narrator in the tree, or open his page. The Taqrib entry is quoted with its entry number and page, with a link. Status «يحتاج تحققًا» means the owner has not checked that record yet.
4. **The whole data set.** Every value lives in `data/` with its URL next to it. `pnpm validate:data` fails the build if an isnad has no source, number or book. Section 6 below lists all 37 isnads with their source pages.

## 3c. What is not a source

- **`/parse` (paste an isnad).** The names it finds are an automatic reading of the user's own text by the rule parser (`lib/parser/`). They are shown as «استخراج آلي», linked to our narrator records with a confidence state, and never added to `data/`. Nothing pasted leaves the browser.
- **Sanadset 650K** (Mendeley Data) was used only to train and measure a narrator tagger offline (`ml/`, `docs/EVALUATION.md`). No text from it is shown in the app, and the trained model is not published (licence unclear).
- **Sample values in the design files** (`design/`) are not data and were never copied into `data/` (CLAUDE.md rule 9).

## 4. Licences of the sources

| Source | Status |
| --- | --- |
| Classical books (Bukhari, Muslim, Taqrib, Ibn al-Salah and the books in §1) | Texts written centuries ago; no editorial apparatus is copied; the edition is named. |
| shamela.ws (where the text was read) | **unclear** — no terms or licence page found on the site (checked 6 Oct 2026). |
| dorar.net (grade quotes) | **unclear** — its FAQ (dorar.net/feedback, read 28 Sep 2026) says the encyclopedia is for searching on the site and is not to be copied. Sanad stores only the short grade, its author and a link. Owner decision pending. |
| Shamela connector (local tool for the checks) | **unclear** — not used by the public site. |

The full log of tools, packages, fonts and services with their licences is in `docs/SOURCES_LOG.md`.

## 5. Open items

- Edition details not recorded by Shamela (editors, publishers, years) — to be supplied by the owner if wanted.
- The licences marked **unclear** above.
- From `docs/RESOLUTIONS.md`: marfu' or mawquf of `muslim-zuhd-3004-n72`; the identity of «محمد بن حاتم» (specialist); the printed page of `muslim-muqaddima-n1-*`.

## 6. Index of the 37 isnads

Generated once from `data/hadiths/*.json` (6 Oct 2026). If the data changes, regenerate it.

| Hadith | Isnad id | Book | Number | Place | Source page | Grade quoted (by) |
| --- | --- | --- | --- | --- | --- | --- |
| niyyah | `bukhari-1` | صحيح البخاري | 1 | ط السلطانية, vol. 1, p. 6 | https://shamela.ws/book/1681/10 | [صحيح] (البخاري, dorar.net) |
| niyyah | `bukhari-54` | صحيح البخاري | 54 | ط السلطانية, vol. 1, p. 20 | https://shamela.ws/book/1681/104 | [صحيح] (البخاري, dorar.net) |
| niyyah | `bukhari-2529` | صحيح البخاري | 2529 | ط السلطانية, vol. 3, p. 145-146 | https://shamela.ws/book/1681/4021 | [صحيح] (البخاري, dorar.net) |
| niyyah | `bukhari-3898` | صحيح البخاري | 3898 | ط السلطانية, vol. 5, p. 56-57 | https://shamela.ws/book/1681/5892 | [صحيح] (البخاري, dorar.net) |
| niyyah | `bukhari-5070` | صحيح البخاري | 5070 | ط السلطانية, vol. 7, p. 3-4 | https://shamela.ws/book/1681/7555 | [صحيح] (البخاري, dorar.net) |
| niyyah | `bukhari-6689` | صحيح البخاري | 6689 | ط السلطانية, vol. 8, p. 140 | https://shamela.ws/book/1681/9984 | [صحيح] (البخاري, dorar.net) |
| niyyah | `bukhari-6953` | صحيح البخاري | 6953 | ط السلطانية, vol. 9, p. 22-23 | https://shamela.ws/book/1681/10382 | [صحيح] (البخاري, dorar.net) |
| niyyah | `muslim-imara-1907-n155` | صحيح مسلم | ١٥٥ - (١٩٠٧) | ت عبد الباقي, vol. 3, p. 1515-1516 | https://shamela.ws/book/1727/4862 | [صحيح] (مسلم, dorar.net); Ibn al-Salah inclusion |
| man-kadhaba | `bukhari-106` | صحيح البخاري | 106 | ط السلطانية, vol. 1, p. 33 | https://shamela.ws/book/1681/196 | [صحيح] (البخاري, dorar.net) |
| man-kadhaba | `bukhari-107` | صحيح البخاري | 107 | ط السلطانية, vol. 1, p. 33 | https://shamela.ws/book/1681/197 | [صحيح] (البخاري, dorar.net) |
| man-kadhaba | `bukhari-108` | صحيح البخاري | 108 | ط السلطانية, vol. 1, p. 33 | https://shamela.ws/book/1681/198 | [صحيح] (البخاري, dorar.net) |
| man-kadhaba | `bukhari-109` | صحيح البخاري | 109 | ط السلطانية, vol. 1, p. 33 | https://shamela.ws/book/1681/199 | [صحيح] (البخاري, dorar.net) |
| man-kadhaba | `bukhari-110` | صحيح البخاري | 110 | ط السلطانية, vol. 1, p. 33 | https://shamela.ws/book/1681/200 | [صحيح] (البخاري, dorar.net) |
| man-kadhaba | `bukhari-1291` | صحيح البخاري | 1291 | ط السلطانية, vol. 2, p. 80 | https://shamela.ws/book/1681/2079 | [صحيح] (البخاري, dorar.net) |
| man-kadhaba | `bukhari-3461` | صحيح البخاري | 3461 | ط السلطانية, vol. 4, p. 170 | https://shamela.ws/book/1681/5357 | [صحيح] (البخاري, dorar.net) |
| man-kadhaba | `bukhari-6197` | صحيح البخاري | 6197 | ط السلطانية, vol. 8, p. 44 | https://shamela.ws/book/1681/9272 | [صحيح] (البخاري, dorar.net) |
| man-kadhaba | `muslim-muqaddima-n1-a` | صحيح مسلم | ١ - (١) | ت عبد الباقي, vol. 1 | https://shamela.ws/book/1727/11 | none («لم ننقل نصّ الحكم بعد») |
| man-kadhaba | `muslim-muqaddima-n1-b` | صحيح مسلم | ١ - (١) | ت عبد الباقي, vol. 1 | https://shamela.ws/book/1727/11 | none («لم ننقل نصّ الحكم بعد») |
| man-kadhaba | `muslim-muqaddima-n1-c` | صحيح مسلم | ١ - (١) | ت عبد الباقي, vol. 1 | https://shamela.ws/book/1727/11 | none («لم ننقل نصّ الحكم بعد») |
| man-kadhaba | `muslim-muqaddima-n2` | صحيح مسلم | ٢ - (٢) | ت عبد الباقي, vol. 1, p. 10 | https://shamela.ws/book/1727/12 | none («لم ننقل نصّ الحكم بعد») |
| man-kadhaba | `muslim-muqaddima-n3` | صحيح مسلم | ٣ - (٣) | ت عبد الباقي, vol. 1, p. 10 | https://shamela.ws/book/1727/13 | none («لم ننقل نصّ الحكم بعد») |
| man-kadhaba | `muslim-muqaddima-n4-a` | صحيح مسلم | ٤ - (٤) | ت عبد الباقي, vol. 1, p. 10 | https://shamela.ws/book/1727/14 | none («لم ننقل نصّ الحكم بعد») |
| man-kadhaba | `muslim-muqaddima-n4-b` | صحيح مسلم | ٤ - (٤) | ت عبد الباقي, vol. 1, p. 10 | https://shamela.ws/book/1727/14 | none («لم ننقل نصّ الحكم بعد») |
| man-kadhaba | `muslim-zuhd-3004-n72` | صحيح مسلم | ٧٢ - (٣٠٠٤) | ت عبد الباقي, vol. 4, p. 2298-2299 | https://shamela.ws/book/1727/7442 | [صحيح] (مسلم, dorar.net) |
| al-din-al-nasiha | `muslim-iman-55-n95` | صحيح مسلم | ٩٥ - (٥٥) | ت عبد الباقي, vol. 1, p. 74 | https://shamela.ws/book/1727/160 | [صحيح] (مسلم, dorar.net); Ibn al-Salah inclusion |
| al-din-al-nasiha | `muslim-iman-55-n96` | صحيح مسلم | ٩٦ - (٥٥) | ت عبد الباقي, vol. 1, p. 75 | https://shamela.ws/book/1727/161 | [صحيح] (مسلم, dorar.net); Ibn al-Salah inclusion |
| al-din-al-nasiha | `muslim-iman-55-unnumbered` | صحيح مسلم | (٥٥) - | ت عبد الباقي, vol. 1, p. 75 | https://shamela.ws/book/1727/162 | [صحيح] (مسلم, dorar.net); Ibn al-Salah inclusion |
| la-yuminu | `bukhari-13-a` | صحيح البخاري | 13 | ط السلطانية, vol. 1, p. 12 | https://shamela.ws/book/1681/29 | [صحيح] (البخاري, dorar.net) |
| la-yuminu | `bukhari-13-b` | صحيح البخاري | 13 | ط السلطانية, vol. 1, p. 12 | https://shamela.ws/book/1681/29 | [صحيح] (البخاري, dorar.net) |
| la-yuminu | `muslim-iman-45-n71-a` | صحيح مسلم | ٧١ - (٤٥) | ت عبد الباقي, vol. 1, p. 67 | https://shamela.ws/book/1727/134 | [صحيح] (مسلم, dorar.net); Ibn al-Salah inclusion |
| la-yuminu | `muslim-iman-45-n71-b` | صحيح مسلم | ٧١ - (٤٥) | ت عبد الباقي, vol. 1, p. 67 | https://shamela.ws/book/1727/134 | [صحيح] (مسلم, dorar.net); Ibn al-Salah inclusion |
| la-yuminu | `muslim-iman-45-n72` | صحيح مسلم | ٧٢ - (٤٥) | ت عبد الباقي, vol. 1, p. 68 | https://shamela.ws/book/1727/135 | [صحيح] (مسلم, dorar.net); Ibn al-Salah inclusion |
| buniya-al-islam | `bukhari-8` | صحيح البخاري | 8 | ط السلطانية, vol. 1, p. 11 | https://shamela.ws/book/1681/19 | [صحيح] (البخاري, dorar.net) |
| buniya-al-islam | `muslim-iman-16-n19` | صحيح مسلم | ١٩ - (١٦) | ت عبد الباقي, vol. 1, p. 45 | https://shamela.ws/book/1727/79 | [صحيح] (مسلم, dorar.net); Ibn al-Salah inclusion |
| buniya-al-islam | `muslim-iman-16-n20` | صحيح مسلم | ٢٠ - (١٦) | ت عبد الباقي, vol. 1, p. 45 | https://shamela.ws/book/1727/80 | none («لم ننقل نصّ الحكم بعد») |
| buniya-al-islam | `muslim-iman-16-n21` | صحيح مسلم | ٢١ - (١٦) | ت عبد الباقي, vol. 1, p. 45 | https://shamela.ws/book/1727/81 | [صحيح] (مسلم, dorar.net); Ibn al-Salah inclusion |
| buniya-al-islam | `muslim-iman-16-n22` | صحيح مسلم | ٢٢ - (١٦) | ت عبد الباقي, vol. 1, p. 45 | https://shamela.ws/book/1727/82 | [صحيح] (مسلم, dorar.net); Ibn al-Salah inclusion |
