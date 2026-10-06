import { describe, expect, it } from "vitest";
import { buildExplorerGraph, hadithKey, PROPHET } from "./graph";
import { createIndex, findHadiths } from "./match";

// Made-up chains, as in match.test.ts.
const names = [
  ["زيد بن خالد", "عمرو بن بكر", "سالم بن هلال", "نافع"],
  ["زيد بن خالد", "عمرو بن بكر", "سالم بن هلال"],
  ["حامد بن رشيد", "زيد بن خالد", "عمرو بن بكر", "سالم بن هلال", "نافع"],
];
const dict = [...new Set(names.flat())];
const h = names.map((l) => l.map((n) => dict.indexOf(n)));
const index = createIndex(dict, h);
const pasted = ["زيد بن خالد", "عمرو بن بكر", "سالم بن هلال"];
const hits = findHadiths(pasted, index);
const g = buildExplorerGraph(pasted, pasted, hits, index, (gid) => `حديث ${gid}`, "النبي ﷺ", (n, r) => `${n}، ${r}`, {
  prophet: "رأس الإسناد",
  narrator: "راوٍ",
  hadith: "حديث",
});

describe("buildExplorerGraph", () => {
  it("has the Prophet ﷺ, one leaf per hadith, and shares the pasted names", () => {
    expect(g.graph.nodes.has(PROPHET)).toBe(true);
    for (const x of hits) expect(g.graph.nodes.get(hadithKey(x.gid))?.role).toBe("compiler");
    // The three pasted names are single nodes carried by all three hadiths.
    for (const n of pasted) expect(g.graph.nodes.get(`n:${n}`)?.routeIds.length).toBe(3);
    expect(g.analysis.commonLink).not.toBeNull();
  });
  it("draws a name that is not in the pasted chain as its own node", () => {
    expect(g.graph.nodes.get("n:حامد بن رشيد")?.routeIds).toEqual([hadithKey(2)]);
  });
  it("lays out every node for both screen sizes", () => {
    for (const layout of [g.layouts.mobile, g.layouts.desktop]) {
      expect(layout.nodes.length).toBe(g.graph.nodes.size);
      expect(layout.width).toBeGreaterThan(0);
    }
  });
  it("names every node and every hadith path", () => {
    for (const id of g.graph.nodes.keys()) expect(g.labels[id]).toBeTruthy();
    expect(Object.keys(g.routeNodes).length).toBe(hits.length);
  });
});
