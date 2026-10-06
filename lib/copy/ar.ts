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
    homeLink: "الرئيسية",
    tree: "شجرة الأسانيد",
    parse: "الصق إسنادًا",
    about: "المنهج",
  },

  search: {
    label: "ابحث بكلمات الحديث أو باسم راوٍ",
    button: "ابحث",
    headerLabel: "البحث في الموقع",
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
    intro: "ابحث عن حديث، فترى أسانيده بنصّها من كتبها في شجرة واحدة: أين تلتقي، وأين تفترق.",
    // «أسانيد «…»: ثمانية أسانيد عند مصنِّفَين.» Counts only: the drawing is a sketch, so the caption makes no claim about a meeting point.
    heroCaption: (title: string, sentence: string) => `أسانيد «${title}»: ${sentence}`,
    // The tag next to the hero drawing.
    illustration: "رسم توضيحي",
    searchPlaceholder: "مثلًا: إنما الأعمال",
    tryLabel: "جرّب",
    pasteTitle: "عندك إسناد من كتاب؟",
    pasteText: "الصقه، ونستخرج رواته ونرسم سلسلته.",
    featured: "أحاديث مختارة",
    // «من رواية عمر بن الخطاب رضي الله عنه. عند البخاري ومسلم.»
    narratedBy: (who: string, compilers: string) => `من رواية ${who}. عند ${compilers}.`,
    companionsCount: (count: string) => `${count} من الصحابة`,
    openTree: (routes: string) => `افتح الشجرة: ${routes}`,
    noResults: "لم نجد حديثًا بهذه الكلمات. جرّب كلمة من نص الحديث أو اسم راوٍ.",
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
    noGrade: "لم ننقل نصّ الحكم بعد، ولن نعرض حكمًا بلا مصدر.",
    gradeSource: "المصدر",
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
    routesThrough: (routes: string) => `يمرّ به ${routes}:`,
    sourceLink: "المصدر",
  },

  parse: {
    title: "الصق إسنادًا",
    intro: "من أي كتاب. نستخرج الرواة، ونرسم السلسلة، ونبحث عنها في شجرة الحديث.",
    label: "نصّ الإسناد",
    hint: "يكفي الإسناد وحده، ولا يضرّ أن يأتي معه المتن.",
    privacy: "يُحلَّل النص في متصفحك، ولا نحفظه ولا نرسله.",
    analyse: "حلِّل الإسناد",
    soon: "قريبًا",
    noticeTitle: "استخراج آلي — راجِع النتائج",
    noticeText: "قد يخلط الذكاء الاصطناعي بين رواة يتشابهون في الاسم. راجِع كل اسم قبل أن تعتمد عليه.",
    chainTitle: "السلسلة كما وردت",
    chainAria: "من النبي ﷺ في الأعلى إلى المصنِّف في الأسفل",
    missingCompiler: "المصنِّف، ولم يُذكر في النص",
    chainNote: "بين كل راويين صيغة الأداء كما جاءت في النص المُلصَق.",
    foundTitle: (title: string) => `وجدناه في شجرة «${title}»`,
    foundFirst: (total: string, title: string) => `يطابق الإسناد الأول من ${total}: ${title}.`,
    foundNth: (no: string, total: string, title: string) => `يطابق الإسناد ${no} من ${total}: ${title}.`,
    showInTree: "اعرض الإسناد في الشجرة",
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
        text: "نموذج تعلّم آلي صغير يعمل في متصفحك يستخرج أسماء الرواة وصيغ الأداء، ثم نطابق كل اسم بترجمته في كتب الرجال. ونقيس دقّته وننشرها.",
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
    editionsPlaceholder: "[أضف الطبعات ودور النشر]",
    listJoin: "، و",
    statusTitle: "ثلاث حالات للدليل",
    statusText: {
      ok: "النص منقول من المصدر، وموضعه مراجَع.",
      check: "استُخرج آليًّا، أو لم يُراجَع موضعه بعد. لا تعتمد عليه قبل المراجعة.",
      none: "لم نجد له مصدرًا، أو لم ننقله بعد. وهذا لا يعني أن الحديث موضوع.",
    },
    statusNote: "هذه حالات للدليل، لا أحكام على الحديث. أحكام الأئمة نصوص ننقلها منسوبةً إلى قائليها، ولا نلوّنها.",
    limitsTitle: "ما لا يُحسنه الذكاء الاصطناعي",
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

  placeholder: {
    intro: "ابحث عن حديث، فترى أسانيده بنصّها من كتبها في شجرة واحدة: أين تلتقي، وأين تفترق.",
    building: "الموقع قيد البناء.",
  },
} as const;
