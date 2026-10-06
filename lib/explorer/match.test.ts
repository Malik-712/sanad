import { describe, expect, it } from "vitest";
import { align, createIndex, findHadiths } from "./match";

// A made-up corpus (names are invented; no real isnad). Each hadith = its isnad's folded names in text order.
const names: string[][] = [
  ["زيد بن خالد", "عمرو بن بكر", "سالم بن هلال", "نافع"], // 0
  ["زيد بن خالد", "عمرو بن بكر", "سالم بن هلال"], // 1
  ["حامد بن رشيد", "زيد بن خالد", "عمرو بن بكر", "سالم بن هلال", "نافع"], // 2  (extra name first)
  ["زيد بن خالد", "سالم بن هلال"], // 3  (missing the middle name)
  ["قزمان بن طرخان", "هلال بن سمعان"], // 4  (unrelated)
  ["عمرو بن بكر", "زيد بن خالد", "سالم بن هلال"], // 5  (wrong order)
  ["زيد", "عمرو", "سالم بن هلال"], // 6  (short forms)
];
const dict = [...new Set(names.flat())];
const h = names.map((list) => list.map((n) => dict.indexOf(n)));
const index = createIndex(dict, h);
const pasted = ["زيد بن خالد", "عمرو بن بكر", "سالم بن هلال"];

describe("align", () => {
  it("keeps the order and ignores the extras", () => {
    const { pairs } = align(pasted, names[2]!);
    expect(pairs.map((p) => [p.pasted, p.hadith])).toEqual([[0, 1], [1, 2], [2, 3]]);
  });
  it("does not match names in the wrong order", () => {
    expect(align(pasted, names[5]!).pairs.length).toBeLessThan(3);
  });
  it("counts a shorter form of a name as 0.8", () => {
    const { score, pairs } = align(pasted, names[6]!);
    expect(pairs.map((p) => p.quality)).toEqual([0.8, 0.8, 1]);
    expect(score).toBeCloseTo(2.6);
  });
});

describe("findHadiths", () => {
  const hits = findHadiths(pasted, index);
  const by = (gid: number) => hits.find((x) => x.gid === gid);

  it("same isnad first, then the ones that contain it, then the close ones", () => {
    expect(by(1)?.cls).toBe("same");
    expect(by(0)?.cls).toBe("contains");
    expect(by(2)?.cls).toBe("contains");
    expect(by(3)?.cls).toBe("close");
    expect(hits.map((x) => x.cls)).toEqual([...hits.map((x) => x.cls)].sort((a, b) => ["same", "contains", "close"].indexOf(a) - ["same", "contains", "close"].indexOf(b)));
    expect(hits[0]!.gid).toBe(1);
  });

  it("ranks fewer extra names higher inside a class", () => {
    expect(hits.findIndex((x) => x.gid === 0)).toBeLessThan(hits.findIndex((x) => x.gid === 2));
  });

  it("never returns a hadith that is not in the corpus, or an unrelated one", () => {
    for (const x of hits) {
      expect(x.gid).toBeGreaterThanOrEqual(0);
      expect(x.gid).toBeLessThan(names.length);
    }
    expect(by(4)).toBeUndefined();
  });

  it("a chain that is not in the corpus finds nothing", () => {
    expect(findHadiths(["فلان بن علان", "ترتان بن مرتان", "بلبل بن حمدان"], index)).toEqual([]);
  });

  it("a short chain must match fully", () => {
    const short = findHadiths(["زيد بن خالد", "عمرو بن بكر"], index);
    expect(short.map((x) => x.gid).sort()).toEqual([0, 1, 2, 6].sort());
    expect(short.every((x) => x.missing === 0)).toBe(true);
  });

  it("is deterministic: three runs give the same list", () => {
    const run = () => JSON.stringify(findHadiths(pasted, createIndex(dict, h)));
    expect(run()).toBe(run());
    expect(run()).toBe(JSON.stringify(hits));
  });

  it("reads the shipped delta-encoded postings the same way", () => {
    const raw: Record<string, number[]> = {};
    const m = new Map<string, number[]>();
    h.forEach((ids, gid) => {
      for (const w of new Set(ids.flatMap((id) => dict[id]!.split(" ")))) (m.get(w) ?? m.set(w, []).get(w)!).push(gid);
    });
    for (const [w, ids] of m) {
      let prev = 0;
      raw[w] = ids.map((id) => ((d) => ((prev = id), d))(id - prev));
    }
    expect(createIndex(dict, h, raw).post("خالد")).toEqual(index.post("خالد"));
  });
});
