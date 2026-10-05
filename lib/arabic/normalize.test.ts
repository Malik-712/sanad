import { describe, expect, it } from "vitest";
import { normalizeArabic } from "./normalize";

describe("normalizeArabic", () => {
  it("removes diacritics (titles as written in data/)", () => {
    expect(normalizeArabic("إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ")).toBe("انما الاعمال بالنيات");
    expect(normalizeArabic("الدِّينُ النَّصِيحَةُ")).toBe("الدين النصيحه");
  });

  it("matches plain typing against vowelled text", () => {
    expect(normalizeArabic("إنما الأعمال")).toBe(normalizeArabic("إِنَّمَا الْأَعْمَالُ"));
    expect(normalizeArabic("يحيى بن سعيد")).toBe("يحيي بن سعيد");
  });

  it("folds hamza seats, tatweel and spaces", () => {
    expect(normalizeArabic("مُؤْمِن")).toBe("مومن");
    expect(normalizeArabic("يُؤْمِنُ")).toBe("يومن");
    expect(normalizeArabic("سـنـد")).toBe("سند");
    expect(normalizeArabic("  بُنِيَ   الْإِسْلَامُ ")).toBe("بني الاسلام");
  });
});
