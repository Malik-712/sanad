// The shared-chain graph: the chains of the matched hadiths merged into one drawing, from the Prophet ﷺ at the top
// to one node per hadith at the bottom. Built from the corpus names as written: two names are drawn as one node only
// if they are the same folded name, or an aligned pair with a pasted name (so the pasted chain is the spine).
import { analyze, type Analysis } from "@/lib/isnad/analyze";
import { buildGraphFromChains, type IsnadGraph } from "@/lib/isnad/graph";
import { DESKTOP, layoutTree, MOBILE, type TreeLayout } from "@/lib/isnad/layout";
import type { CorpusIndex, Hit } from "./match";

export const PROPHET = "prophet";
export const hadithKey = (gid: number) => `h:${gid}`;
const nameKey = (folded: string) => `n:${folded}`;

export type ExplorerGraph = {
  graph: IsnadGraph;
  analysis: Analysis;
  labels: Record<string, string>;
  arias: Record<string, string>;
  routeNodes: Record<string, string[]>;
  layouts: { mobile: TreeLayout; desktop: TreeLayout };
  /** The hadiths drawn (the best matches); the list shows all of them. */
  drawn: number[];
};

export const MAX_DRAWN = 12;

/**
 * `pasted`: the pasted names, folded, in text order; `display`: the same names as written (shown on the spine).
 * `label(gid)`: the text of a hadith node, e.g. «البخاري ١».
 */
export function buildExplorerGraph(
  pasted: string[],
  display: string[],
  hits: Hit[],
  index: CorpusIndex,
  label: (gid: number) => string,
  labelProphet: string,
  ariaOf: (name: string, role: string) => string,
  roleWords: { prophet: string; narrator: string; hadith: string },
): ExplorerGraph {
  const chosen = hits.slice(0, MAX_DRAWN);
  const labels: Record<string, string> = { [PROPHET]: labelProphet };
  const roles = new Map<string, "prophet" | "narrator" | "compiler">([[PROPHET, "prophet"]]);
  const routes = chosen.map((hit) => {
    const key = hadithKey(hit.gid);
    labels[key] = label(hit.gid);
    roles.set(key, "compiler");
    const names = index.h[hit.gid]!.map((id) => index.dict[id]!);
    const spine = new Map(hit.pairs.map((p) => [p.hadith, p.pasted]));
    const ids: string[] = [];
    names.forEach((nm, i) => {
      const at = spine.get(i);
      const id = at !== undefined ? nameKey(pasted[at]!) : nameKey(nm);
      labels[id] ??= at !== undefined ? (display[at] ?? pasted[at]!) : nm;
      roles.set(id, "narrator");
      if (ids.at(-1) !== id) ids.push(id);
    });
    // The chain runs from the compiler up to the Prophet ﷺ; corpus names are in text order (compiler's teacher first).
    return { id: key, chain: [key, ...ids, PROPHET] };
  });
  const graph = buildGraphFromChains(routes, (id) => ({ role: roles.get(id) ?? "narrator", missing: true }));
  const analysis = analyze(graph);
  const lm = new Map(Object.entries(labels));
  const arias: Record<string, string> = {};
  for (const id of graph.nodes.keys()) {
    const role = id === PROPHET ? roleWords.prophet : id.startsWith("h:") ? roleWords.hadith : roleWords.narrator;
    arias[id] = ariaOf(labels[id] ?? id, role);
  }
  return {
    graph,
    analysis,
    labels,
    arias,
    routeNodes: Object.fromEntries(routes.map((r) => [r.id, r.chain])),
    layouts: { mobile: layoutTree(graph, analysis, lm, MOBILE), desktop: layoutTree(graph, analysis, lm, DESKTOP) },
    drawn: chosen.map((h) => h.gid),
  };
}
