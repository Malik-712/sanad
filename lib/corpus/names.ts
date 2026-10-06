// Narrator-name forms used to match a pasted isnad with the corpus. Written once, used by the build script
// (scripts/build-corpus.ts) and by the browser (lib/explorer/match.ts), so both fold names the same way.

import { tokenize } from "@/lib/parser/tokenize";

/** A name as written → the folded form used in the corpus index: normalised words only, no punctuation. */
export function foldName(name: string): string {
  return tokenize(name)
    .map((t) => t.text)
    .filter((w) => /[ء-ي]/.test(w))
    .join(" ");
}

// Words that do not identify a person by themselves («بن»، «ابو»، «عبد» …).
const FILLER = new Set(["بن", "ابن", "بنت", "ابو", "ابي", "ابا", "ام", "عبد", "يعني", "هو", "وهو", "الله"]);

/** The words of a folded name that tell one person from another. */
export function distinctive(name: string): string[] {
  const words = name.split(" ").filter(Boolean);
  const kept = words.filter((w) => !FILLER.has(w) && w.length > 1);
  return kept.length ? kept : words;
}

export type NameMatch = 0 | 0.8 | 1;

/**
 * How well two folded names agree: 1 = the same name as written; 0.8 = one is a shorter form of the other
 * (all distinctive words of the shorter appear in the longer: «سفيان» ⊂ «سفيان بن عيينه»); 0 = different.
 * A shorter form can fit more than one person; callers say «بالاسم كما ورد», never «الراوي نفسه».
 */
export function nameMatch(a: string, b: string): NameMatch {
  if (a === b) return 1;
  const da = distinctive(a);
  const db = distinctive(b);
  const [short, long] = da.length <= db.length ? [da, db] : [db, da];
  if (short.length === 0) return 0;
  const set = new Set(long);
  return short.every((w) => set.has(w)) ? 0.8 : 0;
}
