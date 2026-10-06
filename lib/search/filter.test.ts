import { describe, expect, it } from "vitest";
import { getHadiths, getNarratorMap } from "@/lib/data/load";
import { buildSearchEntry, filterEntries, latinDigits } from "./filter";

// Runs against the real data/ files, as the Home page does at build time.
const narrators = getNarratorMap();
const entries = getHadiths().map((h) => buildSearchEntry(h, narrators));
const find = (q: string) => filterEntries(entries, q).sort();

describe("filterEntries", () => {
  it("returns every hadith for an empty query", () => {
    expect(filterEntries(entries, "  ")).toHaveLength(entries.length);
  });

  it("ignores diacritics: with and without tashkeel give the same result", () => {
    expect(find("إِنَّمَا الْأَعْمَالُ")).toEqual(["niyyah"]);
    expect(find("انما الاعمال")).toEqual(["niyyah"]);
    expect(find("الدِّينُ النَّصِيحَةُ")).toEqual(["al-din-al-nasiha"]);
  });

  it("treats أ / إ / آ / ا as one letter", () => {
    expect(find("إنما")).toEqual(find("انما"));
    expect(find("أنما")).toEqual(find("انما"));
    expect(find("آنما")).toEqual(find("انما"));
    expect(find("الإسلام")).toEqual(["buniya-al-islam"]);
    expect(find("الاسلام")).toEqual(["buniya-al-islam"]);
  });

  it("treats ى and ي as one letter", () => {
    expect(find("يحيى بن سعيد")).toEqual(find("يحيي بن سعيد"));
    expect(find("يحيي بن سعيد الأنصاري")).toContain("niyyah");
  });

  it("treats ة and ه as one letter", () => {
    expect(find("النصيحة")).toEqual(["al-din-al-nasiha"]);
    expect(find("النصيحه")).toEqual(["al-din-al-nasiha"]);
  });

  it("matches a narrator's name, with or without an honorific", () => {
    expect(find("عمر بن الخطاب")).toContain("niyyah");
    expect(find("عمر بن الخطاب رضي الله عنه")).toContain("niyyah");
  });

  it("matches a hadith number exactly, in Latin or Arabic-Indic digits", () => {
    expect(find("2529")).toEqual(["niyyah"]);
    expect(find("٢٥٢٩")).toEqual(["niyyah"]);
    expect(find("8")).toEqual(["buniya-al-islam"]);
    // «1» is al-Bukhari 1 and the first hadith of Muslim's Muqaddima.
    expect(find("1")).toEqual(["man-kadhaba", "niyyah"]);
    // Not a substring match: 25 is not 2529.
    expect(find("25")).toEqual([]);
  });

  it("matches a number in the book the query names", () => {
    expect(find("البخاري 1")).toEqual(["niyyah"]);
    expect(find("صحيح البخاري حديث ١")).toEqual(["niyyah"]);
    expect(find("مسلم ١")).toEqual(["man-kadhaba"]);
    expect(find("مسلم 2529")).toEqual([]);
  });

  it("returns nothing for words that are not there", () => {
    expect(find("قزقز")).toEqual([]);
  });
});

describe("latinDigits", () => {
  it("turns Arabic-Indic and Persian digits into 0–9", () => {
    expect(latinDigits("٩٥ - (٥٥)")).toBe("95 - (55)");
    expect(latinDigits("۱۲۳")).toBe("123");
  });
});
