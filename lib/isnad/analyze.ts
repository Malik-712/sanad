// Facts computed from the graph. Counts shown in the UI come from here, never from typed text.
import type { GraphNode, IsnadGraph } from "./graph";

export type Analysis = {
  totalRoutes: number;
  /** The common link (madar): see commonLink(). */
  commonLink: string | null;
  /** Nodes with two or more distinct students. */
  branchPoints: string[];
  /** Other branch points shared by 2+ routes (drawn as branch points, not with the main ring). */
  partialCommonLinks: string[];
  /** Per generation from the Prophet ﷺ: how many narrators and how many routes pass through them. */
  generations: { depth: number; narrators: number; routes: number }[];
};

export function routeCount(node: GraphNode): number {
  return node.routeIds.length;
}

/**
 * The narrator shared by the most routes (at least 2), among companions and narrators:
 * not the Prophet ﷺ and not the compilers (owner decision, 6 Oct 2026).
 * On a tie, the one farthest from the Prophet ﷺ; then by id, so the result is stable.
 */
export function commonLink(graph: IsnadGraph): string | null {
  let best: GraphNode | null = null;
  for (const n of graph.nodes.values()) {
    if (n.role === "prophet" || n.role === "compiler" || routeCount(n) < 2) continue;
    if (
      !best ||
      routeCount(n) > routeCount(best) ||
      (routeCount(n) === routeCount(best) && (n.depth > best.depth || (n.depth === best.depth && n.id < best.id)))
    ) {
      best = n;
    }
  }
  return best?.id ?? null;
}

export function analyze(graph: IsnadGraph): Analysis {
  const nodes = [...graph.nodes.values()];
  const madar = commonLink(graph);
  const branchPoints = nodes.filter((n) => n.students.length >= 2).map((n) => n.id);
  const partialCommonLinks = branchPoints.filter((id) => {
    const n = graph.nodes.get(id) as GraphNode;
    return id !== madar && n.role !== "prophet" && routeCount(n) >= 2;
  });

  const byDepth = new Map<number, { narrators: number; routes: Set<string> }>();
  for (const n of nodes) {
    const g = byDepth.get(n.depth) ?? { narrators: 0, routes: new Set<string>() };
    g.narrators += 1;
    for (const r of n.routeIds) g.routes.add(r);
    byDepth.set(n.depth, g);
  }
  const generations = [...byDepth.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([depth, g]) => ({ depth, narrators: g.narrators, routes: g.routes.size }));

  return { totalRoutes: graph.routeIds.length, commonLink: madar, branchPoints, partialCommonLinks, generations };
}
