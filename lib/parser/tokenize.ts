import { normalizeArabic } from "@/lib/arabic/normalize";

// Word splitting shared by the rule parser, the model (training and browser) and the evaluation.
// Python twin: ml/tokenize_words.py — both are checked against tests/fixtures/tokenize-cases.json.
// Rule: split on spaces; every punctuation mark is its own token; each token is normalised; empty tokens are dropped.
export const PUNCT = /([،,:؛;.!?؟"«»()[\]{}\-–—*'“”])/;

export type Token = { text: string; start: number; end: number };

export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  const re = /\S+/g;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    let pos = m.index;
    for (const piece of m[0].split(PUNCT)) {
      if (piece) {
        const norm = normalizeArabic(piece);
        if (norm) out.push({ text: norm, start: pos, end: pos + piece.length });
      }
      pos += piece.length;
    }
  }
  return out;
}
