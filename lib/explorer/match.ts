// Finds the hadiths of the corpus whose isnad has the same names, in the same order, as a pasted isnad.
// Deterministic and evidence-based: it only ever returns entries that exist in the corpus, with how well they match.
// The AI's part is upstream (the tagger reads the names in the pasted text and in every corpus isnad);
// this file aligns the two name lists and ranks the results.
import { distinctive, nameMatch } from "@/lib/corpus/names";

export type CorpusIndex = {
  /** Folded narrator names, each once. */
  dict: string[];
  /** For each hadith (global id), the ids of the names in its isnad, in text order. */
  h: number[][];
  /** Hadith ids (increasing) whose isnad has the word in one of its names. */
  post(word: string): number[];
};

/** Builds the index from per-hadith name lists, or from the shipped files (`raw` = delta-encoded postings). */
export function createIndex(dict: string[], h: number[][], raw?: Record<string, number[]>): CorpusIndex {
  const cache = new Map<string, number[]>();
  let built: Map<string, number[]> | null = null;
  const build = () => {
    const m = new Map<string, number[]>();
    h.forEach((ids, gid) => {
      for (const w of new Set(ids.flatMap((id) => distinctive(dict[id]!)))) (m.get(w) ?? m.set(w, []).get(w)!).push(gid);
    });
    return m;
  };
  return {
    dict,
    h,
    post(word) {
      const hit = cache.get(word);
      if (hit) return hit;
      let out: number[];
      if (raw) {
        const deltas = raw[word] ?? [];
        out = new Array<number>(deltas.length);
        let acc = 0;
        for (let i = 0; i < deltas.length; i++) out[i] = acc += deltas[i]!;
      } else out = (built ??= build()).get(word) ?? [];
      cache.set(word, out);
      return out;
    },
  };
}

export type MatchClass = "same" | "contains" | "close";

export type Pair = { pasted: number; hadith: number; quality: 0.8 | 1 };

export type Hit = {
  gid: number;
  cls: MatchClass;
  /** Pasted names found in this isnad (in order), and how many are not. */
  matched: number;
  missing: number;
  /** Names in the hadith's isnad that were not pasted. */
  extras: number;
  /** matched / pasted, weighted: a shorter form of a name counts 0.8. */
  coverage: number;
  pairs: Pair[];
};

const CLASS_ORDER: Record<MatchClass, number> = { same: 0, contains: 1, close: 2 };
const MAX_DF = 12000;
const MAX_CANDIDATES = 4000;

/** Order-preserving alignment of the pasted names with a hadith's names (weighted longest common subsequence). */
export function align(pasted: string[], names: string[]): { score: number; pairs: Pair[] } {
  const m = pasted.length;
  const k = names.length;
  const w: (0 | 0.8 | 1)[][] = pasted.map((p) => names.map((n) => nameMatch(p, n)));
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(k + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= k; j++) {
      const take = w[i - 1]![j - 1]! > 0 ? dp[i - 1]![j - 1]! + w[i - 1]![j - 1]! : 0;
      dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!, take);
    }
  const pairs: Pair[] = [];
  for (let i = m, j = k; i > 0 && j > 0; ) {
    const q = w[i - 1]![j - 1]!;
    if (q > 0 && dp[i]![j] === dp[i - 1]![j - 1]! + q) {
      pairs.push({ pasted: i - 1, hadith: j - 1, quality: q as 0.8 | 1 });
      i--;
      j--;
    } else if (dp[i - 1]![j]! >= dp[i]![j - 1]!) i--;
    else j--;
  }
  return { score: dp[m]![k]!, pairs: pairs.reverse() };
}

/** Hadiths whose isnad has the same names as `pasted` (folded names in text order), best match first. */
export function findHadiths(pasted: string[], index: CorpusIndex, limit = 500): Hit[] {
  const m = pasted.length;
  if (m === 0) return [];
  // 1. Candidates: each pasted name votes for the hadiths whose names contain its rarest words.
  const votes = new Map<number, Set<number>>();
  pasted.forEach((name, i) => {
    const words = distinctive(name)
      .map((word) => ({ word, ids: index.post(word) }))
      .sort((a, b) => a.ids.length - b.ids.length);
    const usable = words.filter((x) => x.ids.length <= MAX_DF);
    for (const { ids } of (usable.length ? usable : words).slice(0, 2))
      for (const gid of ids) (votes.get(gid) ?? votes.set(gid, new Set()).get(gid)!).add(i);
  });
  // A short chain must match fully; a longer one may miss some names.
  const need = m <= 2 ? m : Math.ceil(m * 0.6);
  const candidates = [...votes.entries()]
    .filter(([, s]) => s.size >= need)
    .sort((a, b) => b[1].size - a[1].size || a[0] - b[0])
    .slice(0, MAX_CANDIDATES);
  // 2. Alignment of each candidate with the pasted chain, in order.
  const hits: Hit[] = [];
  for (const [gid] of candidates) {
    const names = index.h[gid]!.map((id) => index.dict[id]!);
    const { score, pairs } = align(pasted, names);
    const matched = pairs.length;
    if (matched < need) continue;
    const missing = m - matched;
    const extras = names.length - matched;
    const cls: MatchClass = missing === 0 ? (extras === 0 ? "same" : "contains") : "close";
    hits.push({ gid, cls, matched, missing, extras, coverage: Math.round((score / m) * 1000) / 1000, pairs });
  }
  hits.sort(
    (a, b) =>
      CLASS_ORDER[a.cls] - CLASS_ORDER[b.cls] || b.coverage - a.coverage || a.extras - b.extras || a.gid - b.gid,
  );
  return hits.slice(0, limit);
}
