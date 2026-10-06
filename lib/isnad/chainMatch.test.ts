import { describe, expect, it } from "vitest";
import { matchChain, type MatchRoute } from "./chainMatch";

// Test fixtures, not data/ facts.
const routes: MatchRoute[] = [
  { hadithId: "h1", hadithTitle: "ح١", routeId: "r1", chain: ["comp", "a", "b", "c", "prophet"], index: 0, total: 2 },
  { hadithId: "h1", hadithTitle: "ح١", routeId: "r2", chain: ["comp", "d", "b", "c", "prophet"], index: 1, total: 2 },
];

describe("matchChain", () => {
  it("matches the names after the compiler, up to the companion", () => {
    expect(matchChain(["a", "b", "c"], routes)?.routeId).toBe("r1");
    expect(matchChain(["d", "b", "c"], routes)?.routeId).toBe("r2");
  });
  it("also matches when the compiler is named in the text", () => {
    expect(matchChain(["comp", "a", "b", "c"], routes)?.routeId).toBe("r1");
  });
  it("no match for a broken chain, a partial chain, or an undecided name", () => {
    expect(matchChain(["a", "c"], routes)).toBeNull();
    expect(matchChain(["b", "c"], routes)).toBeNull();
    expect(matchChain(["a", null, "c"], routes)).toBeNull();
    expect(matchChain([], routes)).toBeNull();
  });
});
