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
    twentyNom: "عشرون",
    twentyGen: "عشرين",
    definitePrefix: "ال",
  },

  placeholder: {
    intro: "ابحث عن حديث، فترى أسانيده بنصّها من كتبها في شجرة واحدة: أين تلتقي، وأين تفترق.",
    building: "الموقع قيد البناء.",
  },
} as const;
