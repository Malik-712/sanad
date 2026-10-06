import { describe, expect, it } from "vitest";
import { citationText } from "./cite";
import {
  companionIds,
  compilerIds,
  displayName,
  narratorStatus,
  routePlace,
  routesThrough,
  routeStatus,
} from "./derive";
import type { Hadith, Narrator, Route } from "./types";

// Made-up fixtures: obviously sample values, not taken from any book.
function route(over: Partial<Route> = {}): Route {
  return {
    id: "sample-1",
    book: { nameAr: "[كتاب]", authorAr: "[مصنف]", edition: "[طبعة]" },
    number: "12",
    volume: "3",
    page: "45",
    url: "https://example.org/sample",
    retrieved: "2026-10-05",
    method: "manual",
    isnadAr: "[نص الإسناد]",
    chain: ["c1", "n1", "s1", "p"],
    grade: null,
    verification: { status: "verified" },
    ...over,
  };
}

function narrator(over: Partial<Narrator> = {}): Narrator {
  return {
    id: "n1",
    nameAr: "[راوٍ]",
    fullNameAr: "[راوٍ كاملًا]",
    aliasesAr: [],
    role: "narrator",
    taqrib: { quoteAr: "[نص]", entryNo: "1", page: "1", edition: "[طبعة]", url: "https://example.org/t" },
    verification: { status: "unverified" },
    ...over,
  };
}

describe("routeStatus", () => {
  it("is ok only when verified by the owner and a URL exists", () => {
    expect(routeStatus(route())).toBe("ok");
    expect(routeStatus(route({ verification: { status: "unverified" } }))).toBe("check");
    expect(routeStatus(route({ url: "" }))).toBe("none");
  });
});

describe("narratorStatus", () => {
  it("follows the Taqrib record and the owner's status", () => {
    expect(narratorStatus(narrator())).toBe("check");
    expect(narratorStatus(narrator({ verification: { status: "verified" } }))).toBe("ok");
    expect(narratorStatus(narrator({ taqrib: undefined }))).toBe("none");
  });
});

describe("displayName", () => {
  it("adds the honorific only when the data has one", () => {
    expect(displayName(narrator())).toBe("[راوٍ]");
    expect(displayName(narrator({ role: "companion", honorificAr: "رضي الله عنهما" }))).toBe(
      "[راوٍ] رضي الله عنهما",
    );
  });
});

describe("compilers, companions, routes through a narrator", () => {
  const h: Hadith = {
    id: "sample",
    titleAr: "[عنوان]",
    matnAr: "[متن]",
    matnSource: { url: "https://example.org", book: "[كتاب]", number: "1" },
    routes: [
      route({ id: "r1", chain: ["c1", "n1", "s1", "p"] }),
      route({ id: "r2", chain: ["c2", "n2", "s1", "p"] }),
      route({ id: "r3", chain: ["c1", "n3", "s2", "p"] }),
    ],
  };

  it("lists unique ids in order of first appearance", () => {
    expect(compilerIds(h)).toEqual(["c1", "c2"]);
    expect(companionIds(h)).toEqual(["s1", "s2"]);
  });

  it("finds every route that contains a narrator", () => {
    expect(routesThrough([h], "s1").map((x) => x.route.id)).toEqual(["r1", "r2"]);
    expect(routesThrough([h], "nobody")).toEqual([]);
  });
});

describe("routePlace and citationText", () => {
  it("uses Arabic-Indic digits; a missing volume is left out, a missing page says «غير مذكور»", () => {
    expect(routePlace(route())).toBe("[طبعة]، ج ٣، ص ٤٥");
    expect(routePlace(route({ page: undefined }))).toBe("[طبعة]، ج ٣، ص غير مذكور");
    expect(routePlace(route({ volume: undefined }))).toBe("[طبعة]، ص ٤٥");
  });

  it("builds the copied citation", () => {
    expect(citationText(route())).toBe(["[نص الإسناد]", "[كتاب]، [طبعة]، ج ٣، ص ٤٥، رقم ١٢. https://example.org/sample"].join("\n"));
  });
});
