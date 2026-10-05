import { describe, expect, it } from "vitest";
import { getHadiths, getNarratorMap } from "@/lib/data/load";
import { buildSearchEntry, filterEntries } from "./filter";

// Runs against the real data/ files, as the Home page does at build time.
const narrators = getNarratorMap();
const entries = getHadiths().map((h) => buildSearchEntry(h, narrators));

describe("filterEntries", () => {
  it("returns every hadith for an empty query", () => {
    expect(filterEntries(entries, "  ")).toHaveLength(entries.length);
  });

  it("matches hadith words typed without diacritics", () => {
    expect(filterEntries(entries, "إنما الأعمال")).toEqual(["niyyah"]);
    expect(filterEntries(entries, "النصيحة")).toEqual(["al-din-al-nasiha"]);
  });

  it("matches a narrator's name", () => {
    expect(filterEntries(entries, "يحيى بن سعيد الأنصاري")).toContain("niyyah");
  });

  it("returns nothing for words that are not there", () => {
    expect(filterEntries(entries, "قزقز")).toEqual([]);
  });
});
