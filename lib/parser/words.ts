// Word lists for reading an isnad, in normalised form (see lib/arabic/normalize.ts).

/** Transmission words (sighas). A leading «و» or «ف» is also accepted («وحدثنا»، «فقال»). */
export const SIGHAS = new Set([
  "حدثنا",
  "حدثني",
  "حدثناه",
  "حدثنيه",
  "حدثه",
  "حدثها",
  "حدثهم",
  "اخبرنا",
  "اخبرني",
  "اخبرناه",
  "اخبرنيه",
  "اخبره",
  "اخبرها",
  "اخبرهم",
  "اخبرتني",
  "اخبرتنا",
  "حدثتني",
  "حدثتنا",
  "انبانا",
  "انباني",
  "سمعته",
  "سمعتها",
  "سالت",
  "ثنا",
  "نا",
  "انا",
  "سمعت",
  "سمعنا",
  "سمع",
  "سمعه",
  "عن",
  "ان",
  "قال",
  "قالت",
  "قالا",
  "قالوا",
  "يقول",
  "تقول",
  "يقولان",
  "انه",
  "انها",
  "انهما",
  "انهم",
  "ثم",
  "قلت",
]);

/** Separator words that are not transmission words in themselves («انه سمع»، «ثم»). */
const WEAK = ["قال", "قالت", "قالا", "قالوا", "يقول", "تقول", "يقولان", "ان", "انه", "انها", "انهما", "انهم", "ثم", "قلت"];

/** Transmission words that say how the hadith was received (preferred over «قال» when showing a sigha). */
export const STRONG_SIGHAS = new Set([...SIGHAS].filter((w) => !WEAK.includes(w)));

/** «يحدّث فلانًا»: the next name is the listener, not the next link of the chain. */
export const LISTENER_VERBS = new Set(["يحدث", "يخبر"]);

/** A name that starts with one of these after «و» is a second name beside the previous one («محمد بن المثنى وابن بشار»). */
export const PARALLEL_STARTS = new Set(["وابن", "وابو", "وابي", "وابا"]);

/** An explanation of the previous name («يعني ابن علية»، «وهو ابن القاسم»). */
export function isApposition(words: string[], i: number): boolean {
  const w = words[i];
  const next = words[i + 1];
  return w === "يعني" || ((w === "وهو" || w === "هو") && (next === "ابن" || next === "بن"));
}

/** Words that are never a name by themselves. */
export const PRONOUNS = new Set(["هو", "وهو", "هي", "وهي"]);

/** «ح»: tahwil, the isnad starts a new branch. */
export const TAHWIL = "ح";

/** Honorific words dropped from a name («رضي الله عنه»، «صلي الله عليه وسلم»، «عليه السلام»). */
export const HONORIFIC_SEQUENCES: string[][] = [
  ["رضي", "الله", "عنه"],
  ["رضي", "الله", "عنها"],
  ["رضي", "الله", "عنهما"],
  ["رضي", "الله", "عنهم"],
  ["صلي", "الله", "عليه", "وسلم"],
  ["عليه", "السلام"],
  ["رحمه", "الله"],
];
export const HONORIFIC_SIGN = /^[﵀-﵏ﷺ]+$/;

/** Words that name the Prophet ﷺ: the isnad ends there and the matn begins. */
export const PROPHET_SEQUENCES: string[][] = [["رسول", "الله"], ["النبي"], ["نبي", "الله"]];

/** Longest run of words still read as one name; longer runs are taken as the start of the matn. */
export const MAX_NAME_WORDS = 8;

export function stripPrefix(word: string): string {
  return word.length > 2 && (word.startsWith("و") || word.startsWith("ف")) ? word.slice(1) : word;
}

export function isSigha(word: string): boolean {
  return SIGHAS.has(word) || SIGHAS.has(stripPrefix(word));
}

export function isStrongSigha(word: string): boolean {
  return STRONG_SIGHAS.has(word) || STRONG_SIGHAS.has(stripPrefix(word));
}

export function isTahwil(word: string): boolean {
  return word === TAHWIL || word === "وح";
}

export function isPunct(word: string): boolean {
  return !/[ء-ي٠-٩A-Za-z0-9]/.test(word);
}

/** Length of the sequence from `seqs` that starts at words[i], or 0. */
export function matchSequence(words: string[], i: number, seqs: string[][]): number {
  for (const seq of seqs) {
    if (seq.every((w, k) => words[i + k] === w || (k === 0 && stripPrefix(words[i] ?? "") === w))) return seq.length;
  }
  return 0;
}
