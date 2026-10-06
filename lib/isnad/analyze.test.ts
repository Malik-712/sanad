import { describe, expect, it } from "vitest";
import { getHadiths, getNarratorMap } from "@/lib/data/load";
import type { Hadith, Narrator, Role } from "@/lib/data/types";
import { analyze, commonLink } from "./analyze";
import { buildGraph } from "./graph";

// Made-up fixtures. Chains run from the compiler up to the Prophet ("p").
function narrators(ids: Record<string, Role>): Map<string, Narrator> {
  return new Map(
    Object.entries(ids).map(([id, role]) => [
      id,
      { id, nameAr: id, fullNameAr: id, aliasesAr: [], role, verification: { status: "unverified" } } as Narrator,
    ]),
  );
}

function hadith(chains: string[][]): Hadith {
  return {
    id: "fixture",
    titleAr: "t",
    matnAr: "m",
    matnSource: { url: "https://example.org", book: "b", number: "1" },
    routes: chains.map((chain, i) => ({
      id: `r${i + 1}`,
      book: { nameAr: "b", authorAr: "a", edition: "e" },
      number: String(i + 1),
      url: "https://example.org",
      retrieved: "2026-10-05",
      method: "manual",
      isnadAr: "x",
      chain,
      sighas: chain.slice(1).map(() => "عن"),
      grade: null,
      verification: { status: "unverified" },
    })),
  };
}

const roles: Record<string, Role> = {
  p: "prophet",
  s1: "companion",
  s2: "companion",
  c1: "compiler",
  c2: "compiler",
  c3: "compiler",
};
const nar = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, "narrator" as Role]));

describe("buildGraph", () => {
  it("merges nodes across routes and keeps teacher → student edges with their sighas", () => {
    const g = buildGraph(hadith([["c1", "n1", "s1", "p"], ["c2", "n2", "s1", "p"]]), narrators({ ...roles, ...nar("n1", "n2") }));
    expect(g.nodes.get("s1")?.routeIds).toEqual(["r1", "r2"]);
    expect(g.nodes.get("s1")?.students).toEqual(["n1", "n2"]);
    expect(g.edges.find((e) => e.id === "p>s1")?.routeIds).toEqual(["r1", "r2"]);
    expect(g.nodes.get("p")?.depth).toBe(0);
    expect(g.nodes.get("c1")?.depth).toBe(3);
  });

  it("handles a narrator with two teachers in two routes (DAG) without crashing", () => {
    const g = buildGraph(hadith([["c1", "n", "t1", "s1", "p"], ["c1", "n", "t2", "t3", "s1", "p"]]), narrators({ ...roles, ...nar("n", "t1", "t2", "t3") }));
    expect(g.nodes.get("n")?.teachers.sort()).toEqual(["t1", "t2"]);
    expect(g.nodes.get("n")?.depth).toBe(4); // longest path: p > s1 > t3 > t2 > n
    expect(g.nodes.get("c1")?.depth).toBe(5);
  });

  it("marks an id missing from narrators.json", () => {
    const g = buildGraph(hadith([["c1", "ghost", "s1", "p"]]), narrators(roles));
    expect(g.nodes.get("ghost")?.missing).toBe(true);
  });
});

describe("analyze", () => {
  it("single route: no branch point, no common link", () => {
    const a = analyze(buildGraph(hadith([["c1", "n1", "s1", "p"]]), narrators({ ...roles, ...nar("n1") })));
    expect(a.branchPoints).toEqual([]);
    expect(a.commonLink).toBeNull();
    expect(a.totalRoutes).toBe(1);
  });

  it("one chain that splits at depth 4: the split node is the common link", () => {
    const g = buildGraph(
      hadith([
        ["c1", "a1", "x4", "x3", "x2", "s1", "p"],
        ["c2", "b1", "x4", "x3", "x2", "s1", "p"],
      ]),
      narrators({ ...roles, ...nar("a1", "b1", "x2", "x3", "x4") }),
    );
    const a = analyze(g);
    expect(g.nodes.get("x4")?.depth).toBe(4);
    expect(a.commonLink).toBe("x4");
    expect(a.branchPoints).toEqual(["x4"]);
  });

  it("two companions with 3 and 2 routes: common link in the 3-route branch, the other branch point is partial", () => {
    const a = analyze(
      buildGraph(
        hadith([
          ["c1", "a1", "na", "s1", "p"],
          ["c2", "a2", "na", "s1", "p"],
          ["c3", "a3", "na", "s1", "p"],
          ["c1", "b1", "nb", "s2", "p"],
          ["c2", "b2", "nb", "s2", "p"],
        ]),
        narrators({ ...roles, ...nar("a1", "a2", "a3", "b1", "b2", "na", "nb") }),
      ),
    );
    expect(a.commonLink).toBe("na");
    expect(a.partialCommonLinks).toEqual(["nb"]);
    expect(a.branchPoints).toContain("p");
    expect(a.partialCommonLinks).not.toContain("p");
  });

  it("never picks a compiler, even when it is in every route", () => {
    const g = buildGraph(hadith([["c1", "n1", "s1", "p"], ["c1", "n2", "s2", "p"]]), narrators({ ...roles, ...nar("n1", "n2") }));
    expect(commonLink(g)).toBeNull();
  });

  it("counts narrators and routes per generation", () => {
    const a = analyze(buildGraph(hadith([["c1", "n1", "s1", "p"], ["c2", "n2", "s1", "p"]]), narrators({ ...roles, ...nar("n1", "n2") })));
    expect(a.generations).toEqual([
      { depth: 0, narrators: 1, routes: 2 },
      { depth: 1, narrators: 1, routes: 2 },
      { depth: 2, narrators: 2, routes: 2 },
      { depth: 3, narrators: 2, routes: 2 },
    ]);
  });
});

describe("analyze on data/ (owner decision: compilers and the Prophet ﷺ excluded)", () => {
  const narratorMap = getNarratorMap();
  const expected: Record<string, [string, number, number]> = {
    niyyah: ["yahya-ibn-said-al-ansari", 8, 8],
    "la-yuminu": ["qatada-ibn-diama", 5, 5],
    "buniya-al-islam": ["abdullah-ibn-umar", 5, 5],
    "al-din-al-nasiha": ["suhayl-ibn-abi-salih", 3, 3],
    "man-kadhaba": ["shuba-ibn-al-hajjaj", 5, 16],
  };
  for (const h of getHadiths()) {
    it(h.id, () => {
      const g = buildGraph(h, narratorMap);
      const a = analyze(g);
      const want = expected[h.id];
      expect(want).toBeDefined();
      if (!want) return;
      expect(a.commonLink).toBe(want[0]);
      expect(g.nodes.get(want[0])?.routeIds.length).toBe(want[1]);
      expect(a.totalRoutes).toBe(want[2]);
    });
  }
});
