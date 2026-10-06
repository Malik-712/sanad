import type { Token } from "./tokenize";
import type { Engine, ParseResult, WordSpan } from "./types";
import { PROPHET_SEQUENCES, isPunct, isSigha, isStrongSigha, isTahwil, matchSequence } from "./words";

// Turns word spans (from the rule parser or the model) into a ParseResult: names in the original spelling,
// the transmission word between each two names, tahwil branches, and whether the isnad reaches the Prophet ﷺ.
export function buildResult(text: string, tokens: Token[], spans: WordSpan[], engine: Engine, scores?: number[]): ParseResult {
  const words = tokens.map((t) => t.text);
  const names = spans.map(([s, e], i) => ({
    text: text.slice(tokens[s]!.start, tokens[e - 1]!.end),
    start: tokens[s]!.start,
    end: tokens[e - 1]!.end,
    ...(scores ? { score: scores[i] } : {}),
  }));

  // The transmission word shown for a stretch of words: a strong one if any, else the last one.
  const pickSigha = (between: Token[]): string => {
    const found = between.filter((t) => isSigha(t.text));
    const pick = [...found].reverse().find((t) => isStrongSigha(t.text)) ?? found.at(-1);
    return pick ? text.slice(pick.start, pick.end) : "";
  };

  const sighas: string[] = [];
  const tahwil: number[] = [];
  for (let i = 0; i + 1 < spans.length; i++) {
    const between = tokens.slice(spans[i]![1], spans[i + 1]![0]);
    if (between.some((t) => isTahwil(t.text))) tahwil.push(i + 1);
    sighas.push(pickSigha(between));
  }

  // The Prophet ﷺ after the last name (before any long run of matn words).
  const last = spans.at(-1)?.[1] ?? 0;
  let prophet = false;
  let prophetSigha = "";
  for (let i = last, seen = 0; i < words.length && seen < 6; i++) {
    if (matchSequence(words, i, PROPHET_SEQUENCES)) {
      prophet = true;
      prophetSigha = pickSigha(tokens.slice(last, i));
      break;
    }
    if (!isPunct(words[i]!) && !isSigha(words[i]!)) seen++;
  }

  const leadSigha = spans.length ? pickSigha(tokens.slice(0, spans[0]![0])) : "";
  return { engine, names, sighas, leadSigha, prophetSigha, tahwil, prophet, parallel: [] };
}
