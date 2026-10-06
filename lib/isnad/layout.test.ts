import { describe, expect, it } from "vitest";
import { getHadiths, getNarratorMap } from "@/lib/data/load";
import { analyze } from "./analyze";
import { buildGraph } from "./graph";
import { boxesOverlap, DESKTOP, layoutTree, MOBILE } from "./layout";

const narrators = getNarratorMap();

describe("layoutTree on data/", () => {
  for (const h of getHadiths()) {
    for (const [name, cfg] of [["mobile", MOBILE], ["desktop", DESKTOP]] as const) {
      it(`${h.id} (${name}): no two nodes overlap, the Prophet ﷺ is on top, compilers on the bottom row`, () => {
        const graph = buildGraph(h, narrators);
        const analysis = analyze(graph);
        const labels = new Map([...graph.nodes.keys()].map((id) => [id, narrators.get(id)?.nameAr ?? id]));
        const t = layoutTree(graph, analysis, labels, cfg);

        expect(t.nodes).toHaveLength(graph.nodes.size);
        for (let i = 0; i < t.nodes.length; i++) {
          for (let j = i + 1; j < t.nodes.length; j++) {
            const a = t.nodes[i]!;
            const b = t.nodes[j]!;
            expect(boxesOverlap(a.box, b.box), `${a.id} overlaps ${b.id}`).toBe(false);
          }
        }

        const prophet = t.nodes.find((n) => n.role === "prophet")!;
        expect(Math.min(...t.nodes.map((n) => n.y))).toBe(prophet.y);
        const compilerYs = new Set(t.nodes.filter((n) => n.role === "compiler").map((n) => n.box.top + n.box.height));
        expect(compilerYs.size).toBe(1);

        expect(t.edges).toHaveLength(graph.edges.length);
        expect(t.branches).toHaveLength(analysis.branchPoints.length);
        if (t.tag) {
          for (const n of t.nodes) expect(boxesOverlap({ left: t.tag.x, top: t.tag.y, width: t.tag.w, height: t.tag.h }, n.box) && n.id !== analysis.commonLink).toBe(false);
          expect(t.tag.x).toBeGreaterThanOrEqual(0);
        }
        for (const n of t.nodes) {
          expect(n.box.left).toBeGreaterThanOrEqual(0);
          expect(n.box.left + n.box.width).toBeLessThanOrEqual(t.width + 0.5);
        }
      });
    }
  }
});
