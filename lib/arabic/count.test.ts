import { describe, expect, it } from "vitest";
import { countDefinite, countNoun, numberWord } from "./count";

// Every count that occurs in data/ today: isnads per hadith (3, 5, 8, 16), compilers (1, 2),
// companions (1, 8), names in a pasted isnad (7).
describe("countNoun", () => {
  it("isnad", () => {
    expect(countNoun(1, "isnad")).toBe("إسناد واحد");
    expect(countNoun(2, "isnad")).toBe("إسنادان");
    expect(countNoun(3, "isnad")).toBe("ثلاثة أسانيد");
    expect(countNoun(5, "isnad")).toBe("خمسة أسانيد");
    expect(countNoun(7, "isnad")).toBe("سبعة أسانيد");
    expect(countNoun(8, "isnad")).toBe("ثمانية أسانيد");
    expect(countNoun(10, "isnad")).toBe("عشرة أسانيد");
    expect(countNoun(11, "isnad")).toBe("أحد عشر إسنادًا");
    expect(countNoun(12, "isnad")).toBe("اثنا عشر إسنادًا");
    expect(countNoun(16, "isnad")).toBe("ستة عشر إسنادًا");
    expect(countNoun(20, "isnad")).toBe("عشرون إسنادًا");
    expect(countNoun(21, "isnad")).toBe("واحد وعشرون إسنادًا");
    expect(countNoun(22, "isnad")).toBe("اثنان وعشرون إسنادًا");
    expect(countNoun(37, "isnad")).toBe("سبعة وثلاثون إسنادًا");
    expect(countNoun(40, "isnad")).toBe("أربعون إسنادًا");
  });

  it("compiler after «عند» (genitive)", () => {
    expect(countNoun(1, "compiler", "gen")).toBe("مصنِّف واحد");
    expect(countNoun(2, "compiler", "gen")).toBe("مصنِّفَين");
    expect(countNoun(5, "compiler", "gen")).toBe("خمسة مصنِّفين");
    expect(countNoun(12, "compiler", "gen")).toBe("اثني عشر مصنِّفًا");
  });

  it("name", () => {
    expect(countNoun(7, "name")).toBe("سبعة أسماء");
    expect(countNoun(2, "name")).toBe("اسمان");
  });

  it("genitive compound numbers", () => {
    expect(countNoun(22, "compiler", "gen")).toBe("اثنين وعشرين مصنِّفًا");
    expect(countNoun(37, "compiler", "gen")).toBe("سبعة وثلاثين مصنِّفًا");
  });

  it("rejects counts outside 1–99", () => {
    expect(() => countNoun(0, "isnad")).toThrow(RangeError);
    expect(() => countNoun(100, "isnad")).toThrow(RangeError);
    expect(() => countNoun(2.5, "isnad")).toThrow(RangeError);
  });
});

describe("countDefinite", () => {
  it("isnad", () => {
    expect(countDefinite(1, "isnad")).toBe("الإسناد");
    expect(countDefinite(2, "isnad")).toBe("الإسنادان");
    expect(countDefinite(3, "isnad")).toBe("الأسانيد الثلاثة");
    expect(countDefinite(5, "isnad")).toBe("الأسانيد الخمسة");
    expect(countDefinite(7, "isnad")).toBe("الأسانيد السبعة");
    expect(countDefinite(8, "isnad")).toBe("الأسانيد الثمانية");
    expect(countDefinite(16, "isnad")).toBe("الأسانيد الستة عشر");
  });
});

describe("numberWord", () => {
  it("bare number after «من»", () => {
    expect(numberWord(3, "gen")).toBe("ثلاثة");
    expect(numberWord(8, "gen")).toBe("ثمانية");
    expect(numberWord(16, "gen")).toBe("ستة عشر");
  });
});
