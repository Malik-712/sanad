// Every Arabic string the user sees lives here, so the owner can review it in one place.
// Fixed sentences are copied character for character from CLAUDE.md and design/screens/.

// About page and footer (CLAUDE.md, scholarly rule 6).
const disclaimer = "أداة مساعدة بالذكاء الاصطناعي، لا تحكم على الأحاديث ولا تُفتي";

export const ar = {
  siteName: "سَنَد",
  slogan: "لكلِّ حديثٍ إسناد",

  meta: {
    title: "سَنَد — لكلِّ حديثٍ إسناد",
    titleTemplate: "%s — سَنَد",
    description:
      "ابحث عن حديث، فترى أسانيده بنصّها من كتبها في شجرة واحدة: أين تلتقي، وأين تفترق.",
  },

  skipLink: "تخطَّ إلى المحتوى",

  nav: {
    label: "القائمة الرئيسية",
    home: "سَنَد، الرئيسية",
    // Three links only (owner, 6 Oct): search, paste, about.
    search: "البحث",
    parse: "الصق إسنادًا",
    about: "عن المشروع",
  },

  search: {
    label: "ابحث بكلمات الحديث أو باسم راوٍ",
    placeholder: "اكتب كلمات من الحديث أو اسم راوٍ",
    hint: "أو رقم الحديث، مثل: البخاري ١",
    button: "ابحث",
    clear: "مسح",
    clearTitle: "مسح النص",
  },

  disclaimer,
  // The same sentence as written in the design's footers and panels, with its full stop.
  disclaimerLine: `${disclaimer}.`,
  // Every source panel (CLAUDE.md, scholarly rule 6).
  sourceNote: "ذِكرُ الحديث في كتابٍ ليس حكمًا عليه. الأحكام تُنقل منسوبةً إلى قائليها.",

  status: {
    ok: "مصدر موثق",
    check: "يحتاج تحققًا",
    none: "لا مصدر بعد",
  },

  demoTag: "بيانات توضيحية",

  footer: {
    aboutLink: "كيف نعمل، ومن أين ننقل",
    sourcesLink: "المصادر وكيف نتحقق",
    startSearch: "ابدأ البحث",
    demoNote: "البيانات في هذا النموذج بيانات توضيحية.",
  },

  // Place and citation labels.
  place: {
    volume: "ج",
    page: "ص",
    number: "رقم",
  },

  // Counted nouns (all masculine): singular, dual nominative / genitive, plural, accusative singular, definite plural.
  nouns: {
    isnad: {
      one: "إسناد",
      dualNom: "إسنادان",
      dualGen: "إسنادين",
      plural: "أسانيد",
      acc: "إسنادًا",
      definite: "الأسانيد",
      definiteOne: "الإسناد",
    },
    compiler: {
      one: "مصنِّف",
      dualNom: "مصنِّفان",
      dualGen: "مصنِّفَين",
      plural: "مصنِّفين",
      acc: "مصنِّفًا",
      definite: "المصنِّفون",
      definiteOne: "المصنِّف",
    },
    narrator: {
      one: "راوٍ",
      dualNom: "راويان",
      dualGen: "راويَين",
      plural: "رواة",
      acc: "راويًا",
      definite: "الرواة",
      definiteOne: "الراوي",
    },
    hadith: {
      one: "حديث",
      dualNom: "حديثان",
      dualGen: "حديثين",
      plural: "أحاديث",
      acc: "حديثًا",
      definite: "الأحاديث",
      definiteOne: "الحديث",
    },
    name: {
      one: "اسم",
      dualNom: "اسمان",
      dualGen: "اسمين",
      plural: "أسماء",
      acc: "اسمًا",
      definite: "الأسماء",
      definiteOne: "الاسم",
    },
  },

  // Number words used with masculine counted nouns (so 3–10 take the feminine form).
  numbers: {
    one: "واحد",
    units: ["", "", "", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة"],
    elevenTens: "أحد عشر",
    twelveNom: "اثنا عشر",
    twelveGen: "اثني عشر",
    teen: "عشر",
    // 21–99: unit + «و» + tens. Units 1 and 2 inside a compound number.
    unitOne: "واحد",
    unitTwoNom: "اثنان",
    unitTwoGen: "اثنين",
    tensNom: ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"],
    tensGen: ["", "", "عشرين", "ثلاثين", "أربعين", "خمسين", "ستين", "سبعين", "ثمانين", "تسعين"],
    and: "و",
    definitePrefix: "ال",
  },

  home: {
    // «من رواية عمر بن الخطاب رضي الله عنه. عند البخاري ومسلم.»
    narratedBy: (who: string, compilers: string) => `من رواية ${who}. عند ${compilers}.`,
    companionsCount: (count: string) => `${count} من الصحابة`,
    // «صحيح البخاري، حديث ١ · ثمانية أسانيد»
    sourceLine: (book: string, number: string, routes: string) => `${book}، حديث ${number} · ${routes}`,
    openTree: "افتح شجرة الأسانيد",
    listTitle: "الأحاديث",
    // Counts come from data/ (owner, 6 Oct: not a fixed number).
    count: (hadiths: string) => `في الموقع ${hadiths}.`,
    results: (hadiths: string) => `النتائج: ${hadiths}.`,
    noResults: (hadiths: string) =>
      `لا نتائج. في الموقع الآن ${hadiths} فقط. يمكنك لصق إسناد أي حديث ليحلّله الموقع.`,
    pasteButton: "الصق إسنادًا",
    and: "و",
  },

  hadith: {
    back: "نتائج البحث",
    eyebrow: "شجرة الأسانيد",
    // «ثمانية أسانيد عند مصنِّفَين.» Counts from data only; the meeting point comes with Session B.
    counts: (routes: string, compilers: string) => `${routes} عند ${compilers}.`,
    // From the engine: the common link carries every isnad, or only some (owner decision, 6 Oct).
    countsMeetAll: (routes: string, compilers: string, name: string) => `${routes} عند ${compilers}، تلتقي كلها عند ${name}.`,
    countsMeetSome: (routes: string, compilers: string, some: string, name: string) =>
      `${routes} عند ${compilers}، يلتقي ${some} منها عند ${name}.`,
    matnFrom: "نص المتن من",
    variantsSummary: "قراءة أخرى في المتن",
    variantSource: "المصدر",
    tabsLabel: "طريقة العرض",
    tabTree: "الشجرة",
    routesHint: "لكلِّ حديثٍ إسناد. اختر إسنادًا لإبرازه في الشجرة وقراءة نصّه.",
    routeTitle: (book: string, number: string) => `${book}، حديث ${number}`,
    panelTitle: (book: string, number: string) => `${book}، حديث رقم ${number}`,
    panelEyebrow: (no: string, total: string) => `الإسناد ${no} من ${total}`,
    close: "إغلاق اللوحة",
    emptyTitle: "اختر من الشجرة",
    emptyText: "اضغط على راوٍ لترى ترجمته، أو على إسناد في القائمة لتقرأ نصّه.",
    treeLabel: "شجرة الأسانيد",
    treeSoon: "تُرسم الشجرة هنا قريبًا. اختر إسنادًا من القائمة لتقرأ نصّه.",
    panelLabel: "لوحة المصدر",
    isnadText: "الإسناد بنصّه من المصدر",
    chainLabel: "رواة الإسناد",
    chainAria: "من النبي ﷺ في الأعلى إلى المصنِّف في الأسفل",
    place: "الموضع",
    grade: "الحكم المنقول",
    noGrade: "لا حكم مذكور.",
    gradeBy: "قاله",
    gradeFrom: "نقلناه من",
    gradeSource: "المصدر",
    statusLabel: "حالة الإسناد",
    // The source block above the tree (owner, 6 Oct). Values come from the route that carries the matn.
    sourceTitle: "المصدر",
    sourceBook: "الكتاب",
    sourceAuthor: "المصنِّف",
    sourceNumber: "رقم الحديث",
    sourcePlace: "الجزء والصفحة",
    openInSource: "افتح في المصدر",
    notMentioned: "غير مذكور",
    // «كيف أتحقق من هذا؟» under the tree.
    verifyTitle: "كيف أتحقق من هذا؟",
    verifySteps: [
      "افتح الكتاب من زر «افتح الموضع في المصدر».",
      "قارن رقم الحديث بما في الكتاب.",
      "قارن أسماء الرواة في الإسناد واحدًا واحدًا.",
    ],
    allSources: "كل المصادر وحالتها",
    openSource: "افتح الموضع في المصدر",
    copy: "انسخ التوثيق",
    copied: "نُسخ التوثيق",
  },

  narrator: {
    // The role word above the name (design kindName).
    role: {
      prophet: "رأس الإسناد",
      companion: "صحابي",
      narrator: "راوٍ",
      compiler: "مصنِّف",
    },
    tabaqa: "الطبقة",
    death: "الوفاة",
    notReported: "لم تُنقل",
    book: "الكتاب",
    taqribHeading: "قال ابن حجر في «تقريب التهذيب»",
    taqribRef: (page: string, entry: string) => `تقريب التهذيب، ص ${page}، رقم ${entry}`,
    noQuote: "لم ننقل نصّ الحكم بعد، ولن نعرض حكمًا بلا مصدر.",
    prophetNote: "إليه ﷺ ترجع الأسانيد كلها.",
    identification: "تعيين الراوي",
    edition: "الطبعة",
    editionNotMentioned: "غير مذكورة",
    sourceDetails: "تفاصيل المصدر",
    entryNo: "رقم الترجمة",
    page: "الصفحة",
    routesThrough: (routes: string) => `يمرّ به ${routes}:`,
    sourceLink: "المصدر",
  },

  parse: {
    title: "الصق إسنادًا",
    intro: "من أي كتاب. نستخرج الرواة، ونرسم السلسلة، ونبحث عنها في شجرة الحديث.",
    label: "نصّ الإسناد",
    hint: "يكفي الإسناد وحده، ولا يضرّ أن يأتي معه المتن.",
    placeholder: "مثل: حدثنا فلان، قال: حدثنا فلان، عن فلان، عن فلان…",
    privacy: "يُحلَّل النص في متصفحك، ولا نحفظه ولا نرسله.",
    analyse: "حلِّل الإسناد",
    sample: "جرّب مثالًا",
    sampleFrom: (label: string) => `المثال من ${label}، بنصّه.`,
    shortcut: "أو اضغط Ctrl و Enter.",
    counter: (n: string, max: string) => `${n} من ${max} حرف`,
    problems: {
      empty: "الصق نصّ الإسناد أولًا.",
      tooLong: (max: string) => `النص أطول من ${max} حرف. الصق الإسناد وحده، أو جزءًا منه.`,
      notIsnad: "لم نجد في النص إسنادًا: لا صيغة أداء ولا أسماء رواة. الصق نصًّا يبدأ بمثل «حدثنا» أو «عن».",
    },
    noticeTitle: "استخراج آلي — راجِع النتائج",
    // Changed 6 Oct: the live reader is the rule parser, so the notice no longer says «الذكاء الاصطناعي».
    noticeText: "قد يخلط الاستخراج الآلي بين رواة يتشابهون في الاسم. راجِع كل اسم قبل أن تعتمد عليه.",
    engine: "طريقة الاستخراج: قواعد صيغ الأداء («حدثنا»، «عن»، «قال»…)، تعمل في متصفحك.",
    matchHigh: "تطابق عالٍ",
    matchMid: "تطابق متوسط",
    chosen: "اخترتَه",
    percent: (n: string) => `${n}٪`,
    matchNote: "نسبة التطابق: من ٩٠٪ فأكثر تطابق عالٍ. أقلّ من ذلك يحتاج تحققًا. ومن لم نجد له ترجمة نعلّمه «لا مصدر بعد».",
    prophet: "رسول الله ﷺ",
    chooserTitle: (name: string) => `من «${name}» هنا؟`,
    chooserByStudent: (best: string, student: string) => `الأقرب ${best}، لأن ${student} يروي عنه في أسانيدنا.`,
    chooserByTeacher: (best: string, teacher: string) => `الأقرب ${best}، لأنه يروي عن ${teacher} في أسانيدنا.`,
    chooserAsk: "اختر لتؤكّد.",
    chooserGroup: (name: string) => `الراوي المقصود بـ«${name}»`,
    chainTitle: "السلسلة كما وردت",
    chainAria: "من النبي ﷺ في الأعلى إلى المصنِّف في الأسفل",
    missingCompiler: "المصنِّف، ولم يُذكر في النص",
    chainNote: "بين كل راويين صيغة الأداء كما جاءت في النص المُلصَق.",
    tahwilFound: "في النص «ح» (تحويل): عرضنا من الأسانيد التي فيه الإسنادَ الذي وجدناه في الشجرة.",
    tahwilMain: "في النص «ح» (تحويل): عرضنا الإسناد الأخير كاملًا.",
    meetingPoint: "نقطة الالتقاء",
    foundTitle: (title: string) => `وجدناه في شجرة «${title}»`,
    foundFirst: (total: string, title: string) => `يطابق الإسناد الأول من ${total}: ${title}.`,
    foundNth: (no: string, total: string, title: string) => `يطابق الإسناد ${no} من ${total}: ${title}.`,
    showInTree: "اعرض الإسناد في الشجرة",
    notFoundTitle: "لم نجده في شجرة بعد",
    notFoundText: "لا يطابق هذا الإسناد بعينه أيَّ إسنادٍ في الأحاديث التي جمعناها حتى الآن. وهذا لا يقول شيئًا عن صحّته.",
    notFoundChoose: "اختر الراوي المقصود في الأسماء التي تحتاج تحققًا، فنبحث من جديد.",
    announce: (names: string, found: string | null) => (found ? `${names}. وجدناه في شجرة «${found}».` : `${names}. لم نجده في شجرة بعد.`),
  },

  about: {
    metaTitle: "المنهج",
    title: "كيف يعمل سَنَد",
    intro: "مبدؤنا: لكلِّ حديثٍ إسناد. نجمع أسانيد الحديث الواحد بنصّها في شجرة واحدة، لترى أين تلتقي وأين تفترق.",
    stepsTitle: "أربع خطوات",
    steps: [
      { title: "ننقل الأسانيد", text: "نأخذ إسناد كل رواية من كتابها بنصّه، مع الطبعة والجزء والصفحة." },
      {
        title: "نفكّك الإسناد",
        // Changed 6 Oct: the trained model is not shipped (data licence unclear); the live reader is the rule parser.
        text: "نستخرج أسماء الرواة وصيغ الأداء بقواعد تعمل في متصفحك، ثم نطابق كل اسم بترجمته في كتب الرجال، ونعلّم ما يحتاج تحققًا. ودرّبنا نموذج تعلّم آلي صغيرًا ونشرنا دقّته مقارنةً بالقواعد، ولم نعتمده بعد لأن رخصة بيانات تدريبه غير واضحة.",
      },
      {
        title: "نرسم الشجرة",
        text: "الراوي الذي يتكرّر في أكثر من إسناد يصير عقدة واحدة، فتظهر نقطة الالتقاء ونقاط الافتراق.",
      },
      {
        title: "ننقل ولا نحكم",
        text: "ننقل كلام الأئمة بنصّه مع الكتاب والصفحة. وإن لم نجد نصًّا قلنا ذلك، ولم نضع حكمًا من عندنا.",
      },
    ],
    readTitle: "قراءة الشجرة",
    key: {
      prophet: "النبي ﷺ، في أعلى الشجرة",
      companion: "صحابي",
      narrator: "راوٍ بعد الصحابة",
      compiler: "مصنِّف، في أسفل الشجرة",
      common: "نقطة الالتقاء: راوٍ تمرّ به أسانيد كثيرة",
      branch: "نقطة افتراق: حيث يتفرّع الإسناد",
    },
    sourcesTitle: "من أين ننقل",
    booksLabel: "كتب الرواية",
    rijalLabel: "أحكام الرواة",
    // The design's death date is sample content (CLAUDE.md rule 9), so it is left out.
    rijalBook: "تقريب التهذيب، لابن حجر العسقلاني",
    rijalNote: "ننقل عبارته كما هي، مع رقم الترجمة والصفحة.",
    editionsLabel: "الطبعات المعتمدة",
    // As al-Maktaba al-Shamila records them (docs/SOURCES.md); no edition is filled in from memory.
    editionsPlaceholder: "صحيح البخاري: ط السلطانية. صحيح مسلم: ت عبد الباقي. تقريب التهذيب: الطبعة غير مذكورة. كما في بيانات المكتبة الشاملة.",
    listJoin: "، و",
    statusTitle: "ثلاث حالات للدليل",
    statusText: {
      ok: "النص منقول من المصدر، وموضعه مراجَع.",
      check: "استُخرج آليًّا، أو لم يُراجَع موضعه بعد. لا تعتمد عليه قبل المراجعة.",
      none: "لم نجد له مصدرًا، أو لم ننقله بعد. وهذا لا يعني أن الحديث موضوع.",
    },
    statusNote: "هذه حالات للدليل، لا أحكام على الحديث. أحكام الأئمة نصوص ننقلها منسوبةً إلى قائليها، ولا نلوّنها.",
    limitsTitle: "ما لا يُحسنه الاستخراج الآلي",
    limits: [
      "قد يخلط بين رواة يتشابهون في الاسم، مثل «سفيان» بين ابن عيينة والثوري.",
      "قد يخطئ في قراءة النص غير المشكول، أو في تقطيع الأسماء.",
      "لا يرجّح بين أقوال الأئمة، ولا يحكم على حديث بصحة أو ضعف.",
      "الشجرة تعرض ما وجدناه من أسانيد فقط، وقد يكون للحديث أسانيد أخرى.",
      "ارجع دائمًا إلى المصدر المطبوع، واسأل أهل العلم.",
    ],
    privacyTitle: "الخصوصية",
    privacyText: "لا حسابات ولا تتبّع. ما تلصقه في «الصق إسنادًا» يُحلَّل في متصفحك، ولا يُحفظ ولا يُرسل إلينا.",
  },

  notFound: {
    metaTitle: "الصفحة غير موجودة",
    title: "لم نجد هذه الصفحة",
    text: "قد يكون الرابط ناقصًا أو قديمًا. ابدأ من الصفحة الرئيسية.",
  },

  tree: {
    zoomIn: "تكبير",
    zoomOut: "تصغير",
    reset: "إعادة الشجرة إلى وضعها",
    resetShort: "إعادة الضبط",
    // One line under the legend (owner, 6 Oct).
    legendNote: "نقطة الالتقاء: راوٍ تلتقي عنده أكثر الأسانيد. نقطة الافتراق: موضع يتفرّع منه الإسناد إلى أكثر من راوٍ.",
    hintMobile: "اسحب لتحريك الشجرة، واضغط على راوٍ لتظهر ترجمته.",
    hintDesktop: "النبي ﷺ في الأعلى، والمصنِّفون في الأسفل. اسحب للتحريك.",
    zoomPct: (pct: string) => `${pct}٪`,
    nodeAria: (name: string, role: string) => `${name}، ${role}`,
  },

  // The narrator panel on the hadith page (design «لوحة الراوي»). Counts come from the engine.
  narratorPanel: {
    label: "لوحة الراوي",
    roleCommon: (role: string) => `${role}، وهو نقطة الالتقاء`,
    prophetNote: "إليه ﷺ ترجع الأسانيد كلها في هذه الشجرة.",
    commonAll: (definite: string) => `تمرّ به ${definite} كلها`,
    commonSome: (count: string, total: string) => `تمرّ به ${count} من ${total}`,
    branchesTo: (students: string) => `، ومنه تتفرّع إلى ${students}`,
    through: (count: string, total: string) => `يمرّ به ${count} من ${total}`,
    throughMarked: "، وهي مُعلَّمة في القائمة.",
    showRoutes: "اعرض الأسانيد",
    fullPage: "الترجمة كاملة",
    thruSelected: "يمرّ بالراوي المختار",
  },

  legend: {
    prophet: "النبي ﷺ",
    companion: "صحابي",
    narrator: "راوٍ",
    compiler: "مصنِّف",
    common: "نقطة الالتقاء",
    branch: "نقطة افتراق",
    selected: "المختار",
  },

  // /sources (owner, 6 Oct): every book and site Sanad copies from, and what has been checked. Counts come from data/.
  sources: {
    metaTitle: "المصادر",
    title: "المصادر وكيف نتحقق",
    intro: "كل نصّ في الموقع منقول من هذه الكتب، ومعه رابط صفحته. وهنا ما راجعناه منها وما لم نراجعه بعد.",
    textTitle: "كتب ننقل منها النص",
    notesTitle: "كتب نستشهد بها في الملاحظات",
    notesText: "نذكرها لتعيين راوٍ أو لتوضيح قراءة، برابط الصفحة. لا نعرض نصّها في الموقع.",
    author: "المؤلف",
    edition: "الطبعة كما في الشاملة",
    use: "ماذا ننقل منه",
    open: "افتح المصدر",
    noLink: "لا رابط محفوظ",
    isnads: (total: string, checked: string) => `الأسانيد المنقولة منه: ${total}. راجعها صاحب المشروع: ${checked}.`,
    entries: (total: string, checked: string) => `التراجم المنقولة منه: ${total}. راجعها صاحب المشروع: ${checked}.`,
    quotes: (total: string, checked: string) => `النصوص المنقولة منه: ${total}، في أسانيد راجعها صاحب المشروع: ${checked}.`,
    licenceNote: "رخصة الموقع غير واضحة، فننقل منه الحكم القصير مع قائله ورابطه فقط.",
  },

  placeholder: {
    intro: "ابحث عن حديث، فترى أسانيده بنصّها من كتبها في شجرة واحدة: أين تلتقي، وأين تفترق.",
    building: "الموقع قيد البناء.",
  },
} as const;
