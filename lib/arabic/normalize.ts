// Folds Arabic text for search: no diacritics or tatweel, one form for alef, ya, ta marbuta and hamza seats.
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const FOLDS: [RegExp, string][] = [
  [/[أإآٱ]/g, "ا"],
  [/ى/g, "ي"],
  [/ة/g, "ه"],
  [/ؤ/g, "و"],
  [/ئ/g, "ي"],
];

// Honorific signs: ﷺ (U+FDFA) and the honorific ligatures U+FD40–U+FD4F (﵁ ﵂ ﵄ …).
const HONORIFIC_SIGNS = /[﵀-﵏ﷺ]/g;
// Written-out honorifics, matched after folding (so ى→ي and no diacritics).
const HONORIFIC_PHRASES = /(?:^|\s)(?:صلي الله عليه وسلم|رضي الله عنهما|رضي الله عنها|رضي الله عنه)(?=\s|$)/g;

export function normalizeArabic(text: string, options: { stripHonorifics?: boolean } = {}): string {
  let out = text.normalize("NFC");
  if (options.stripHonorifics) out = out.replace(HONORIFIC_SIGNS, " ");
  out = out.replace(MARKS, "");
  for (const [from, to] of FOLDS) out = out.replace(from, to);
  out = out.replace(/\s+/g, " ").trim();
  if (options.stripHonorifics) out = out.replace(HONORIFIC_PHRASES, " ").replace(/\s+/g, " ").trim();
  return out;
}

/** Search form: folded, with honorifics removed (ﷺ, «صلى الله عليه وسلم», «رضي الله عنه/عنها/عنهما», ﵁). */
export function stripHonorifics(text: string): string {
  return normalizeArabic(text, { stripHonorifics: true });
}
