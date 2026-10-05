// Every Arabic string the user sees lives here, so the owner can review it in one place.
// Fixed sentences are copied character for character from CLAUDE.md and design/screens/.

export const ar = {
  siteName: "سَنَد",
  slogan: "لكلِّ حديثٍ إسناد",

  meta: {
    title: "سَنَد — لكلِّ حديثٍ إسناد",
    titleTemplate: "%s — سَنَد",
    description:
      "ابحث عن حديث، فترى أسانيده بنصّها من كتبها في شجرة واحدة: أين تلتقي، وأين تفترق.",
  },

  nav: {
    label: "القائمة الرئيسية",
    home: "سَنَد، الرئيسية",
    parse: "الصق إسنادًا",
    about: "المنهج",
  },

  // About page and footer (CLAUDE.md, scholarly rule 6).
  disclaimer: "أداة مساعدة بالذكاء الاصطناعي، لا تحكم على الأحاديث ولا تُفتي",
  // Every source panel (CLAUDE.md, scholarly rule 6).
  sourceNote: "ذِكرُ الحديث في كتابٍ ليس حكمًا عليه. الأحكام تُنقل منسوبةً إلى قائليها.",

  status: {
    ok: "مصدر موثق",
    check: "يحتاج تحققًا",
    none: "لا مصدر بعد",
  },

  footer: {
    aboutLink: "كيف نعمل، ومن أين ننقل",
  },

  demoTag: "بيانات توضيحية",

  placeholder: {
    intro: "ابحث عن حديث، فترى أسانيده بنصّها من كتبها في شجرة واحدة: أين تلتقي، وأين تفترق.",
    building: "الموقع قيد البناء.",
  },
} as const;
