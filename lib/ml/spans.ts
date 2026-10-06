import type { WordSpan } from "@/lib/parser/types";
import { PROPHET_SEQUENCES, matchSequence } from "@/lib/parser/words";
import type { Label } from "./tagger";

const MAX_NAME_WORDS = 10;

/**
 * Names from the tagger's word labels: B-NAR starts a name, I-NAR continues it. Names after the Prophet ﷺ is
 * mentioned belong to the matn, not the isnad, and are dropped (the same cut as ml/index_corpus.py).
 */
export function spansFromLabels(words: string[], labels: Label[]): WordSpan[] {
  let end = words.length;
  for (let i = 0; i < words.length; i++)
    if (matchSequence(words, i, PROPHET_SEQUENCES) || words[i] === "نبي") {
      end = i;
      break;
    }
  const spans: WordSpan[] = [];
  let start = -1;
  const close = (at: number) => {
    if (start >= 0 && at - start <= MAX_NAME_WORDS) spans.push([start, at]);
    start = -1;
  };
  for (let i = 0; i < end; i++) {
    const l = labels[i];
    if (l === "B-NAR") {
      close(i);
      start = i;
    } else if (l === "I-NAR" && start < 0) start = i;
    else if (l === "O") close(i);
  }
  close(end);
  return spans;
}
