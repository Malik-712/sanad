// Merges all isnads of one hadith into one graph: one node per narrator, one edge per teacher → student pair.
// A chain runs from the compiler up to the Prophet ﷺ; sighas[i] is the word chain[i] uses for chain[i+1].
import type { Hadith, Narrator, Role } from "@/lib/data/types";

export type GraphNode = {
  id: string;
  role: Role;
  /** Missing from narrators.json (the validator reports it; the graph still draws it). */
  missing: boolean;
  /** Generations from the Prophet ﷺ (longest path, because a narrator can have two teachers). */
  depth: number;
  routeIds: string[];
  teachers: string[];
  students: string[];
};

export type GraphEdge = {
  id: string;
  /** Teacher: closer to the Prophet ﷺ. */
  from: string;
  /** Student: closer to the compiler. */
  to: string;
  routeIds: string[];
  sighas: string[];
};

export type IsnadGraph = {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  routeIds: string[];
};

export function buildGraph(hadith: Hadith, narrators: Map<string, Narrator>): IsnadGraph {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();

  const node = (id: string): GraphNode => {
    let n = nodes.get(id);
    if (!n) {
      const record = narrators.get(id);
      n = { id, role: record?.role ?? "narrator", missing: !record, depth: 0, routeIds: [], teachers: [], students: [] };
      nodes.set(id, n);
    }
    return n;
  };

  for (const route of hadith.routes) {
    const top = [...route.chain].reverse(); // Prophet ﷺ first
    top.forEach((id, i) => {
      const n = node(id);
      if (!n.routeIds.includes(route.id)) n.routeIds.push(route.id);
      n.depth = Math.max(n.depth, i);
    });
    for (let i = 0; i < route.chain.length - 1; i++) {
      const student = route.chain[i] as string;
      const teacher = route.chain[i + 1] as string;
      const key = `${teacher}>${student}`;
      let e = edges.get(key);
      if (!e) {
        e = { id: key, from: teacher, to: student, routeIds: [], sighas: [] };
        edges.set(key, e);
        node(teacher).students.push(student);
        node(student).teachers.push(teacher);
      }
      e.routeIds.push(route.id);
      const sigha = route.sighas?.[i];
      if (sigha && !e.sighas.includes(sigha)) e.sighas.push(sigha);
    }
  }

  // Longest path from the Prophet ﷺ: a student is always deeper than each of his teachers.
  // Bounded by the node count, so a malformed cycle cannot loop forever.
  for (let pass = 0; pass < nodes.size; pass++) {
    let changed = false;
    for (const e of edges.values()) {
      const from = nodes.get(e.from) as GraphNode;
      const to = nodes.get(e.to) as GraphNode;
      if (to.depth < from.depth + 1) {
        to.depth = from.depth + 1;
        changed = true;
      }
    }
    if (!changed) break;
  }

  return { nodes, edges: [...edges.values()], routeIds: hadith.routes.map((r) => r.id) };
}
