// Row (b) of docs/EVALUATION.md: every route in data/ pasted as is → reader → linker → chain match.
// Gold: the route's own chain (hand-checked by the owner), without the compiler and the Prophet ﷺ.
//   pnpm tsx scripts/eval-e2e.ts                                   print the rules results
//   pnpm tsx scripts/eval-e2e.ts --export ml/data/routes.jsonl     write the words for ml/predict.py
//   pnpm tsx scripts/eval-e2e.ts --model ml/preds/model.routes.jsonl --write docs/EVALUATION.md
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Hadith, Narrator } from "@/lib/data/types";
import { analyzeIsnad, decidedIds, findRoute, readings } from "@/lib/linker/analyze";
import { linkNames, type LinkResult } from "@/lib/linker/linker";
import { buildParseData } from "@/lib/linker/parseData";
import { buildResult } from "@/lib/parser/result";
import { tokenize } from "@/lib/parser/tokenize";
import type { ParseResult, WordSpan } from "@/lib/parser/types";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
}

const hadiths = readdirSync("data/hadiths")
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => JSON.parse(readFileSync(join("data/hadiths", f), "utf8")) as Hadith);
const narrators = JSON.parse(readFileSync("data/narrators.json", "utf8")) as Narrator[];
const data = buildParseData(hadiths, narrators);
const routes = hadiths.flatMap((h) => h.routes.map((r) => ({ hadith: h, route: r })));

const exportPath = arg("export");
if (exportPath) {
  const lines = routes.map(({ route }) => {
    const tokens = tokenize(route.isnadAr).map((t) => t.text);
    return JSON.stringify({ id: route.id, book: route.book.nameAr, tokens, labels: tokens.map(() => "O") });
  });
  writeFileSync(exportPath, lines.join("\n") + "\n");
  console.log(`${lines.length} routes → ${exportPath}`);
  process.exit(0);
}

type Row = { names: number; nameCountOk: number; linkedOk: number; goldNames: number; auto: number; withChoice: number; n: number };

function score(read: (text: string) => { parse: ParseResult; links: LinkResult[] } | null): Row {
  const row: Row = { names: 0, nameCountOk: 0, linkedOk: 0, goldNames: 0, auto: 0, withChoice: 0, n: 0 };
  for (const { route } of routes) {
    row.n++;
    const gold = route.chain.slice(1, route.chain.at(-1) === "prophet" ? -1 : undefined);
    row.goldNames += gold.length;
    const r = read(route.isnadAr);
    if (!r) continue;
    const { parse, links } = r;
    row.names += links.length;
    const auto = decidedIds(links);
    // The reading of the text (branches, parallel names) that comes closest to the gold chain.
    const all = readings(parse, auto);
    const right = (reading: number[]) => reading.filter((i, k) => auto[i] === gold[k]).length;
    const best = all.reduce((a, b) => (b.length === gold.length && (a.length !== gold.length || right(b) > right(a)) ? b : a), all[0] ?? []);
    if (best.length === gold.length) {
      row.nameCountOk++;
      row.linkedOk += right(best);
    }
    const sameChain = (choices: Record<number, string>) => findRoute(parse, links, data.routes, choices)?.route.chain.join() === route.chain.join();
    if (sameChain({})) row.auto++;
    // A user who picks the right candidate wherever one is offered (state "check"), on that reading.
    const choices: Record<number, string> = {};
    if (best.length === gold.length)
      best.forEach((i, k) => {
        const l = links[i]!;
        if (l.state === "check" && l.candidates.some((c) => c.narratorId === gold[k])) choices[i] = gold[k]!;
      });
    if (sameChain(choices)) row.withChoice++;
  }
  return row;
}

const rules = score((text) => {
  const a = analyzeIsnad(text, data.index);
  return a.ok ? { parse: a.parse, links: a.links } : null;
});

let model: Row | null = null;
const modelPath = arg("model");
if (modelPath) {
  const preds = new Map(
    readFileSync(modelPath, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as { id: string; labels: string[] })
      .map((p) => [p.id, p.labels]),
  );
  const byText = new Map(routes.map(({ route }) => [route.isnadAr, route.id]));
  model = score((text) => {
    const labels = preds.get(byText.get(text)!);
    if (!labels) return null;
    const tokens = tokenize(text);
    const spans: WordSpan[] = [];
    labels.forEach((l, i) => {
      if (l === "B-NAR" || (l === "I-NAR" && (i === 0 || labels[i - 1] === "O"))) spans.push([i, i + 1]);
      else if (l === "I-NAR") spans[spans.length - 1]![1] = i + 1;
    });
    const parse = buildResult(text, tokens, spans, "model");
    return { parse, links: linkNames(parse.names.map((n) => n.text), data.index, { tahwil: parse.tahwil }) };
  });
}

const pct = (a: number, b: number) => `${((100 * a) / b).toFixed(1)} %`;
const line = (name: string, r: Row) =>
  `| ${name} | ${r.nameCountOk} / ${r.n} | ${pct(r.linkedOk, r.goldNames)} | ${r.auto} / ${r.n} (${pct(r.auto, r.n)}) | ${r.withChoice} / ${r.n} (${pct(r.withChoice, r.n)}) |`;

const table = [
  `All ${rules.n} routes in \`data/\` (5 hadiths), each pasted exactly as stored in \`isnadAr\`. Gold: the route's own chain, checked by the owner, without the compiler and the Prophet ﷺ (${rules.goldNames} names in all). Linking uses the 92 narrator records in \`data/narrators.json\`; this is the data the linker was built for, so these numbers say how the whole flow behaves on our own routes, not how it generalises.`,
  "",
  "| Reader → linker | Right number of names | Names linked to the right record, no help | Chain found in the right tree, no help | Chain found after choosing among the offered candidates |",
  "| --- | --- | --- | --- | --- |",
  line("Rules (live)", rules),
  ...(model ? [line("Model, ONNX int8 (not shipped)", model)] : []),
  "",
  "«No help» counts a name as decided when its link is confident, or when it needs checking but a known teacher or student next to it makes one candidate likely (the pre-selected choice on `/parse`). «After choosing» assumes the user picks the right candidate wherever `/parse` offers a choice.",
  "",
  `Generated by \`pnpm tsx scripts/eval-e2e.ts\` on ${new Date().toISOString().slice(0, 10)}.`,
].join("\n");

console.log(table);
const write = arg("write");
if (write) {
  const doc = readFileSync(write, "utf8");
  const out = doc.replace(/<!-- e2e:start -->[\s\S]*<!-- e2e:end -->/, `<!-- e2e:start -->\n${table}\n<!-- e2e:end -->`);
  writeFileSync(write, out);
  console.log(`→ ${write}`);
}
