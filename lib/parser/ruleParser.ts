import { buildResult } from "./result";
import { tokenize } from "./tokenize";
import type { ParseResult, WordSpan } from "./types";
import {
  HONORIFIC_SEQUENCES,
  HONORIFIC_SIGN,
  MAX_NAME_WORDS,
  PROPHET_SEQUENCES,
  isPunct,
  isSigha,
  isStrongSigha,
  isTahwil,
  matchSequence,
} from "./words";

// Rule-based isnad reader: the baseline the model is measured against, and the fallback in the browser.
// The text is cut into runs of words between transmission words («حدثنا»، «عن»، «قال» …), punctuation,
// «ح» and honorifics. A run is a name; the reading stops at the Prophet ﷺ or at a run too long to be a name.

/** Word spans [start, end) of the names in an already tokenised isnad. */
export function ruleSpans(words: string[]): WordSpan[] {
  const spans: WordSpan[] = [];
  let start = -1;
  let sawSigha = false;

  const close = (end: number): boolean => {
    if (start < 0) return true;
    const len = end - start;
    const s = start;
    start = -1;
    // Words before the first transmission word are kept only if short (the text may start with a name).
    if (!sawSigha && spans.length === 0 && len > 3) return true;
    if (len > MAX_NAME_WORDS) return false; // the matn has begun
    spans.push([s, end]);
    return true;
  };

  // After «قال :» the speaker's words follow, unless a transmission word («حدثنا»، «عن» …) comes first.
  let speech = false;

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
    if (isSigha(w) || isTahwil(w) || isPunct(w) || HONORIFIC_SIGN.test(w)) {
      if (!close(i)) break;
      if (w === ":") speech = true;
      else if (isSigha(w)) {
        sawSigha = true;
        if (isStrongSigha(w) || w === "عن" || w === "ان") speech = false;
      }
      continue;
    }
    if (start < 0) {
      if (speech) break;
      start = i;
    }
  }
  if (start >= 0) close(words.length);
  return spans;
}

export function parseRules(text: string): ParseResult {
  const tokens = tokenize(text);
  return buildResult(
    text,
    tokens,
    ruleSpans(tokens.map((t) => t.text)),
    "rules",
  );
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
