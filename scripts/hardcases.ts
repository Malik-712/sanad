// Runs tests/hard-cases.json through the /parse pipeline N times, checks the runs give identical output
// (SHA-256 of each run), checks each case's expectations, and writes docs/HARD_CASES.md.
//   pnpm hardcases --runs 3
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { toArabicIndic } from "@/lib/arabic/digits";
import type { Hadith, Narrator } from "@/lib/data/types";
import { analyzeIsnad, findRoute } from "@/lib/linker/analyze";
import { buildParseData } from "@/lib/linker/parseData";

type Expect = {
  problem?: string;
  names?: number;
  states?: Record<string, string>;
  candidatesAtLeast?: Record<string, number>;
  notHigh?: number[];
  match?: string | null;
  sighas?: string[];
  namesText?: string[];
  tahwil?: boolean;
  parallel?: boolean;
};
type Case = {
  id: string;
  title: string;
  input: {
    text?: string;
    repeat?: number;
    data?: { hadith: string; route?: string; matn?: boolean };
    remove?: string;
    stripMarks?: boolean;
  };
  expect: Expect;
};

const runs = Number(process.argv[process.argv.indexOf("--runs") + 1] || 3);
const hadiths = readdirSync("data/hadiths")
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => JSON.parse(readFileSync(join("data/hadiths", f), "utf8")) as Hadith);
const narrators = JSON.parse(readFileSync("data/narrators.json", "utf8")) as Narrator[];
const data = buildParseData(hadiths, narrators);
const { cases } = JSON.parse(readFileSync("tests/hard-cases.json", "utf8")) as { cases: Case[] };

const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭ]/g;

function inputOf(c: Case): string {
  let text = c.input.text ?? "";
  if (c.input.data) {
    const h = hadiths.find((x) => x.id === c.input.data!.hadith);
    if (!h) throw new Error(`${c.id}: no hadith ${c.input.data.hadith}`);
    if (c.input.data.matn) text = h.matnAr;
    else {
      const r = h.routes.find((x) => x.id === c.input.data!.route);
      if (!r) throw new Error(`${c.id}: no route ${c.input.data.route}`);
      text = r.isnadAr;
    }
  }
  if (c.input.remove) {
    if (!text.includes(c.input.remove)) throw new Error(`${c.id}: text to remove not found`);
    text = text.replace(c.input.remove, "");
  }
  if (c.input.stripMarks) text = text.replace(MARKS, "");
  if (c.input.repeat) text = text.repeat(c.input.repeat);
  return text;
}

function run(c: Case) {
  const a = analyzeIsnad(inputOf(c), data.index);
  if (!a.ok) return { problem: a.problem };
  const found = findRoute(a.parse, a.links, data.routes);
  return {
    names: a.parse.names.map((n) => n.text),
    sighas: a.parse.sighas,
    tahwil: a.parse.tahwil,
    parallel: a.parse.parallel,
    links: a.links.map((l) => ({ state: l.state, best: l.best?.narratorId ?? null, candidates: l.candidates.map((x) => x.narratorId), byContext: l.byContext })),
    match: found?.route.routeId ?? null,
  };
}
type Out = ReturnType<typeof run>;

function check(e: Expect, o: Out): string[] {
  const fails: string[] = [];
  if ("problem" in o) {
    if (e.problem !== o.problem) fails.push(`problem ${o.problem}, expected ${e.problem ?? "none"}`);
    return fails;
  }
  if (e.problem) fails.push(`no input problem, expected ${e.problem}`);
  if (e.names !== undefined && o.names.length !== e.names) fails.push(`${o.names.length} names, expected ${e.names}`);
  for (const [i, s] of Object.entries(e.states ?? {})) if (o.links[+i]?.state !== s) fails.push(`name ${i}: ${o.links[+i]?.state}, expected ${s}`);
  for (const [i, n] of Object.entries(e.candidatesAtLeast ?? {}))
    if ((o.links[+i]?.candidates.length ?? 0) < n) fails.push(`name ${i}: ${o.links[+i]?.candidates.length} candidates, expected ≥ ${n}`);
  for (const i of e.notHigh ?? []) if (o.links[i]?.state === "high") fails.push(`name ${i} linked with high confidence`);
  if (e.match === null && o.match) fails.push(`matched ${o.match}, expected no match`);
  if (typeof e.match === "string" && e.match !== "any" && o.match !== e.match) fails.push(`match ${o.match}, expected ${e.match}`);
  if (e.match === "any" && !o.match) fails.push("no match, expected one");
  if (e.sighas && JSON.stringify(o.sighas) !== JSON.stringify(e.sighas)) fails.push(`sighas ${o.sighas.join("، ")}`);
  if (e.namesText && JSON.stringify(o.names) !== JSON.stringify(e.namesText)) fails.push(`names ${o.names.join("، ")}`);
  if (e.tahwil && !o.tahwil.length) fails.push("no «ح» found");
  if (e.parallel && !o.parallel.length) fails.push("no parallel names found");
  return fails;
}

function describeExpect(e: Expect): string {
  const p: string[] = [];
  if (e.problem) p.push(`message: ${e.problem}`);
  if (e.names !== undefined) p.push(`${e.names} names`);
  for (const [i, s] of Object.entries(e.states ?? {})) p.push(`name ${+i + 1}: ${s}`);
  for (const [i, n] of Object.entries(e.candidatesAtLeast ?? {})) p.push(`name ${+i + 1}: ≥ ${n} choices`);
  for (const i of e.notHigh ?? []) p.push(`name ${i + 1}: not high`);
  if (e.match === null) p.push("no match card");
  else if (e.match === "any") p.push("a match card");
  else if (e.match) p.push(`match ${e.match}`);
  if (e.sighas) p.push(`sighas ${e.sighas.join("، ")}`);
  if (e.namesText) p.push(`names ${e.namesText.join("، ")}`);
  if (e.tahwil) p.push("«ح» found");
  if (e.parallel) p.push("parallel names found");
  return p.join("; ");
}

function describeOut(o: Out): string {
  if ("problem" in o) return `message: ${o.problem}`;
  const states = o.links.map((l) => l.state).join(" · ");
  return `${o.names.length} names (${states}); ${o.match ? `match ${o.match}` : "no match card"}${o.tahwil.length ? "; «ح»" : ""}${o.parallel.length ? "; parallel" : ""}`;
}

const hashes: string[] = [];
let outputs: Out[] = [];
for (let r = 0; r < runs; r++) {
  outputs = cases.map(run);
  hashes.push(createHash("sha256").update(JSON.stringify(outputs)).digest("hex"));
}
const same = hashes.every((h) => h === hashes[0]);
const rows = cases.map((c, i) => ({ c, o: outputs[i]!, fails: check(c.expect, outputs[i]!) }));
const passed = rows.filter((r) => !r.fails.length).length;

const md = [
  "# Hard cases — /parse",
  "",
  `Each case in \`tests/hard-cases.json\` goes through the same pipeline as the live \`/parse\` page (rule parser → linker → chain match, \`lib/linker/analyze.ts\`). Inputs are made up, or read from \`data/\` at run time (word for word, with the source stored there). The trained model is not shipped (see \`docs/EVALUATION.md\`), so only the live reader is run here.`,
  "",
  `Runs: ${runs}. Identical output in every run: **${same ? "yes" : "NO"}**. Cases passed: **${passed} / ${cases.length}**.`,
  "",
  "## Summary",
  "",
  "What a reader of an isnad gets wrong most often, and what Sanad does in each case:",
  "",
  "- **Wrong input** (empty text, more than 2,000 characters, ordinary prose, a matn with no isnad): Sanad shows a plain Arabic message that says what to paste instead, and draws nothing.",
  "- **A name it cannot place** (an unknown narrator, a short name such as «سفيان» or «حماد»): Sanad never picks silently. An unknown name is marked «لا مصدر بعد» and the chain goes on. A bare «سفيان», which matches two records (Ibn ʿUyayna and al-Thawri), is marked «يحتاج تحققًا» and the user chooses. A bare «حماد» is marked «لا مصدر بعد»: our data has one Hammad record and the bare form is not one of its aliases, so Sanad does not stretch the match.",
  "- **A chain that is not one of ours** (a narrator removed from a real isnad, or a made-up chain of fifteen names): every name is still read, but no match card appears, so a broken chain is never shown as a known route.",
  "- **The way isnads are written** (full tashkeel or none, the short forms «ثنا، نا، أنا», mixed honorifics, «ح» between two isnads, two teachers named together «فلان وابن فلان»): the same isnad is read the same way, honorifics are dropped from names, and the real route is still found.",
  "- **Repeatability:** the whole set is run three times; the SHA-256 hash of the full output must be the same each time, so a result a user sees today is the result a judge sees tomorrow.",
  "",
  "## Runs and cases",
  "",
  "| Run | SHA-256 of all outputs |",
  "| --- | --- |",
  ...hashes.map((h, i) => `| ${i + 1} | \`${h}\` |`),
  "",
  "| # | Case | Expected | Actual | Result |",
  "| --- | --- | --- | --- | --- |",
  ...rows.map(
    ({ c, o, fails }, i) =>
      `| ${toArabicIndic(i + 1)} | ${c.title} (\`${c.id}\`) | ${describeExpect(c.expect)} | ${describeOut(o)} | ${fails.length ? `fail: ${fails.join("; ")}` : "pass"} |`,
  ),
  "",
  "States: `high` = confident link; `check` = «يحتاج تحققًا» with choices; `none` = «لا مصدر بعد». Messages: `empty`, `tooLong`, `notIsnad` (the Arabic texts are in `lib/copy/ar.ts`).",
  "",
  `Generated by \`pnpm hardcases --runs ${runs}\` on ${new Date().toISOString().slice(0, 10)}.`,
  "",
].join("\n");
writeFileSync("docs/HARD_CASES.md", md);
console.log(`${passed}/${cases.length} passed; ${runs} runs identical: ${same}`);
for (const r of rows) if (r.fails.length) console.log(`FAIL ${r.c.id}: ${r.fails.join("; ")}`);
if (!same) process.exit(1);
