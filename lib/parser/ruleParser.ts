import { buildResult } from "./result";
import { tokenize } from "./tokenize";
import type { ParseResult, WordSpan } from "./types";
import {
  HONORIFIC_SEQUENCES,
  HONORIFIC_SIGN,
  LISTENER_VERBS,
  MAX_NAME_WORDS,
  PARALLEL_STARTS,
  PRONOUNS,
  PROPHET_SEQUENCES,
  isApposition,
  isPunct,
  isSigha,
  isStrongSigha,
  isTahwil,
  matchSequence,
} from "./words";

// Rule-based isnad reader: the baseline the model is measured against, and the reader the live site runs.
// The text is cut into runs of words between transmission words («حدثنا»، «عن»، «قال» …), punctuation,
// «ح» and honorifics. A run is a name; the reading stops at the Prophet ﷺ or at a run too long to be a name.

const SPEAKER = new Set(["قال", "قالت", "وقال", "فقال", "وقالت", "فقالت"]);
const MAX_APPOSITION_WORDS = 14;

export type RuleReading = {
  spans: WordSpan[];
  /** Indices of names that stand beside the previous one («فلان وابن فلان»): either may be the link. */
  parallel: number[];
};

/** Names in an already tokenised isnad, as word spans [start, end). */
export function ruleRead(words: string[]): RuleReading {
  const spans: WordSpan[] = [];
  const parallel: number[] = [];
  let start = -1;
  let sawSigha = false;
  // A name follows a transmission word, «ح», or the start of the text. Words after a name and its
  // honorific with no transmission word between («عمر ﵁ على المنبر») describe it and are not a name.
  let introduced = true;
  let runIntroduced = true;
  let runParallel = false;
  // After «قال :» the speaker's words follow, unless a transmission word or «قال» comes first.
  let speech = false;

  const close = (end: number): boolean => {
    if (start < 0) return true;
    const s = start;
    const len = end - s;
    start = -1;
    introduced = false;
    if (isApposition(words, s) && spans.length) {
      // «إسماعيل، يعني ابن علية»، «روح (وهو ابن القاسم)»: part of the previous name.
      if (len > MAX_APPOSITION_WORDS) return false;
      spans[spans.length - 1]![1] = words[end] === ")" ? end + 1 : end;
      return true;
    }
    if (words.slice(s, end).every((w) => PRONOUNS.has(w))) return true;
    if (!runIntroduced) return len <= MAX_NAME_WORDS;
    // Words before the first transmission word are kept only if short (the text may start with a name).
    if (!sawSigha && spans.length === 0 && len > 3) return true;
    if (len > MAX_NAME_WORDS) return false; // the matn has begun
    if (runParallel && spans.length) parallel.push(spans.length);
    spans.push([s, end]);
    return true;
  };

  for (let i = 0; i < words.length; i++) {
    const w = words[i]!;
    // The Prophet ﷺ ends the isnad; words just before him («نهى»، «سمعت») are not a name.
    if (matchSequence(words, i, PROPHET_SEQUENCES)) break;
    const honor = matchSequence(words, i, HONORIFIC_SEQUENCES);
    if (honor) {
      if (!close(i)) break;
      i += honor - 1;
      continue;
    }
    if (LISTENER_VERBS.has(w)) {
      // «سمعت فلانًا يحدّث فلانًا»: the next run is the listener.
      if (!close(i)) break;
      continue;
    }
    if (isSigha(w) || isTahwil(w) || isPunct(w) || HONORIFIC_SIGN.test(w)) {
      if (!close(i)) break;
      if (w === ":") speech = true;
      else if (isSigha(w) || isTahwil(w)) {
        sawSigha = true;
        introduced = true;
        if (isStrongSigha(w) || w === "عن" || w === "ان" || SPEAKER.has(w)) speech = false;
      }
      continue;
    }
    if (start >= 0 && PARALLEL_STARTS.has(w) && i > start) {
      // «محمد بن المثنى وابن بشار»: a second name beside the first.
      if (!close(i)) break;
      start = i;
      runIntroduced = true;
      runParallel = true;
      continue;
    }
    if (start < 0) {
      if (speech && !isApposition(words, i)) break;
      start = i;
      runIntroduced = introduced || isApposition(words, i);
      runParallel = false;
    }
  }
  if (start >= 0) close(words.length);
  return { spans, parallel };
}

/** Word spans of the names (used by the evaluation). */
export function ruleSpans(words: string[]): WordSpan[] {
  return ruleRead(words).spans;
}

export function parseRules(text: string): ParseResult {
  const tokens = tokenize(text);
  const { spans, parallel } = ruleRead(tokens.map((t) => t.text));
  return { ...buildResult(text, tokens, spans, "rules"), parallel };
}

/** BIO labels on the given words (for the evaluation against test.jsonl). */
export function ruleLabels(words: string[]): ("B-NAR" | "I-NAR" | "O")[] {
  const labels: ("B-NAR" | "I-NAR" | "O")[] = words.map(() => "O");
  for (const [s, e] of ruleSpans(words)) {
    labels[s] = "B-NAR";
    for (let i = s + 1; i < e; i++) labels[i] = "I-NAR";
  }
  return labels;
}
