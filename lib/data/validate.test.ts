import { describe, expect, it } from "vitest";
import { validateData } from "./validate";

// Made-up fixtures with obviously sample values. Each test breaks one rule.
function narrators() {
  return [
    { id: "prophet", nameAr: "[النبي]", fullNameAr: "[النبي]", aliasesAr: [], role: "prophet", verification: { status: "unverified" } },
    { id: "s1", nameAr: "[صحابي]", fullNameAr: "[صحابي]", aliasesAr: [], role: "companion", honorificAr: "رضي الله عنه", verification: { status: "unverified" } },
    { id: "n1", nameAr: "[راوٍ]", fullNameAr: "[راوٍ]", aliasesAr: [], role: "narrator", verification: { status: "unverified" } },
    { id: "c1", nameAr: "[مصنف]", fullNameAr: "[مصنف]", aliasesAr: [], role: "compiler", verification: { status: "unverified" } },
  ] as Record<string, unknown>[];
}

function hadith() {
  return {
    id: "sample",
    titleAr: "عنوان",
    matnAr: "متن",
    matnSource: { url: "https://example.org/m", book: "كتاب", number: "1" },
    routes: [
      {
        id: "r1",
        book: { nameAr: "كتاب", authorAr: "مصنف", edition: "طبعة" },
        number: "12",
        volume: "1",
        page: "2",
        url: "https://example.org/r1",
        retrieved: "2026-10-05",
        method: "manual",
        isnadAr: "حدثنا فلان عن فلان",
        chain: ["c1", "n1", "s1", "prophet"],
        sighas: ["حدثنا", "عن", "قال"],
        grade: { textAr: "حكم", byAr: "قائل", sourceUrl: "https://example.org/g" },
        verification: { status: "unverified" },
      },
    ],
  } as Record<string, unknown> & { routes: Record<string, unknown>[] };
}

function run(n = narrators(), h = hadith()) {
  return validateData({ file: "narrators.json", json: n }, [{ file: "sample.json", json: h }]);
}

describe("validateData", () => {
  it("accepts the valid fixture", () => {
    expect(run()).toEqual([]);
  });

  it("route without URL, book or number", () => {
    const h = hadith();
    delete h.routes[0]!.url;
    expect(run(narrators(), h).join()).toMatch(/routes\.0\.url/);
    const h2 = hadith();
    delete h2.routes[0]!.book;
    expect(run(narrators(), h2).join()).toMatch(/routes\.0\.book/);
    const h3 = hadith();
    h3.routes[0]!.number = "";
    expect(run(narrators(), h3).join()).toMatch(/routes\.0\.number/);
  });

  it("route without retrieved date or method", () => {
    const h = hadith();
    delete h.routes[0]!.retrieved;
    expect(run(narrators(), h).join()).toMatch(/retrieved/);
    const h2 = hadith();
    h2.routes[0]!.method = "guessed";
    expect(run(narrators(), h2).join()).toMatch(/method/);
  });

  it("chain id not in narrators.json", () => {
    const h = hadith();
    h.routes[0]!.chain = ["c1", "ghost", "s1", "prophet"];
    expect(run(narrators(), h).join()).toMatch(/unknown narrator "ghost"/);
  });

  it("chain that does not end at the Prophet", () => {
    const h = hadith();
    h.routes[0]!.chain = ["c1", "n1", "s1"];
    h.routes[0]!.sighas = ["حدثنا", "عن"];
    expect(run(narrators(), h).join()).toMatch(/must end at "prophet"/);
  });

  it("sighas of the wrong length", () => {
    const h = hadith();
    h.routes[0]!.sighas = ["حدثنا"];
    expect(run(narrators(), h).join()).toMatch(/sighas has 1 items, expected 3/);
  });

  it("grade without author or source", () => {
    const h = hadith();
    h.routes[0]!.grade = { textAr: "حكم", byAr: "", sourceUrl: "https://example.org/g" };
    expect(run(narrators(), h).join()).toMatch(/grade\.byAr/);
    const h2 = hadith();
    h2.routes[0]!.grade = { textAr: "حكم", byAr: "قائل" };
    expect(run(narrators(), h2).join()).toMatch(/grade\.sourceUrl/);
  });

  it("narrator never used", () => {
    const n = narrators();
    n.push({ id: "extra", nameAr: "x", fullNameAr: "x", aliasesAr: [], role: "narrator", verification: { status: "unverified" } });
    expect(run(n).join()).toMatch(/"extra" is not used/);
  });

  it("companion without honorific", () => {
    const n = narrators();
    delete n[1]!.honorificAr;
    expect(run(n).join()).toMatch(/companion "s1" needs honorificAr/);
  });

  it("placeholder in a file that is not demo data, but not in a quoted grade", () => {
    const h = hadith();
    h.routes[0]!.number = "[رقم الحديث]";
    expect(run(narrators(), h).join()).toMatch(/number contains a placeholder/);
    const demo = hadith();
    demo.demo = true;
    demo.routes[0]!.number = "[رقم الحديث]";
    expect(run(narrators(), demo)).toEqual([]);
    const graded = hadith();
    graded.routes[0]!.grade = { textAr: "[صحيح]", byAr: "قائل", sourceUrl: "https://example.org/g" };
    expect(run(narrators(), graded)).toEqual([]);
  });
});
