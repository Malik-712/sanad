# Narrator verification report — `data/narrators.json` against Taqrib al-Tahdhib

Date: 5 Oct 2026. Branch: `phase2-verification`. Source: Ibn Hajar, *Taqrib al-Tahdhib* (Shamela book 8609). Entry numbers and printed pages are the ones Shamela shows. Shamela gives no publisher or edition, so the `edition` field is unchanged (the owner adds it from the printed copy).

> **Update 5 Oct (evening):** the rows for sufyan-unidentified, muhammad-ibn-hatim-unidentified and yahya-ibn-zakariyya-ibn-abi-zaida below were resolved against *Tuhfat al-Ashraf* and *Tahdhib al-Kamal* (see [RESOLUTIONS.md](RESOLUTIONS.md)). There are now 92 records (the sufyan-unidentified placeholder was removed, the Hatim placeholder became muhammad-ibn-hatim-ibn-maymun, Taqrib 5793, text checked on the printed page 472). identification is now 19 «نص», 29 «قرينة», 44 empty (8 of them flagged same-name records, 36 with no deciding source). The counts in the tables below are the state before this update.

## Counts

| Group | Records | Result |
| --- | --- | --- |
| Checked in this pass against the Taqrib page | 73 | 73 match (0 mismatches) |
| Checked earlier by the external report (17 narrators) | 17 | entry number and printed page cross-checked against our file: 17 / 17 match |
| Prophet ﷺ (no Taqrib entry by design) | 1 | — |
| Placeholders with no Taqrib entry by design (`sufyan-unidentified`, `muhammad-ibn-hatim-unidentified`) | 2 | — |
| **Total in the file** | **93** | |

Now 92 after ef94a14 (see REVIEW.md)

## What was compared (73 records)

For each record the Taqrib page was read and the entry copied word for word into a script that compared it with our record:

- `taqrib.entryNo` and `taqrib.page` (printed page): 73 / 73 match.
- `taqrib.quoteAr` (the quoted entry, spacing ignored): 73 / 73 identical, including the bracketed additions of the printed text («[ومائتين]», «[لقبه ذو الأذنين]»).
- `tabaqa` (generation as printed) and `deathAr` (death as printed): each appears inside the Taqrib entry; 73 / 73. Records with no `tabaqa` have none in the printed entry (Companions, the compilers' entries).
- Verdict wording (e.g. «ثقة ثبت», «صدوق يخطىء», «مقبول»): part of the quoted entry, so identical.

Fixes applied to the data for transcription errors: **none** (nothing was wrong).

A first automatic check flagged 5 records (`abdullah-ibn-al-zubayr`, `abdullah-ibn-amr-ibn-al-as`, `abdullah-ibn-umar`, `ali-ibn-abi-talib`, `abu-hurayra`) for "tabaqa present in source but empty in ours". These are false alarms: the phrase matched was «من المهاجرين» / «من السابقين الأولين» / «من المكثرين», which are not generations. Taqrib gives no generation for Companions.

## Same-name entries (ambiguity)

Taqrib is alphabetical, so same-name entries sit next to ours on the same page. Where an isnad names the narrator only by a shared name and no text in our data settles which entry is meant, `identification` is left empty (null) and the candidates are listed in the record's `verification.note`. The record itself was not replaced and keeps its Taqrib quote, so the owner or a specialist can decide.

| Narrator record | Name in the isnads | Candidate entries (Taqrib) | Status |
| --- | --- | --- | --- |
| `anas-ibn-malik` | أنس | 565 (الأنصاري الخزرجي، خادم رسول الله ﷺ — ours), 566 (القشيري الكعبي) | ambiguous by name |
| `ghundar-muhammad-ibn-jafar` | محمد بن جعفر | 5785, 5786, 5787 (الهذلي، المعروف بغندر — ours), 5788, 5789 | Nawawi (1/65) names Ghundar in the Muqaddima isnad; `muslim-iman-45-n71-a/b` has the bare name |
| `muhammad-ibn-kathir-al-abdi` | محمد بن كثير | 6251, 6252 (العبدي — ours), 6253, 6254, 6255 | ambiguous; no text settles it |
| `yahya-ibn-said-al-ansari` | يحيى بن سعيد / يحيى | 7554–7559 (7559 الأنصاري — ours; 7557 القطان) | named «الأنصاري» in `bukhari-1` only |
| `yahya-ibn-said-al-qattan` | يحيى بن سعيد / يحيى | 7554–7559 (7557 — ours) | identified by Ibn Hajar, *Fath al-Bari* 1/57, not by the isnad |
| `ali-ibn-rabia` | علي بن ربيعة | 4733 (الوالبي — ours); the entry itself says he may be the one called «البجلي» | no text decides |
| `abdullah-ibn-umar` | ابن عمر / عبد الله | 3490 (ours) … 3495 | bare name |
| `abu-al-numan-arim` | أبو النعمان | 6226 (ours) | kunya only; the evidence is from another hadith |
| `yahya-ibn-zakariyya-ibn-abi-zaida` | يحيى بن زكريا | 7548 (ابن أبي زائدة — ours), 7549 (النيسابوري) | left open by the owner; Nawawi 1/177–178 does not name him |
| `muhammad-ibn-hatim-unidentified` | محمد بن حاتم | 5791–5795; marked «م»: 5791 (ابن بزيع), 5793 (ابن ميمون) | left open by the owner (placeholder) |
| `sufyan-unidentified` | سفيان | — | left open by the owner (placeholder) |

Homonym pairs that a source resolves (kept, with the evidence in the route note): `ikrima-ibn-khalid` (4668 vs 4669, *Fath al-Bari* 1/49), `abdullah-ibn-amr-ibn-al-as` (3496–3501, *Fath al-Bari* 1/203), `said-ibn-ubayd-al-tai` (2359–2363, *Fath al-Bari* 3/162), `muhammad-ibn-abbad-al-makki` (5992 vs 5993, al-Sam'ani, *al-Ansab* 12/417: «قرينة لا نصّ»).

Limit of this check: same-name entries were looked for on the Taqrib page of each narrator. A same-name entry on another page (for example after a page break) would not show up.

## New field `identification` (task 4)

`identification: { kind, note } | null`.

- **«نص»** — the isnad names him fully: four or more name tokens, or three with a nisba, or an apposition inside the isnad («يعني ابن علية», «هو ابن زيد»). Also the Prophet ﷺ and the two compilers (the isnad's own source).
- **«قرينة»** — the isnad gives a short form and the identity comes from evidence quoted in the route note (sharh, Taqrib, or al-Ansab), or from the nasab inside the same isnad (e.g. «أبيه»). The note says which.
- **null** — not certain. Never guessed. This includes the 9 flagged records above and the 2 placeholders.

| Value | Records |
| --- | --- |
| «نص» | 19 (the Prophet ﷺ, Bukhari, Muslim, al-Humaydi, al-Qa'nabi, Abu Said al-Khudri, Amir ibn Abdullah ibn al-Zubayr, Yazid ibn Abi Ubayd, Abu Asim, Abu Bakr ibn Abi Shayba, Muhammad ibn al-Muthanna, Ismail ibn Ulayya, al-Ghubari, Ali ibn Hujr, Muhammad ibn Qays al-Asadi, Hudba, Ubaydullah ibn Musa, Sahl al-Askari, Ubaydullah ibn Muadh) |
| «قرينة» | 27 |
| empty | 47 (9 records flagged in the table above with identification: null and candidates in their note; 2 placeholders; 36 records where no source in our data settles the identity, mostly bare names such as «مالك», «شعبة», «قتادة») |

The rule is deliberately strict. A bare name that is probably unique (for example «عمر بن الخطاب») stays empty until someone confirms it is the only entry with that name; this is not a claim that the identification is wrong.

## What needs a human

- Decide the homonym table above (especially Anas, Ghundar in `muslim-iman-45-n71`, Yahya ibn Said, Ali ibn Rabia, Ibn Umar).
- Muhammad ibn Hatim (Ibn Maymun or Ibn Bazi') in *Tahdhib al-Kamal* or *Tuhfat al-Ashraf*.
- «يحيى بن زكريا» in `muslim-iman-16-n20` (Ibn Abi Zaida or al-Naysaburi).
- The two identifications the external report made itself (`muhammad-ibn-abbad-al-makki`, `hammam-ibn-yahya`): confirm in *Tahdhib al-Kamal*.
- The Taqrib edition (publisher, editor, year) from the printed copy.
