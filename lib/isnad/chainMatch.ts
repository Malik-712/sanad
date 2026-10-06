// Finds the route in data/ whose chain is exactly the linked chain of a pasted isnad.
// The pasted text names the narrators from the compiler's teacher up to the companion; the compiler
// may or may not be named, and the Prophet ﷺ is the end of every chain, so he is not compared.

export type MatchRoute = {
  hadithId: string;
  hadithTitle: string;
  routeId: string;
  chain: string[];
  /** Position of the route in its hadith, and how many routes the hadith has. */
  index: number;
  total: number;
  /** «صحيح البخاري، حديث ١» */
  label?: string;
};

export type ChainMatch = MatchRoute | null;

/** `ids` in text order (compiler's teacher first). Every id must be decided (high, or chosen by the user). */
export function matchChain(ids: (string | null)[], routes: MatchRoute[]): ChainMatch {
  if (!ids.length || ids.some((id) => !id)) return null;
  const upward = ids as string[];
  const same = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
  for (const r of routes) {
    const withoutProphet = r.chain.at(-1) === "prophet" ? r.chain.slice(0, -1) : r.chain;
    if (same(upward, withoutProphet.slice(1)) || same(upward, withoutProphet)) return r;
  }
  return null;
}
