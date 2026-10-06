import { describe, expect, it } from "vitest";
import { highlight } from "./highlight";

describe("highlight", () => {
  const text = "حَدَّثَنَا زَيْدُ بْنُ خَالِدٍ، عَنْ عَمْرِو بْنِ بَكْرٍ";
  it("marks the words of a matched name, keeping the original spelling", () => {
    const pieces = highlight(text, ["زيد بن خالد"]);
    expect(pieces.filter((p) => p.mark).map((p) => p.text)).toEqual(["زَيْدُ بْنُ خَالِدٍ"]);
    expect(pieces.map((p) => p.text).join("")).toBe(text);
  });
  it("marks several names and leaves the rest", () => {
    const pieces = highlight(text, ["زيد بن خالد", "عمرو بن بكر"]);
    expect(pieces.filter((p) => p.mark)).toHaveLength(2);
    expect(pieces.map((p) => p.text).join("")).toBe(text);
  });
  it("marks nothing when no name matches", () => {
    expect(highlight(text, ["فلان بن علان"]).every((p) => !p.mark)).toBe(true);
  });
});
