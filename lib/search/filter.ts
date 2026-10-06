// Client-side search for the Home list: the server builds one folded string and a list of hadith numbers
// per hadith; the client keeps the hadiths that match every word of the query.
// Folding (lib/arabic/normalize.ts): no diacritics or tatweel, أ/إ/آ/ٱ → ا, ى → ي, ة → ه, ؤ → و, ئ → ي, no honorifics.
import { stripHonorifics } from "@/lib/arabic/normalize";
import type { Hadith, Narrator } from "@/lib/data/types";

/** `refs`: each hadith number with the (folded) book it belongs to, so «البخاري ١» does not match Muslim's ١. */
export type SearchEntry = { id: string; text: string; refs: { book: string; n: string }[] };

const ARABIC_INDIC = /[٠-٩۰-۹]/g;

/** Arabic-Indic (and Persian) digits → 0–9. */
export function latinDigits(s: string): string {
  return s.replace(ARABIC_INDIC, (d) => String((d.charCodeAt(0) - 0x0660) % 0x90));
}

/** Every number in a printed hadith number: «٩٥ - (٥٥)» → ["95", "55"]. */
function numbersIn(s: string): string[] {
  return latinDigits(s).match(/\d+/g) ?? [];
}

// Words that only say what the number is («البخاري حديث ١»، «رقم ٨»): ignored in a query.
const NUMBER_WORDS = new Set(["حديث", "الحديث", "رقم", "ح"]);

export function buildSearchEntry(h: Hadith, narrators: Map<string, Narrator>): SearchEntry {
  const words = new Set<string>([h.titleAr, h.matnAr]);
  const refs = new Map<string, { book: string; n: string }>();
  const addRef = (book: string, n: string) => refs.set(`${book}|${n}`, { book, n: String(Number(n)) });
  for (const n of numbersIn(h.matnSource.number)) addRef(stripHonorifics(h.matnSource.book), n);
  for (const route of h.routes) {
    words.add(route.book.nameAr);
    words.add(route.book.authorAr);
    const book = stripHonorifics(`${route.book.nameAr} ${route.book.authorAr}`);
    for (const n of numbersIn(route.number)) addRef(book, n);
    for (const id of route.chain) {
      const n = narrators.get(id);
      if (!n) continue;
      words.add(n.nameAr);
      words.add(n.fullNameAr);
      for (const alias of n.aliasesAr) words.add(alias);
    }
  }
  return { id: h.id, text: stripHonorifics([...words].join(" ")), refs: [...refs.values()] };
}

export function filterEntries(entries: SearchEntry[], query: string): string[] {
  const words = stripHonorifics(latinDigits(query))
    .split(" ")
    .filter((w) => w && !NUMBER_WORDS.has(w));
  if (words.length === 0) return entries.map((e) => e.id);
  const isNumber = (w: string) => /^\d+$/.test(w);
  return entries
    .filter((e) => {
      if (!words.every((w) => isNumber(w) || e.text.includes(w))) return false;
      // A number must be a hadith number of this hadith, in the book the query names (if it names one).
      const bookWords = words.filter((w) => !isNumber(w) && e.refs.some((r) => r.book.includes(w)));
      return words
        .filter(isNumber)
        .every((w) => e.refs.some((r) => r.n === String(Number(w)) && bookWords.every((b) => r.book.includes(b))));
    })
    .map((e) => e.id);
}
