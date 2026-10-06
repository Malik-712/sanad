// Marks, in an isnad text as written (with its diacritics), the words of the names that were matched.
import { tokenize } from "@/lib/parser/tokenize";

export type Piece = { text: string; mark: boolean };

/** `matched`: folded names (as read from this isnad) that matched the pasted chain. */
export function highlight(text: string, matched: string[]): Piece[] {
  const toks = tokenize(text);
  const words = toks.map((t) => t.text);
  const marked = new Array<boolean>(toks.length).fill(false);
  for (const name of matched) {
    const seq = name.split(" ").filter(Boolean);
    if (!seq.length) continue;
    for (let i = 0; i + seq.length <= words.length; i++)
      if (seq.every((w, k) => words[i + k] === w)) {
        for (let k = 0; k < seq.length; k++) marked[i + k] = true;
        break;
      }
  }
  const out: Piece[] = [];
  let pos = 0;
  toks.forEach((t, i) => {
    if (t.start > pos) out.push({ text: text.slice(pos, t.start), mark: marked[i] === true && marked[i - 1] === true });
    out.push({ text: text.slice(t.start, t.end), mark: marked[i]! });
    pos = t.end;
  });
  if (pos < text.length) out.push({ text: text.slice(pos), mark: false });
  // Merge neighbours with the same mark.
  return out.reduce<Piece[]>((acc, p) => {
    const last = acc.at(-1);
    if (last && last.mark === p.mark) last.text += p.text;
    else acc.push({ ...p });
    return acc;
  }, []);
}
