import { describe, expect, it } from "vitest";
import cases from "@/tests/fixtures/tokenize-cases.json";
import { tokenize } from "./tokenize";

// The same fixture is checked by ml/tests/test_normalize_twin.py against ml/tokenize_words.py.
describe("tokenize twin fixture", () => {
  it.each(cases)("$input", ({ input, tokens }) => {
    expect(tokenize(input).map((t) => t.text)).toEqual(tokens);
  });

  it("keeps offsets into the original text", () => {
    const text = "حَدَّثَنَا زَيْدٌ، عَنْ خَالِدٍ";
    for (const t of tokenize(text)) expect(text.slice(t.start, t.end).length).toBeGreaterThan(0);
    const [, zayd, comma] = tokenize(text);
    expect(text.slice(zayd!.start, zayd!.end)).toBe("زَيْدٌ");
    expect(text.slice(comma!.start, comma!.end)).toBe("،");
  });
});
