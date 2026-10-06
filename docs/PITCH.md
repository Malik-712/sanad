# Pitch — 5 minutes

Spoken in Arabic (the lines to say are in Arabic), with the live site on screen. Timings add up to 5:00. Every number is measured; nothing in «What's next» may be presented as done.

## 0:00–0:30 · The problem · المشكلة

> «الإسناد الواحد، أو ما يقاربه، قد يقف وراء أحاديثَ كثيرة في كتبٍ كثيرة. ولكي يعرفها الطالب كلَّها، ويرى أين تلتقي السلاسل وأين تفترق، يقرأ الأسانيد واحدًا واحدًا ويرسمها بيده. وإذا وجد إسنادًا في كتابٍ أو منشور لا يعرف: أين ورد هذا الإسناد؟ ومن «سفيان» فيه؟»

## 0:30–1:00 · The solution · الحل

> «سَنَد محلِّل إسنادٍ ذكي: تلصق الإسناد، فيقرؤه نموذج ذكاء اصطناعي في متصفحك، ثم نجد كل حديثٍ ورد فيه هذا الإسناد أو ما يقاربه، ونرسم السلسلة المشتركة، والأحاديث في أسفلها. شعارنا: لكلِّ حديثٍ إسناد. ولا نؤلّف شيئًا: كل نتيجة حديثٌ موجود فعلًا، برقمه ورابط ملف مصدره.»

## 1:00–3:00 · What's been built · ما أُنجز (live demo)

Demo on the live site (each step is in `docs/JUDGES.md`):

1. **Paste → AI reading** (30 s). «جرّب مثالًا»: the names with match tags; the model's line «قرأ النموذجُ الأسماء في متصفحك».
2. **The «سفيان» choice** (20 s). The box with the likely candidate and the reason; the AI never decides alone.
3. **Everything found** (40 s). The summary with counts; the shared-chain graph; the ranked list, «الإسناد نفسه — ٦ من ٦ رواة», names highlighted; filters by book and match type; click a hadith or a narrator in the graph.
4. **Evidence** (30 s). Open a hadith: text, status «يحتاج تحققًا — من مجموعة خارجية», pinned corpus version, link to the exact source file, three verify steps; `/sources`.

Say while showing:

> «المجموعة ستةٌ وثلاثون ألفًا وثلاثمئة وتسعون حديثًا من الكتب الستة وموطأ مالك. وأحاديثنا الخمسة التي راجعها صاحب المشروع على كتبها، بسبعةٍ وثلاثين إسنادًا، لها شجرةٌ محققة وألواح مصادر كاملة.»

## 3:00–3:45 · AI and numbers · الذكاء الاصطناعي والأرقام

> «ما يفعله الذكاء الاصطناعي: يقرأ الأسماء وصيغ الأداء. دربنا نموذجًا صغيرًا (BERT-mini العربي) على Sanadset، وقسناه على ثلاثمئة إسنادٍ من تسعة كتبٍ لم يرها: F1 ‏٠٫٩١٦ مقابل ٠٫٧٥٧ للقواعد، والسلسلة كاملة صحيحة في ٧١٫٧٪ مقابل ٣٣٫٣٪. ويعطي في المتصفح التصنيفات نفسها التي يعطيها في بايثون على ١٠٠٪ من الكلمات. وما لا يفعله: لا يؤلّف حديثًا ولا راويًا؛ فالمطابقة والترتيب حسابٌ ثابتٌ نتيجته واحدة في كل مرة.»

> «وفي الموثوقية: اختبرنا الأسانيد السبعة والثلاثين التي راجعناها: كل الثمانية عشر من البخاري تجد حديثها في أول ثلاث نتائج. وخمس عشرة حالة صعبة نجحت كلها ثلاث مرات بنتيجة واحدة. وإن تعذّر النموذج قرأت القواعد وقالت الصفحة ذلك.»

## 3:45–4:15 · Cost and honesty · التكلفة والصراحة

> «التكلفة التشغيلية صفر: صفحات ثابتة، والنموذج يعمل في متصفحك، بلا خادم ولا مفتاح ولا قاعدة بيانات، ونصُّك لا يخرج منه. ونقول بصراحة: المجموعة والنموذج ترخيصهما غير واضح، فكلُّ ما نجلبه يحتاج تحققًا ولا نسميه «موثقًا»، والمطابقة بالاسم كما ورد.»

## 4:15–4:45 · What's next · ما التالي (planned, not built)

1. «اختبار المستخدمين الخمسة: الشجرة باليد مقابل سند — البروتوكول جاهز، والنتائج لم تُجمع بعد.»
2. «تعيين الرواة بأرقام: ربط رواة المجموعة بتراجم موثقة لنفرّق بين من يشتركون في الاسم.»
3. «شجرة لكل حديث مجلوب: جمع الأحاديث المتماثلة عبر الكتب، بعد مراجعتها.»
4. «توضيح الترخيص، أو استبدال المجموعة والبيانات بما ترخيصه واضح.»

## 4:45–5:00 · Close · الختام

> «سند أداة مساعدة، لا تحكم على الأحاديث ولا تُفتي. ننقل ولا نحكم، ونقول «لم نجد» إن لم نجد. لكلِّ حديثٍ إسناد.»

Show the live link: **sanad-pi-five.vercel.app**

## If asked · أسئلة متوقعة

| Question | Short answer (all measured or documented) |
| --- | --- |
| Is the AI really in the browser? | Yes: the tagger runs in a Web Worker through Transformers.js and gives the same labels as the Python model on 100.00 % of 14,789 words; the text never leaves the browser. If it cannot load, the rules take over and the page says so. |
| What does the AI decide? | Only which words are names. Matching and ranking are fixed, repeatable calculations on corpus text. |
| How do you know a result is right? | You don't have to trust it: each result is a real corpus hadith with its book, number and source file link, labelled unverified; verify by opening the book. Only our 5 hadiths are checked by the owner. |
| Where do the hadiths come from, and the licence? | An external open corpus (fawazahmed0/hadith-api, pinned commit); its text origin and licence are not stated, and our model's training data (Sanadset) also has an unclear licence. Both are disclosed on `/sources` and in `docs/SOURCES_LOG.md`. |
| Did users test it? | The protocol is ready (`docs/USER_TEST.md`); results are reported only after the test is run. |
