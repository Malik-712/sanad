import { describe, expect, it } from "vitest";
import { parseRules, ruleLabels } from "./ruleParser";

// Made-up names only (no real isnad, no user text).
const names = (text: string) => parseRules(text).names.map((n) => n.text);

describe("parseRules", () => {
  it("returns nothing for empty or blank input", () => {
    for (const t of ["", "   ", "\n"]) {
      const r = parseRules(t);
      expect(r.names).toEqual([]);
      expect(r.sighas).toEqual([]);
      expect(r.engine).toBe("rules");
    }
  });

  it.each([
    "حدثنا",
    "حدثني",
    "أخبرنا",
    "أخبرني",
    "أنبأنا",
    "ثنا",
    "نا",
    "أنا",
    "سمعت",
    "سمع",
    "عن",
    "أن",
    "قال",
    "يقول",
  ])("splits on «%s»", (sigha) => {
    const r = parseRules(`حدثنا زيد بن خالد ${sigha} عمرو بن بكر`);
    expect(r.names.map((n) => n.text)).toEqual(["زيد بن خالد", "عمرو بن بكر"]);
    expect(r.sighas).toEqual([sigha]);
  });

  it("keeps the original spelling and offsets", () => {
    const text = "حَدَّثَنَا زَيْدُ بْنُ خَالِدٍ، عَنْ عَمْرِو بْنِ بَكْرٍ";
    const r = parseRules(text);
    expect(r.names.map((n) => n.text)).toEqual(["زَيْدُ بْنُ خَالِدٍ", "عَمْرِو بْنِ بَكْرٍ"]);
    for (const n of r.names) expect(text.slice(n.start, n.end)).toBe(n.text);
    expect(r.sighas).toEqual(["عَنْ"]);
  });

  it("reads full tashkeel the same as plain text", () => {
    const plain = parseRules("حدثنا زيد بن خالد قال حدثنا عمرو بن بكر عن سالم");
    const voweled = parseRules("حَدَّثَنَا زَيْدُ بْنُ خَالِدٍ قَالَ حَدَّثَنَا عَمْرُو بْنُ بَكْرٍ عَنْ سَالِمٍ");
    expect(voweled.names.length).toBe(plain.names.length);
    expect(plain.names.length).toBe(3);
  });

  it("prefers a transmission word over «قال» between two names", () => {
    expect(parseRules("حدثنا زيد قال حدثنا عمرو").sighas).toEqual(["حدثنا"]);
  });

  it("strips honorifics from names", () => {
    expect(names("عن سالم رضي الله عنه قال")).toEqual(["سالم"]);
    expect(names("عن هند رضي الله عنها")).toEqual(["هند"]);
    expect(names("عن زيد ﵁ عن عمرو")).toEqual(["زيد", "عمرو"]);
  });

  it("stops at the Prophet ﷺ and flags him", () => {
    const r = parseRules("حدثنا زيد عن عمرو أن رسول الله ﷺ قال: كذا وكذا");
    expect(r.names.map((n) => n.text)).toEqual(["زيد", "عمرو"]);
    expect(r.prophet).toBe(true);
    expect(names("عن عمرو قال: نهى رسول الله صلى الله عليه وسلم عن كذا")).toEqual(["عمرو"]);
    expect(names("عن عمرو عن النبي ﷺ")).toEqual(["عمرو"]);
  });

  it("does not read the speaker's words after «قال:» as a name", () => {
    expect(names("حدثنا زيد عن عمرو قال: كنا نفعل كذا")).toEqual(["زيد", "عمرو"]);
    expect(names("حدثنا زيد قال: حدثنا عمرو")).toEqual(["زيد", "عمرو"]);
  });

  it("marks «ح» (tahwil) as a new branch", () => {
    const r = parseRules("حدثنا زيد عن خالد ح وحدثنا عمرو عن خالد");
    expect(r.names.map((n) => n.text)).toEqual(["زيد", "خالد", "عمرو", "خالد"]);
    expect(r.tahwil).toEqual([2]);
  });

  it("keeps «يعني» inside a name", () => {
    expect(names("حدثنا زيد يعني ابن خالد عن عمرو")).toEqual(["زيد يعني ابن خالد", "عمرو"]);
  });

  it("does not take a long opening phrase or plain prose as names", () => {
    expect(names("هذا كلام عادي ليس فيه إسناد ولا رواة البتة")).toEqual([]);
  });
});

describe("ruleLabels", () => {
  it("gives BIO labels on the same words", () => {
    expect(ruleLabels(["حدثنا", "زيد", "بن", "خالد", "،", "عن", "عمرو"])).toEqual([
      "O",
      "B-NAR",
      "I-NAR",
      "I-NAR",
      "O",
      "O",
      "B-NAR",
    ]);
  });
});
