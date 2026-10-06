import { describe, expect, it } from "vitest";
import cases from "@/tests/fixtures/normalize-cases.json";
import { normalizeArabic, stripHonorifics } from "./normalize";

// The same fixture is checked by ml/tests/test_normalize_twin.py against ml/normalize.py.
describe("normalize twin fixture", () => {
  it.each(cases)("$input", ({ input, normalized, stripped }) => {
    expect(normalizeArabic(input)).toBe(normalized);
    expect(stripHonorifics(input)).toBe(stripped);
  });
});
