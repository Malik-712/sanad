// What the rule parser and the model both return for a pasted isnad (docs/PHASE5_AI_LAYER.md §2.3).
export type Engine = "model" | "rules";

export type FoundName = {
  /** The name as written in the pasted text (original spelling and diacritics). */
  text: string;
  /** Character offsets in the pasted text. */
  start: number;
  end: number;
  /** Model confidence (mean of the word probabilities), absent for the rule parser. */
  score?: number;
};

export type ParseResult = {
  engine: Engine;
  /** Names in the order they appear: from the compiler's teacher up towards the Prophet ﷺ. */
  names: FoundName[];
  /** sighas[i] is the transmission word between names[i] and names[i+1] ("" if none was found). */
  sighas: string[];
  /** The transmission word before the first name («حدثنا»), and the one before the Prophet ﷺ («سمعت»), "" if none. */
  leadSigha: string;
  prophetSigha: string;
  /** Indices into names where a new branch starts after «ح» (tahwil). */
  tahwil: number[];
  /** The isnad reaches the Prophet ﷺ («رسول الله»، «النبي»). */
  prophet: boolean;
  /** Indices into names that stand beside the previous name («فلان وابن فلان»): either may be the link. */
  parallel: number[];
};

/** A name as a span of word indices [start, end) into tokenize(text). */
export type WordSpan = [number, number];
