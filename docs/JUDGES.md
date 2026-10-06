# For the judges — دليل المحكِّمين

Live site · الموقع: **https://sanad-pi-five.vercel.app** (works on a phone and a desktop · يعمل على الجوال والحاسوب)

## Five things to try (about 5 minutes) · خمس تجارب

| # | Try this | What you should see |
| --- | --- | --- |
| 1 | **Search and tree.** On Home, type «بالنيات» and open «إنما الأعمال بالنيات». | One tree with all 8 isnads: the Prophet ﷺ at the top, the compilers at the bottom. The meeting point has a gold diamond ring. |
| 2 | **Check a source.** Choose any isnad in the list, then press «افتح الموضع في المصدر». | The Shamela page the isnad was copied from opens. The panel gives book, edition, number, volume and page. A ruling, if shown, is a quote with who said it. |
| 3 | **A narrator.** Tap a narrator in the tree, then «الترجمة كاملة». | His entry quoted from *Taqrib al-Tahdhib* with entry number and page, and his status. Records not yet checked by the owner say «يحتاج تحققًا». |
| 4 | **Paste an isnad.** Open «الصق إسنادًا» and press «جرّب مثالًا». Then choose «سفيان الثوري» in the box «من «سفيان» هنا؟». | Seven names with match tags; «سفيان» needs checking, with Ibn ʿUyayna pre-selected and the reason; the chain; the green card «وجدناه في شجرة…». Choosing al-Thawri changes the chain, and the card says it was not found. |
| 5 | **Uncertainty and privacy.** On «الصق إسنادًا», paste a made-up isnad, e.g. «حدثنا قزمان بن طرخان، عن يحيى بن سعيد الأنصاري، عن محمد بن إبراهيم التيمي», and analyse. Keep the browser's Network tab open. | The unknown name is marked «لا مصدر بعد» (grey, not red); the known ones are linked; no match card. No network request carries the pasted text. |

| # | جرِّب | ما الذي ستراه |
| --- | --- | --- |
| ١ | **البحث والشجرة:** اكتب «بالنيات» في الرئيسية وافتح «إنما الأعمال بالنيات». | شجرة واحدة تجمع الأسانيد الثمانية، النبي ﷺ في الأعلى والمصنِّفون في الأسفل، ونقطة الالتقاء بإطار ذهبي. |
| ٢ | **تحقّق من مصدر:** اختر إسنادًا ثم «افتح الموضع في المصدر». | تُفتح صفحة الشاملة التي نُقل منها الإسناد بنصّه، مع الكتاب والطبعة والرقم والجزء والصفحة. والحكم إن وُجد منقول منسوب إلى قائله. |
| ٣ | **راوٍ:** اضغط راويًا في الشجرة ثم «الترجمة كاملة». | ترجمته من «تقريب التهذيب» برقمها وصفحتها، وحالتها؛ وما لم يراجعه صاحب المشروع بعدُ عليه «يحتاج تحققًا». |
| ٤ | **الصق إسنادًا:** افتح «الصق إسنادًا» واضغط «جرّب مثالًا»، ثم اختر «سفيان الثوري». | سبعة أسماء بنسب التطابق، و«سفيان» يحتاج تحققًا مع ترجيح ابن عيينة وسببه، والسلسلة، وبطاقة «وجدناه في شجرة…». واختيار الثوري يغيّر السلسلة فلا يُوجد الإسناد. |
| ٥ | **التوقّف والخصوصية:** الصق إسنادًا فيه اسم مختلَق، مثل «حدثنا قزمان بن طرخان، عن يحيى بن سعيد الأنصاري، عن محمد بن إبراهيم التيمي». | الاسم المجهول «لا مصدر بعد» (رمادي لا أحمر)، والمعروف مربوط، ولا بطاقة مطابقة، ولا يخرج النص من المتصفح. |

## One command for the numbers · أمر واحد للأرقام

Needs Node 20.9+ and pnpm. No internet access, keys or GPU are needed after `pnpm install`.

```bash
git clone https://github.com/Malik-712/sanad.git && cd sanad
pnpm install
pnpm eval:all
```

`pnpm eval:all` runs, in order:

| Step | What it checks | Result on 6 Oct 2026 |
| --- | --- | --- |
| `pnpm test` | 135 unit tests: isnad engine, parser, linker, search, Arabic normaliser, data rules | 135 / 135 pass |
| `pnpm hardcases --runs 3` | 15 hard cases, run three times; SHA-256 of each run's output | 15 / 15 pass; 3 identical hashes (`docs/HARD_CASES.md`) |
| `pnpm eval:e2e` | All 37 isnads in `data/` pasted into the `/parse` pipeline | right tree found with no help for 27 of 37; 28 after choosing (`docs/EVALUATION.md` b) |

More checks:

```bash
pnpm build && pnpm test:e2e                               # 43 browser tests at 390 and 1440 px, incl. axe and the privacy test
BASE_URL=https://sanad-pi-five.vercel.app pnpm test:e2e   # the same on the live site
```

The machine-learning comparison (model F1 0.916 vs rules 0.757 on 300 isnads from 9 held-out books) needs the Sanadset download and Python; the steps are in `ml/README.md`, the results in `docs/EVALUATION.md`. **The model is trained and measured, not published**: the site runs the rule parser.

## Where to read more

`docs/REQUIREMENTS.md` (each requirement → evidence) · `docs/SOURCES.md` (sources and how to verify) · `docs/EVALUATION.md` · `docs/HARD_CASES.md` · `docs/COST.md` · `docs/BASELINE.md` (the earlier project, disclosed)
