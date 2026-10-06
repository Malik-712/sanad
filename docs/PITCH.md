# Pitch — 5 minutes

Spoken in Arabic (the lines to say are in Arabic), with the live site or the slides of `docs/DECK.md` on screen. Timings add up to 5:00. Every number is measured; nothing in «What's next» may be presented as done.

## 0:00–0:30 · The problem · المشكلة

> «للحديث الواحد أسانيد كثيرة، متفرقة في كتب السنة. ولكي يعرف الطالب أين تلتقي هذه الأسانيد وأين تفترق، يرسمها بيده من نصوصها، إسنادًا إسنادًا. وأدوات البحث تعرض إسنادًا واحدًا في كل مرة، ولا تجمعها في صورة واحدة. وإذا وجد إسنادًا في كتاب أو منشور، لا يعرف بسهولة: هل هو من الأسانيد المعروفة؟ ومن هذا «سفيان» فيه؟»

## 0:30–1:00 · The solution · الحل

> «سَنَد يجمع كل أسانيد الحديث الواحد في شجرة واحدة تفاعلية: النبي ﷺ في الأعلى والمصنِّفون في الأسفل، وتظهر نقطة الالتقاء ونقاط الافتراق. وكل إسناد مربوط بكتابه وطبعته ورقمه وصفحته. شعارنا: لكلِّ حديثٍ إسناد، فلا نعرض حديثًا بلا إسناده، ولا إسنادًا بلا مصدره.»

## 1:00–3:00 · What's been built · ما أُنجز (live demo)

Demo on the live site, in this order (each step is in `docs/JUDGES.md`):

1. **Search → tree** (30 s). «بالنيات» → the tree of «إنما الأعمال بالنيات»: 8 isnads, the meeting point in gold.
2. **Source panel** (30 s). Choose an isnad → the text as in the book, edition, number, volume, page → «افتح الموضع في المصدر» opens the Shamela page. Rulings only quoted, with who said them.
3. **Narrator** (15 s). Tap a narrator → his Taqrib entry with page; «يحتاج تحققًا» where the owner has not checked the record yet.
4. **Paste an isnad** (45 s). «جرّب مثالًا» → names with match tags, the «سفيان» box with Ibn ʿUyayna suggested and the reason, the chain with its transmission words, the card «وجدناه في شجرة…». Choose al-Thawri → not found. The text never leaves the browser.

Say while showing:

> «البيانات: خمسة أحاديث، وسبعة وثلاثون إسنادًا من البخاري ومسلم، منقولة بنصّها من الشاملة مع روابط صفحاتها، وراجعها صاحب المشروع كلها، واثنان وتسعون راويًا من تقريب التهذيب.»

## 3:00–3:45 · AI and numbers · الذكاء الاصطناعي والأرقام

> «درّبنا نموذج تعلّم آلي صغيرًا (BERT-mini العربي) على ستة وتسعين ألفًا وتسعمئة وستة وعشرين إسنادًا من مجموعة Sanadset ليستخرج أسماء الرواة، وقسناه على ثلاثمئة إسناد من تسعة كتب لم يرها في التدريب: F1 ‏٠٫٩١٦، مقابل ٠٫٧٥٧ للقواعد، والسلسلة كاملة صحيحة في ٧١٫٧٪ مقابل ٣٣٫٣٪. ولكنّا لم ننشره، لأن رخصة بيانات تدريبه غير واضحة؛ فالموقع يعمل بالقواعد، والنموذج جاهز متى اتضحت الرخصة.»

> «وفي الموثوقية: خمس عشرة حالة صعبة — اسم مشترك، راوٍ مجهول، سلسلة ناقصة، نص ليس إسنادًا، تحويل — نجحت كلها، وأعدناها ثلاث مرات فكانت النتيجة واحدة. ولا مشكلات وصول جسيمة في أي صفحة بمعيار WCAG 2.1 AA. وسبعة وعشرون من أسانيدنا السبعة والثلاثين يجدها الموقع في شجرتها الصحيحة دون تدخل.»

## 3:45–4:15 · Cost and continuity · التكلفة والاستمرار

> «التكلفة التشغيلية صفر: صفحات ثابتة على الخطة المجانية، بلا خادم ولا قاعدة بيانات ولا مفتاح API. وكل ما في الصفحة يعمل في المتصفح. والبيانات ملفات JSON يفحصها مدقّق قبل كل نشر، فلا يُنشر إسناد بلا مصدر.»

## 4:15–4:45 · What's next · ما التالي (planned, not built)

> «ما لم نبنه بعد، ونفصله عمّا أُنجز:»
1. «اختبار المستخدمين الخمسة: الشجرة باليد مقابل سند — البروتوكول جاهز، والنتائج لم تُجمع بعد.»
2. «مراجعة تراجم الرواة الاثنين والتسعين بيد متخصص، ثم ترقيتها إلى مصدر موثق.»
3. «أحاديث أكثر من الكتب الستة بالطريقة نفسها.»
4. «نشر النموذج في المتصفح إن اتضحت رخصة البيانات، مع بقاء القواعد احتياطًا.»

## 4:45–5:00 · Close · الختام

> «سند أداة مساعدة، لا تحكم على الأحاديث ولا تُفتي. ننقل ولا نحكم، ونقول «لا مصدر بعد» إن لم نجد. لكلِّ حديثٍ إسناد.»

Show the live link: **sanad-pi-five.vercel.app**

## If asked · أسئلة متوقعة

| Question | Short answer (all measured or documented) |
| --- | --- |
| Is the model running on the site? | No. Trained and measured; not published because Sanadset's licence is unclear. The site runs the rule parser. (`docs/EVALUATION.md`) |
| How do you know a fact is right? | Each is copied from a page whose link is stored next to it; the owner checked all 37 isnads; narrator records are marked «يحتاج تحققًا» until checked. (`docs/SOURCES.md`, `docs/REVIEW.md`) |
| What about the earlier project? | `sanad2` is disclosed in `docs/BASELINE.md`; only the logo artwork was reused; no code. |
| Did users test it? | The protocol is ready (`docs/USER_TEST.md`); results are reported only after the test is run. |
