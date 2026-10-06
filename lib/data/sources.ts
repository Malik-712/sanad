// The scholarly sources Sanad uses, copied from docs/SOURCES.md §1 (names and editions as al-Maktaba al-Shamila
// records them; «غير مذكورة» where Shamela records none). Book data, so it is written here, not in lib/copy/ar.ts.
// What has been checked is never written here: /sources counts it from data/.
import type { Hadith, Narrator, Status } from "./types";

export type SourceBook = {
  id: string;
  nameAr: string;
  authorAr: string | null;
  editionAr: string | null;
  url: string | null;
  useAr: string;
};

/** Books whose text is shown in the app. */
export const TEXT_SOURCES: SourceBook[] = [
  {
    id: "bukhari",
    nameAr: "صحيح البخاري",
    authorAr: "البخاري",
    editionAr: "ط السلطانية",
    url: "https://shamela.ws/book/1681",
    useAr: "نص الإسناد، ورقمه، وجزؤه وصفحته، ومتن الحديث.",
  },
  {
    id: "muslim",
    nameAr: "صحيح مسلم",
    authorAr: "مسلم",
    editionAr: "ت عبد الباقي",
    url: "https://shamela.ws/book/1727",
    useAr: "نص الإسناد، ورقمه، وجزؤه وصفحته، ومتن الحديث.",
  },
  {
    id: "taqrib",
    nameAr: "تقريب التهذيب",
    authorAr: "ابن حجر العسقلاني",
    editionAr: null,
    url: "https://shamela.ws/book/8609",
    useAr: "عبارة ابن حجر في الراوي، ورقم الترجمة، والصفحة.",
  },
  {
    id: "ibn-al-salah",
    nameAr: "مقدمة ابن الصلاح",
    authorAr: "ابن الصلاح",
    editionAr: "ت عتر",
    url: "https://shamela.ws/book/22870",
    useAr: "عبارة «أخرجه مسلم في صحيحه» على أسانيد صحيح مسلم.",
  },
  {
    id: "dorar",
    nameAr: "الدرر السنية — الموسوعة الحديثية",
    authorAr: null,
    editionAr: null,
    url: "https://dorar.net",
    useAr: "الحكم القصير على الإسناد، مع قائله ورابطه.",
  },
];

/** Books cited only in route and narrator notes, to identify a narrator or settle a reading. */
export const NOTE_SOURCES: SourceBook[] = [
  { id: "fath", nameAr: "فتح الباري بشرح البخاري", authorAr: "ابن حجر العسقلاني", editionAr: "ط السلفية", url: "https://shamela.ws/book/1673", useAr: "" },
  { id: "nawawi", nameAr: "شرح النووي على مسلم", authorAr: "النووي", editionAr: null, url: "https://shamela.ws/book/1711", useAr: "" },
  { id: "tahdhib", nameAr: "تهذيب الكمال في أسماء الرجال", authorAr: "المزي", editionAr: "مؤسسة الرسالة - بيروت", url: "https://shamela.ws/book/3722", useAr: "" },
  { id: "tuhfa", nameAr: "تحفة الأشراف بمعرفة الأطراف", authorAr: "المزي", editionAr: "ت عبد الصمد شرف الدين", url: "https://shamela.ws/book/11385", useAr: "" },
  { id: "ansab", nameAr: "الأنساب", authorAr: "السمعاني", editionAr: "ط الهندية", url: "https://shamela.ws/book/12317", useAr: "" },
  { id: "sahih-jami", nameAr: "صحيح الجامع الصغير وزيادته", authorAr: "الألباني", editionAr: null, url: "https://shamela.ws/book/10757", useAr: "" },
  { id: "mustakhraj", nameAr: "مستخرج أبي نعيم", authorAr: "أبو نعيم", editionAr: null, url: null, useAr: "" },
  { id: "isaba", nameAr: "الإصابة في تمييز الصحابة", authorAr: "ابن حجر العسقلاني", editionAr: null, url: "https://shamela.ws/book/9767", useAr: "" },
];

export type SourceCount = { kind: "isnads" | "entries" | "quotes"; total: number; checked: number; status: Status };

const statusOf = (total: number, checked: number): Status => (total === 0 ? "none" : checked === total ? "ok" : "check");

/** What data/ holds from each text source, and how much of it the owner has checked. */
export function countSource(id: string, hadiths: Hadith[], narrators: Narrator[]): SourceCount | null {
  const routes = hadiths.flatMap((h) => h.routes);
  const verified = (r: { verification: { status: string } }) => r.verification.status === "verified";
  const make = (kind: SourceCount["kind"], items: { verification: { status: string } }[]): SourceCount => {
    const checked = items.filter(verified).length;
    return { kind, total: items.length, checked, status: statusOf(items.length, checked) };
  };
  switch (id) {
    case "bukhari":
      return make("isnads", routes.filter((r) => r.book.nameAr === "صحيح البخاري"));
    case "muslim":
      return make("isnads", routes.filter((r) => r.book.nameAr === "صحيح مسلم"));
    case "taqrib":
      return make("entries", narrators.filter((n) => n.taqrib));
    case "ibn-al-salah":
      return make("quotes", routes.filter((r) => r.inclusion));
    case "dorar":
      return make("quotes", routes.filter((r) => r.grade?.sourceUrl.includes("dorar.net")));
    default:
      return null;
  }
}

/** The name of the site a quote was read on, from its link («الدرر السنية»), or null if it is not one we know. */
export function siteName(url: string): string | null {
  if (url.includes("dorar.net")) return "الدرر السنية";
  if (url.includes("shamela.ws")) return "المكتبة الشاملة";
  return null;
}
