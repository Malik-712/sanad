# Slide deck — content for the official template

The official template file is not in the repository, so this is the text to paste into it, slide by slide. The template keeps its own fonts and colours (`docs/BRIEF.md`); Sanad's green and gold appear only in the logo and the screenshots. Slide text is in Arabic; notes are for the presenter. Every number is measured (sources in brackets). **«What's been built» (slides 2–7) and «What's next» (slide 8) stay on separate slides.** The model is always «دُرِّب وقِيس ولم يُنشر».

Screenshots to use: `docs/screenshots/home.png`, `docs/screenshots/tree.png`, `docs/screenshots/parse.png` (taken from the live site on 6 Oct).

---

## Slide 0 — Cover

- **Title:** سَنَد
- **Subtitle:** لكلِّ حديثٍ إسناد
- **Line:** أسانيد الحديث الواحد في شجرة واحدة، كل إسناد بمصدره.
- **Footer:** المسار ٠٤ — أدوات المعرفة والتحقق · sanad-pi-five.vercel.app
- **Visual:** the Sanad mark (`public/brand/sanad-mark.svg`).

## Slide 1 — The problem · المشكلة

- للحديث الواحد أسانيد كثيرة متفرقة في كتب السنة.
- لمعرفة أين تلتقي وأين تفترق، يرسمها الطالب بيده إسنادًا إسنادًا.
- أدوات البحث تعرض إسنادًا واحدًا في كل مرة، لا صورة جامعة.
- وإسناد يُنقل في منشور: هل هو معروف؟ ومن «سفيان» فيه؟

*Notes:* keep to the student's task; do not claim a measured time saving (the user test has not been run).

## Slide 2 — The solution · الحل *(built)*

- شجرة واحدة تجمع كل أسانيد الحديث: النبي ﷺ في الأعلى، والمصنِّفون في الأسفل.
- نقطة الالتقاء ونقاط الافتراق ظاهرة على الشجرة.
- كل إسناد بكتابه وطبعته ورقمه وجزئه وصفحته، ورابط الصفحة.
- ننقل ولا نحكم: الحكم منقول منسوب إلى قائله، وما لا مصدر له نقول عنه «لا مصدر بعد».
- **Visual:** `tree.png`.

## Slide 3 — What it offers · العرض *(built)*

- **البحث والشجرة:** ابحث بكلمات الحديث أو باسم راوٍ ← شجرة تفاعلية.
- **لوحة المصدر:** نص الإسناد كما في كتابه، و«افتح الموضع في المصدر».
- **الراوي:** ترجمته من «تقريب التهذيب» برقمها وصفحتها، وحالتها.
- **الصق إسنادًا:** استخراج آلي للأسماء وصيغ الأداء في المتصفح، وربط كل اسم بترجمته، واختيار عند الاشتباه («سفيان»)، والبحث عن الإسناد في الشجرة. النص لا يغادر المتصفح.
- **البيانات:** ٥ أحاديث، ٣٧ إسنادًا من البخاري ومسلم (راجعها صاحب المشروع كلها)، ٩٢ راويًا.
- **Visual:** `home.png` and `parse.png` side by side.

*Notes:* live demo here if time allows (`docs/JUDGES.md`, items 1–4).

## Slide 4 — AI and metrics · الذكاء الاصطناعي والقياس *(built)*

- نموذج BERT-mini عربي، ضُبط على ٩٦٬٩٢٦ إسنادًا من Sanadset لاستخراج أسماء الرواة.
- قِيس على ٣٠٠ إسناد من ٩ كتب لم يرها في التدريب، مقابل محلِّل القواعد، بالمقياس نفسه:

| | F1 | السلسلة كاملة صحيحة |
| --- | --- | --- |
| القواعد (تعمل في الموقع) | ٠٫٧٥٧ | ٣٣٫٣٪ |
| النموذج (int8، ١٢ م.ب) | ٠٫٩١٦ | ٧١٫٧٪ |

- **دُرِّب وقِيس ولم يُنشر:** رخصة بيانات تدريبه غير واضحة؛ الموقع يعمل بالقواعد.
- الربط بالرواة: ثلاث حالات (عالٍ / يحتاج تحققًا / لا مصدر بعد)، والسياق يرجّح ولا يقرّر.
- على أسانيدنا الـ٣٧: الإسناد يُوجد في شجرته الصحيحة دون تدخل في ٢٧ منها.

*Sources:* `docs/EVALUATION.md` (a) and (b). Say that (b) is our own data and is optimistic.

## Slide 5 — Reliability · الموثوقية *(built)*

- ١٥ حالة صعبة (اسم مشترك، راوٍ مجهول، سلسلة ناقصة، نص ليس إسنادًا، متن بلا إسناد، تحويل «ح»، تشكيل تام، صيغ مختصرة…): نجحت ١٥ من ١٥.
- أُعيدت ٣ مرات: النتيجة نفسها في كل مرة (بصمة SHA-256 واحدة).
- لا يُنشر إسناد بلا مصدر: مدقّق البيانات يوقف البناء.
- إمكانية الوصول: ٠ مشكلات جسيمة أو حرجة في كل الصفحات (WCAG 2.1 AA، على ٣٩٠ و١٤٤٠ بكسل).
- اختبارات: ١٣٠ اختبار وحدة، و٣٥ اختبار متصفح على الموقع الحي.
- Lighthouse: see `docs/EVALUATION.md` for the measured medians before quoting them.

*Sources:* `docs/HARD_CASES.md`, `tests/e2e/`, `docs/EVALUATION.md`.

## Slide 6 — Cost and continuity · التكلفة والاستمرار *(built)*

- التكلفة التشغيلية: **صفر** — صفحات ثابتة على خطة Vercel المجانية.
- لا خادم، ولا قاعدة بيانات، ولا مفتاح API، ولا نموذج يُستدعى عن بُعد.
- البيانات ملفات JSON في المستودع، ومدقّق قبل كل نشر، واختبارات تلقائية مع كل دفعة (GitHub Actions).
- البديل: الموقع يُبنى ويُستضاف على أي مضيف يدعم Next.js؛ والقواعد تعمل دون نموذج.
- مراجعة المحتوى: صاحب المشروع يراجع ويوثّق في `docs/REVIEW.md`.

*Source:* `docs/COST.md`.

## Slide 7 — Transparency · الشفافية *(built)*

- كل أداة ذكاء اصطناعي ونموذج وبيانات وحزمة مسجّلة برخصتها (`docs/SOURCES_LOG.md`).
- المشروع السابق «sanad2» معلَن، وما أُعيد استخدامه (الشعار) مذكور (`docs/BASELINE.md`).
- لا بيانات مستخدمين حقيقية، ولا مفاتيح في المستودع (فُحص تاريخه كله).

*Notes:* optional; merge into slide 6 if the template has fewer slides.

## Slide 8 — What's next · الخطوات التالية *(planned, not built)*

- اختبار المستخدمين الخمسة: الشجرة باليد مقابل سند — البروتوكول جاهز، والنتائج لم تُجمع بعد.
- مراجعة تراجم الرواة الـ٩٢ بيد متخصص، وترقيتها إلى «مصدر موثق».
- أحاديث أكثر من الكتب الستة، بالطريقة نفسها: نقل بالنص، ورابط، ومراجعة.
- نشر النموذج في المتصفح إذا اتضحت رخصة البيانات، مع بقاء القواعد احتياطًا.

*Notes:* say clearly that none of these is done.

## Slide 9 — Close

- **لكلِّ حديثٍ إسناد**
- أداة مساعدة بالذكاء الاصطناعي، لا تحكم على الأحاديث ولا تُفتي.
- sanad-pi-five.vercel.app · github.com/Malik-712/sanad
