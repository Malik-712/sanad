# RESOLUTIONS — open items of Phase 2, checked against the sources

Date: 5 Oct 2026 (evening). Every item below was checked by reading the cited Shamela page itself. The first draft of this file came from another session; this version replaces it with what was verified. `verification.status` of data stays `unverified` (only the owner changes it).

| # | Item | Result | Kind | Source (printed page) |
| --- | --- | --- | --- | --- |
| 1 | «سفيان» in `muslim-iman-55-n96` | al-Thawri. The chain now uses `sufyan-al-thawri`; the placeholder `sufyan-unidentified` was removed. | «قرينة» (a source names him; the isnad itself does not) | al-Mizzi, *Tuhfat al-Ashraf* 2/116, no. 2053: «م في الإيمان (٢٣: ٤) عن محمد بن حاتم، عن ابن مهديِّ، عن سفيان الثوريِّ» — https://shamela.ws/book/11385/2769 |
| 2 | «محمد بن حاتم» in `muslim-iman-55-n96` | Ibn Maymun (Taqrib 5793). The placeholder was replaced by `muhammad-ibn-hatim-ibn-maymun`. **Needs a specialist**: the sources disagree. | «قرينة» | *Tahdhib al-Kamal* 25/20 (no. 5126, «م د»): Ibn Mahdi is among his teachers «(م د)» — https://shamela.ws/book/3722/13114 ; Ibn Bazi' 25/16 (no. 5124, «خ د») has no Ibn Mahdi among teachers — https://shamela.ws/book/3722/13110 ; but Taqrib marks Ibn Bazi' «خ م د س» (no. 5791) |
| 3 | «يحيى بن زكريا» in `muslim-iman-16-n20` | Ibn Abi Zaida (Taqrib 7548) | «قرينة» | *Tahdhib al-Kamal* 12/198 (entry of Sahl ibn Uthman al-Askari): among his teachers «يحيى بن زكريا بن أبي زائدة (م)» — https://shamela.ws/book/3722/5972 |
| 4 | «محمد بن عباد المكي» in `muslim-iman-55-n95` | Ibn al-Zibriqan | «قرينة» | *Tahdhib al-Kamal* 25/435–436, no. 5321 (خ م ت س ق): teacher Sufyan ibn Uyayna «(خ م س)», students Bukhari and Muslim — https://shamela.ws/book/3722/13530 ; *Tuhfat al-Ashraf* 2/116 (٢٣: ٣) |
| 5 | «همام» in `muslim-zuhd-3004-n72` | Hammam ibn Yahya | «قرينة» | *Tahdhib al-Kamal* 30/303–304: teacher «زيد بن أسلم (م س)», student «هدبة بن خالد (خ م د)» — https://shamela.ws/book/3722/16370 , https://shamela.ws/book/3722/16371 |

## Rulings for the routes with no `grade`

- **`muslim-muqaddima-n1-a/b/c`** — a ruling exists for the hadith: al-Albani, *Sahih al-Jami' al-Saghir wa Ziyadatuh* 2/1240, no. 7437: «لا تكذبوا علي فإنه من يكذب علي فليلج النار» — «(صحيح)» [حم ق ت] عن علي — https://shamela.ws/book/10757/1174 . **Not applied.** His wording is «فليلج» and Muslim's is «يلج»; it is a ruling on the hadith, not on this isnad. Owner decision: leave `grade: null` (current) or quote it with its author and the wording difference.
- **`muslim-iman-16-n20`** — no ruling found for this wording. `grade` stays `null`.
- **The other 6 Muqaddima routes** — nothing found; `grade` stays `null`.

## Companion honorifics (`honorificAr`)

Owner decision (5 Oct 2026): every companion record carries the honorific shown after the name in the UI. «رضي الله عنهما» for a companion whose father was also a companion; «رضي الله عنه» otherwise; «رضي الله عنها» for women (none in the data yet). `validate:data` requires the field on every companion.

| Record | Value | Basis |
| --- | --- | --- |
| `abdullah-ibn-umar`, `abdullah-ibn-amr-ibn-al-as`, `abdullah-ibn-al-zubayr` | «رضي الله عنهما» | Owner decision. |
| `abu-said-al-khudri` | «رضي الله عنهما» | Owner decision, on Taqrib no. 2253: «له ولأبيه صحبة» — https://shamela.ws/book/8609/158 |
| the other 8 companions | «رضي الله عنه» | Owner decision after the checks below. |

Checks made for the other companions' fathers (Taqrib, and Ibn Hajar's *al-Isaba*, local Shamela copy, book 9767). «Not found» means no evidence found by exact-phrase search, not proof:

- `anas-ibn-malik`: *al-Isaba* 8/409 (entry of Umm Sulaym): «فغضب مالك وخرج إلى الشّام فمات بها» — https://shamela.ws/book/9767/4322
- `ali-ibn-abi-talib`: *al-Isaba* 7/196, Abu Talib (no. 10175) is listed under «القسم الرابع» — https://shamela.ws/book/9767/3728
- `umar-ibn-al-khattab`, `al-zubayr-ibn-al-awwam`: no entry found for the father in *al-Isaba* (named only in the lineage of others).
- `al-mughira-ibn-shuba`, `tamim-al-dari`, `salama-ibn-al-akwa`: the father's name was not found as an entry in *al-Isaba*.
- `abu-hurayra`: the father's name itself is disputed (Taqrib no. 8426).

## Still open

- `muslim-zuhd-3004-n72`: whether the hadith is marfu' or mawquf to Abu Said — «لم أجد».
- Muhammad ibn Hatim (item 2): a specialist should compare *Tahdhib al-Kamal* and Taqrib.
- The page of `muslim-muqaddima-n1-*` (Shamela label «1/ 1»).
- The Taqrib edition (publisher, editor, year).
- A specialist's review of one full hadith.
