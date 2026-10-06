// The seven books of the external corpus (fawazahmed0/hadith-api, Arabic editions `ara-<id>`), in the fixed order
// used for the global hadith ids. Arabic names are the books' usual titles; counts come from corpus/MANIFEST.json.
export const CORPUS_PIN = "df57907be35291c91ad6a6691180e22ca9920784";
export const CORPUS_REPO = "https://github.com/fawazahmed0/hadith-api";

export type CorpusBook = { id: string; nameAr: string; shortAr: string };

export const CORPUS_BOOKS: CorpusBook[] = [
  { id: "bukhari", nameAr: "صحيح البخاري", shortAr: "البخاري" },
  { id: "muslim", nameAr: "صحيح مسلم", shortAr: "مسلم" },
  { id: "abudawud", nameAr: "سنن أبي داود", shortAr: "أبو داود" },
  { id: "tirmidhi", nameAr: "جامع الترمذي", shortAr: "الترمذي" },
  { id: "nasai", nameAr: "سنن النسائي", shortAr: "النسائي" },
  { id: "ibnmajah", nameAr: "سنن ابن ماجه", shortAr: "ابن ماجه" },
  { id: "malik", nameAr: "موطأ مالك", shortAr: "الموطأ" },
];

export const bookById = (id: string): CorpusBook | undefined => CORPUS_BOOKS.find((b) => b.id === id);

/** The exact source file of a book at the pinned commit (what every result links to). */
export function sourceFileUrl(bookId: string): string {
  return `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@${CORPUS_PIN}/editions/ara-${bookId}.min.json`;
}
