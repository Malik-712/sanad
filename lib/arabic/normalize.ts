// Folds Arabic text for search: no diacritics or tatweel, one form for alef, ya, ta marbuta and hamza seats.
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const FOLDS: [RegExp, string][] = [
  [/[أإآٱ]/g, "ا"],
  [/ى/g, "ي"],
  [/ة/g, "ه"],
  [/ؤ/g, "و"],
  [/ئ/g, "ي"],
];

export function normalizeArabic(text: string): string {
  let out = text.normalize("NFC").replace(MARKS, "");
  for (const [from, to] of FOLDS) out = out.replace(from, to);
  return out.replace(/\s+/g, " ").trim();
}
