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
    // «أسانيد «…»: ثمانية أسانيد عند مصنِّفَين.» Counts from data only.
    heroCaption: (title: string, routes: string, compilers: string) => `أسانيد «${title}»: ${routes} عند ${compilers}.`,
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
    emptyText: "اختر إسنادًا من القائمة لتقرأ نصّه.",
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
