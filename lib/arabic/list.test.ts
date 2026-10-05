import { describe, expect, it } from "vitest";
import { joinAr } from "./list";

describe("joinAr", () => {
  it("joins with an attached «و»", () => {
    expect(joinAr(["البخاري"])).toBe("البخاري");
    expect(joinAr(["البخاري", "مسلم"])).toBe("البخاري ومسلم");
    expect(joinAr(["أ", "ب", "ج"])).toBe("أ وب وج");
  });
});
