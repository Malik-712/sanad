// Turns the Lighthouse JSON reports in ml/out/lighthouse/ (bash scripts/lighthouse.sh) into the markdown table of
// docs/EVALUATION.md (c): the median of the runs for each page and form factor. Nothing is typed by hand.
//   node scripts/lighthouse-table.mjs            print the table
//   node scripts/lighthouse-table.mjs --write    replace the block between the lighthouse markers in docs/EVALUATION.md
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const dir = "ml/out/lighthouse";
const pages = [
  ["_home", "/"],
  ["_c_bukhari_1", "/c/bukhari/1"],
  ["_hadith_niyyah", "/hadith/niyyah"],
  ["_narrator_umar-ibn-al-khattab", "/narrator/umar-ibn-al-khattab"],
  ["_sources", "/sources"],
  ["_about", "/about"],
];
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const files = readdirSync(dir);
const rows = [];
let version = "";
let when = "";
for (const [name, path] of pages)
  for (const ff of ["mobile", "desktop"]) {
    const rs = files
      .filter((f) => f.startsWith(`${ff}${name}-r`) && f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(`${dir}/${f}`, "utf8")));
    if (!rs.length) continue;
    version = rs[0].lighthouseVersion;
    when = rs[0].fetchTime.slice(0, 10);
    const cat = (k) => rs.map((r) => Math.round(r.categories[k].score * 100));
    const num = (id) => med(rs.map((r) => r.audits[id].numericValue));
    rows.push(
      `| \`${path}\` | ${ff} | ${med(cat("performance"))} | ${med(cat("accessibility"))} | ${med(cat("best-practices"))} | ${med(cat("seo"))} | ${cat("performance").join(" / ")} | ${Math.round(num("total-byte-weight") / 1024)} KB | ${(num("largest-contentful-paint") / 1000).toFixed(1)} s | ${Math.round(num("total-blocking-time"))} ms | ${num("cumulative-layout-shift").toFixed(3)} |`,
    );
  }
const table = [
  `Lighthouse ${version} in headless Microsoft Edge on https://sanad-pi-five.vercel.app, **3 runs per page and form factor; the median is reported** (\`bash scripts/lighthouse.sh https://sanad-pi-five.vercel.app 3\`, then \`node scripts/lighthouse-table.mjs --write\`). Measured on ${when}, after the explorer was deployed. Mobile uses Lighthouse's default throttled profile; desktop uses \`--preset=desktop\`. Page weight is what loads before the visitor does anything: the 12 MB model and the 14 MB wasm download only when the visitor first uses the paste box.`,
  "",
  "| Page | Form factor | Performance | Accessibility | Best practices | SEO | Performance, 3 runs | Page weight | LCP | TBT | CLS |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...rows,
].join("\n");
console.log(table);
if (process.argv.includes("--write")) {
  const doc = readFileSync("docs/EVALUATION.md", "utf8");
  const block = `<!-- lighthouse:start -->\n${table}\n<!-- lighthouse:end -->`;
  writeFileSync("docs/EVALUATION.md", doc.replace(/<!-- lighthouse:start -->[\s\S]*<!-- lighthouse:end -->/, block));
}
