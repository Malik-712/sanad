// Measures the explorer on our 37 verified isnāds: paste each one, find the hadiths in the corpus.
// Ground truth: for Bukhari routes, the corpus has the same hadith under the same number (checked on 6 Oct for number 1).
// Muslim numbering differs between our data (Shamela) and the corpus, so for Muslim we only report whether anything is listed.
//   pnpm eval:explorer [--write docs/EVALUATION.md]
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Hadith } from "@/lib/data/types";
import { createIndex, findHadiths } from "@/lib/explorer/match";
import { createTagger } from "@/lib/ml/tagger";
import { spansFromLabels } from "@/lib/ml/spans";
import { parseRules } from "@/lib/parser/ruleParser";
import { buildResult } from "@/lib/parser/result";
import { tokenize } from "@/lib/parser/tokenize";

const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const names = read("public/corpus/names.json") as { dict: string[]; h: number[][] };
const idxRaw = read("public/corpus/idx.json") as Record<string, number[]>;
const manifest = read("corpus/MANIFEST.json") as { books: { id: string; count: number; offset: number }[] };
const index = createIndex(names.dict, names.h, idxRaw);

function numbersOf(bookId: string): number[] {
  const b = manifest.books.find((x) => x.id === bookId)!;
  const nums: number[] = [];
  for (let k = 0; k < Math.ceil(b.count / 200); k++) nums.push(...(read(`public/corpus/docs/${bookId}-${k}.json`) as { n: number[] }).n);
  return nums;
}
const bukhariNums = numbersOf("bukhari");
const bukhariOffset = manifest.books.find((x) => x.id === "bukhari")!.offset;

const fold = (s: string) => tokenize(s).map((t) => t.text).join(" ");
const hadiths = readdirSync("data/hadiths").filter((f) => f.endsWith(".json")).sort().map((f) => read(join("data/hadiths", f)) as Hadith);

type Row = { id: string; names: number; found: number; same: number; contains: number; close: number; rank: number | null; ownSame: boolean };

async function evaluate(engine: "rules" | "model"): Promise<Row[]> {
  const tagger = engine === "model" ? await createTagger({ localModelPath: `${process.cwd()}/public/models/` }) : null;
  const rows: Row[] = [];
  for (const h of hadiths)
    for (const r of h.routes) {
      let parse = parseRules(r.isnadAr);
      if (tagger) {
        const toks = tokenize(r.isnadAr);
        const words = toks.map((t) => t.text);
        parse = buildResult(r.isnadAr, toks, spansFromLabels(words, await tagger.tag(words)), "model");
      }
      const pasted = parse.names.map((n) => fold(n.text));
      const hits = findHadiths(pasted, index);
      let rank: number | null = null;
      let ownSame = false;
      if (r.id.startsWith("bukhari-")) {
        const gid = bukhariOffset + bukhariNums.indexOf(Number(r.number));
        const pos = hits.findIndex((x) => x.gid === gid);
        rank = pos < 0 ? null : pos + 1;
        ownSame = pos >= 0 && hits[pos]!.cls !== "close";
      }
      rows.push({
        id: r.id,
        names: pasted.length,
        found: hits.length,
        same: hits.filter((x) => x.cls === "same").length,
        contains: hits.filter((x) => x.cls === "contains").length,
        close: hits.filter((x) => x.cls === "close").length,
        rank,
        ownSame,
      });
    }
  return rows;
}

const med = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] ?? 0;
function line(name: string, rows: Row[]): string {
  const bukhari = rows.filter((r) => r.id.startsWith("bukhari-"));
  const inList = bukhari.filter((r) => r.rank !== null);
  const top3 = bukhari.filter((r) => r.rank !== null && r.rank <= 3);
  const withHits = rows.filter((r) => r.found > 0);
  return `| ${name} | ${withHits.length} / ${rows.length} | ${med(rows.map((r) => r.found))} | ${inList.length} / ${bukhari.length} | ${top3.length} / ${bukhari.length} | ${bukhari.filter((r) => r.ownSame).length} / ${bukhari.length} | ${med(inList.map((r) => r.rank!))} |`;
}

async function main() {
  const rules = await evaluate("rules");
  const model = await evaluate("model");
  const total = manifest.books.reduce((n, b) => n + b.count, 0);
  const summary = [
    `All ${rules.length} verified isnāds of \`data/\` pasted exactly as stored, against the corpus of ${total.toLocaleString("en")} hadiths. Both readers go through the same matching; the model row is the reader the site uses (the same code as in the browser, run in Node). Ground truth: a Bukhari isnād should find the corpus hadith with the same Bukhari number (the numbering agrees for Bukhari; for Muslim it does not, so Muslim rows count only whether anything is listed).`,
    "",
    "| Reader | Isnāds with at least one hadith listed | Median hadiths listed | Own Bukhari hadith in the list | … in the first 3 | … as «same» or «contains» (not only «close») | Median rank of own hadith |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    line("Rules", rules),
    line("Model (shipped)", model),
    "",
    "The set is small (18 Bukhari isnāds) and the rules were tuned while looking at these routes, so read the rules row as optimistic.",
  ].join("\n");
  console.log(summary);
  console.log(model.map((r) => `${r.id}: names ${r.names}, listed ${r.found} (same ${r.same}, contains ${r.contains}, close ${r.close}), rank ${r.rank ?? "–"}`).join("\n"));
  const at = process.argv.indexOf("--write");
  if (at > 0) {
    const file = process.argv[at + 1]!;
    const doc = readFileSync(file, "utf8");
    const block = `<!-- explorer:start -->\n${summary}\n\nGenerated by \`pnpm eval:explorer\` on ${new Date().toISOString().slice(0, 10)}.\n<!-- explorer:end -->`;
    writeFileSync(file, doc.replace(/<!-- explorer:start -->[\s\S]*<!-- explorer:end -->/, block));
  }
}
void main();
