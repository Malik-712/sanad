import { describe, expect, it } from "vitest";
import { toArabicIndic } from "./digits";

describe("toArabicIndic", () => {
  it("converts each digit", () => {
    expect(toArabicIndic("0123456789")).toBe("٠١٢٣٤٥٦٧٨٩");
  });

  it("converts numbers", () => {
    expect(toArabicIndic(0)).toBe("٠");
    expect(toArabicIndic(1907)).toBe("١٩٠٧");
  });

  it("keeps other characters in mixed text", () => {
    expect(toArabicIndic("95 - (55)")).toBe("٩٥ - (٥٥)");
    expect(toArabicIndic("المجلد 3، ص 12")).toBe("المجلد ٣، ص ١٢");
  });

  it("leaves text without digits and Arabic-Indic digits unchanged", () => {
    expect(toArabicIndic("إسناد")).toBe("إسناد");
    expect(toArabicIndic("٤٢")).toBe("٤٢");
    expect(toArabicIndic("")).toBe("");
  });
});
