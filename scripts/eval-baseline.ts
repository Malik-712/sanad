// Runs the rule parser on a split (ml/data/splits/*.jsonl) and writes its BIO predictions in the same format
// as the model's (one {id, labels} per line), so ml/evaluate.py scores both the same way.
//   pnpm tsx scripts/eval-baseline.ts --in ml/data/splits/test.jsonl --out ml/preds/baseline.test.jsonl
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { ruleLabels } from "@/lib/parser/ruleParser";

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback;
}

const input = arg("in", "ml/data/splits/test.jsonl");
const output = arg("out", "ml/preds/baseline.test.jsonl");

const lines = readFileSync(input, "utf8").split("\n").filter(Boolean);
const out = lines.map((line) => {
  const rec = JSON.parse(line) as { id: string; tokens: string[] };
  return JSON.stringify({ id: rec.id, labels: ruleLabels(rec.tokens) });
});
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, out.join("\n") + "\n");
console.log(`${out.length} predictions → ${output}`);
