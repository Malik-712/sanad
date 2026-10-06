import { describe, expect, it } from "vitest";
import { jaroWinkler } from "./jaroWinkler";
import { chainEdges, linkForm, linkNames, stateOf, type LinkIndex } from "./linker";

// A small index made for the tests (ids and edges are test fixtures, not data/ facts).
const index: LinkIndex = {
  narrators: [
    { id: "s-uyayna", nameAr: "سفيان بن عيينة", fullNameAr: "سفيان بن عيينة", aliasesAr: ["سُفْيَانُ"], role: "narrator" },
    { id: "s-thawri", nameAr: "سفيان الثوري", fullNameAr: "سفيان الثوري", aliasesAr: ["سُفْيَانَ"], role: "narrator" },
    { id: "humaydi", nameAr: "الحميدي", fullNameAr: "الحميدي", aliasesAr: [], role: "narrator" },
    { id: "waki", nameAr: "وكيع", fullNameAr: "وكيع بن الجراح", aliasesAr: [], role: "narrator" },
    { id: "yahya", nameAr: "يحيى بن سعيد", fullNameAr: "يحيى بن سعيد", aliasesAr: ["يَحْيَى بْنُ سَعِيدٍ"], role: "narrator" },
    { id: "abu-x", nameAr: "أبو هريرة", fullNameAr: "أبو هريرة", aliasesAr: [], role: "companion" },
    { id: "prophet", nameAr: "النبي ﷺ", fullNameAr: "النبي ﷺ", aliasesAr: [], role: "prophet" },
  ],
  edges: chainEdges([
    ["humaydi", "s-uyayna", "yahya", "prophet"],
    ["waki", "s-thawri", "prophet"],
  ]),
};

describe("jaroWinkler", () => {
  it("is 1 for equal strings and 0 for empty", () => {
    expect(jaroWinkler("سفيان", "سفيان")).toBe(1);
    expect(jaroWinkler("", "سفيان")).toBe(0);
  });
  it("rewards a shared start", () => {
    expect(jaroWinkler("سفيان بن", "سفيان الثوري")).toBeGreaterThan(jaroWinkler("بن سفيان", "سفيان الثوري"));
  });
});

describe("linkForm", () => {
  it("folds diacritics, honorifics and the forms of أبو", () => {
    expect(linkForm("أَبِي هُرَيْرَةَ ﵁")).toBe("ابو هريره");
    expect(linkForm("عبد الله ابن زيد")).toBe("عبد الله بن زيد");
  });
});

describe("linkNames", () => {
  it("a bare «سفيان» is ambiguous: check, with both as candidates", () => {
    const [r] = linkNames(["سفيان"], index);
    expect(r!.state).toBe("check");
    expect(r!.candidates.map((c) => c.narratorId).sort()).toEqual(["s-thawri", "s-uyayna"]);
  });

  it("a known neighbour ranks the right «سفيان» first, but it still needs checking", () => {
    const withStudent = linkNames(["الحميدي", "سفيان"], index)[1]!;
    expect(withStudent.best?.narratorId).toBe("s-uyayna");
    expect(withStudent.state).toBe("check");
    expect(withStudent.byContext).toBe(true);
    expect(withStudent.candidates.map((c) => c.narratorId)).toEqual(["s-uyayna", "s-thawri"]);
    const other = linkNames(["وكيع", "سفيان"], index)[1]!;
    expect(other.best?.narratorId).toBe("s-thawri");
    expect(other.byContext).toBe(true);
    expect(linkNames(["سفيان"], index)[0]!.byContext).toBe(false);
  });

  it("a confident name gets no context flag", () => {
    const [humaydi] = linkNames(["الحميدي", "سفيان"], index);
    expect(humaydi!.state).toBe("high");
    expect(humaydi!.byContext).toBe(false);
  });

  it("an unknown name has no record", () => {
    const [r] = linkNames(["قزمان بن طرخان"], index);
    expect(r!.state).toBe("none");
    expect(r!.candidates).toEqual([]);
    expect(r!.best).toBeUndefined();
  });

  it("an alias written with full tashkeel is a confident link", () => {
    const [r] = linkNames(["يَحْيَى بْنُ سَعِيدٍ"], index);
    expect(r!.state).toBe("high");
    expect(r!.best).toEqual({ narratorId: "yahya", score: 1 });
    expect(r!.byContext).toBe(false);
  });

  it("never links to the Prophet ﷺ record", () => {
    expect(linkNames(["النبي"], index)[0]!.candidates.some((c) => c.narratorId === "prophet")).toBe(false);
  });
});

describe("stateOf thresholds (0.60 / 0.90 / gap 0.10)", () => {
  const c = (...scores: number[]) => scores.map((score, i) => ({ narratorId: `n${i}`, score }));
  it("high needs best ≥ 0.90 and a gap ≥ 0.10", () => {
    expect(stateOf(c(0.9, 0.8))).toBe("high");
    expect(stateOf(c(1, 0.9))).toBe("high");
    expect(stateOf(c(0.9))).toBe("high");
    expect(stateOf(c(0.9, 0.81))).toBe("check");
    expect(stateOf(c(0.899, 0.1))).toBe("check");
  });
  it("check from 0.60, none below", () => {
    expect(stateOf(c(0.6))).toBe("check");
    expect(stateOf(c(0.599))).toBe("none");
    expect(stateOf([])).toBe("none");
  });
});
