import { ar } from "@/lib/copy/ar";

// Arabic counts for the masculine nouns Sanad counts (isnad, compiler, name), 1–20.
// "nom" = nominative (subject, labels); "gen" = after a preposition («عند», «من»).
export type CountedNoun = keyof typeof ar.nouns;
export type Case = "nom" | "gen";

const N = ar.numbers;

function assertRange(n: number): void {
  if (!Number.isInteger(n) || n < 1 || n > 20) throw new RangeError(`count out of range: ${n}`);
}

/** The number word as used with a masculine noun: 8 → «ثمانية», 16 → «ستة عشر». Not for 1 or 2. */
export function numberWord(n: number, grammaticalCase: Case = "nom"): string {
  assertRange(n);
  if (n <= 2) throw new RangeError("1 and 2 are expressed by the noun itself");
  if (n <= 10) return N.units[n] as string;
  if (n === 11) return N.elevenTens;
  if (n === 12) return grammaticalCase === "gen" ? N.twelveGen : N.twelveNom;
  if (n < 20) return `${N.units[n - 10] as string} ${N.teen}`;
  return grammaticalCase === "gen" ? N.twentyGen : N.twentyNom;
}

/** «إسناد واحد», «إسنادان», «ثمانية أسانيد», «ستة عشر إسنادًا». */
export function countNoun(n: number, noun: CountedNoun, grammaticalCase: Case = "nom"): string {
  assertRange(n);
  const w = ar.nouns[noun];
  if (n === 1) return `${w.one} ${N.one}`;
  if (n === 2) return grammaticalCase === "gen" ? w.dualGen : w.dualNom;
  if (n <= 10) return `${numberWord(n, grammaticalCase)} ${w.plural}`;
  return `${numberWord(n, grammaticalCase)} ${w.acc}`;
}

/** «الإسناد», «الإسنادان», «الأسانيد الثمانية», «الأسانيد الستة عشر». Nominative. */
export function countDefinite(n: number, noun: CountedNoun): string {
  assertRange(n);
  const w = ar.nouns[noun];
  if (n === 1) return w.definiteOne;
  if (n === 2) return `${N.definitePrefix}${w.dualNom}`;
  const word = numberWord(n);
  // Only the first word of a compound number takes the article: «الستة عشر».
  const [first, ...rest] = word.split(" ");
  return [w.definite, `${N.definitePrefix}${first}`, ...rest].join(" ");
}
