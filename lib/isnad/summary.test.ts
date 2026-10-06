import { describe, expect, it } from "vitest";
import { getHadith, getNarratorMap } from "@/lib/data/load";
import { analyze } from "./analyze";
import { buildGraph } from "./graph";
import { countsSentence } from "./summary";

const narrators = getNarratorMap();

function sentence(id: string): string {
  const h = getHadith(id);
  if (!h) throw new Error(id);
  const g = buildGraph(h, narrators);
  return countsSentence(h, g, analyze(g), narrators);
}

describe("countsSentence (from the engine)", () => {
  it("common link carries every isnad", () => {
    expect(sentence("niyyah")).toBe("ثمانية أسانيد عند مصنِّفَين، تلتقي كلها عند يحيى بن سعيد الأنصاري.");
    expect(sentence("buniya-al-islam")).toBe("خمسة أسانيد عند مصنِّفَين، تلتقي كلها عند عبد الله بن عمر رضي الله عنهما.");
    expect(sentence("al-din-al-nasiha")).toBe("ثلاثة أسانيد عند مصنِّف واحد، تلتقي كلها عند سهيل بن أبي صالح.");
  });

  it("common link carries only some isnads", () => {
    expect(sentence("man-kadhaba")).toBe("ستة عشر إسنادًا عند مصنِّفَين، يلتقي خمسة منها عند شعبة بن الحجاج.");
  });
});
