// Checks that the tagger running through Transformers.js (the code the browser runs) gives the same labels as the
// Python int8 predictions (ml/preds/model_int8.test.jsonl) on the 300 held-out test isnads.
//   pnpm tsx scripts/check-tagger.ts
import { readFileSync } from "node:fs";
import { createTagger } from "@/lib/ml/tagger";

async function main() {
  const gold = readFileSync("ml/data/splits/test.jsonl", "utf8").trim().split("\n").map((l) => JSON.parse(l) as { id: string; tokens: string[] });
  const py = new Map(readFileSync("ml/preds/model_int8.test.jsonl", "utf8").trim().split("\n").map((l) => JSON.parse(l) as { id: string; labels: string[] }).map((r) => [r.id, r.labels]));
  const tagger = await createTagger({ localModelPath: `${process.cwd()}/public/models/` });
  let same = 0;
  let total = 0;
  let ms = 0;
  for (const rec of gold) {
    const t0 = performance.now();
    const labels = await tagger.tag(rec.tokens);
    ms += performance.now() - t0;
    const ref = py.get(rec.id)!;
    labels.forEach((l, i) => {
      total++;
      if (l === ref[i]) same++;
    });
  }
  console.log(`agreement with the Python int8 labels: ${((100 * same) / total).toFixed(2)} % of ${total} words in ${gold.length} isnāds; ${(ms / gold.length).toFixed(0)} ms per isnād`);
}
void main();
