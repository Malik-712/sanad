// Crawls the live site from Home and checks every internal page and link (status 200), then every external
// link found (status < 400, following redirects). Prints a summary; exits 1 on any broken internal link.
//   node scripts/check-links.mjs [base-url]
import { readdirSync, readFileSync } from "node:fs";

const base = (process.argv[2] ?? "https://sanad-pi-five.vercel.app").replace(/\/$/, "");
const seen = new Map(); // internal path -> status
const external = new Map(); // url -> pages where found
// Every page the data defines (many narrator pages are linked only from interactive panels).
const hadithIds = readdirSync("data/hadiths").filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
const narratorIds = JSON.parse(readFileSync("data/narrators.json", "utf8")).map((n) => n.id);
const queue = ["/", "/parse", "/about", "/does-not-exist-404-check", ...hadithIds.map((id) => `/hadith/${id}`), ...narratorIds.map((id) => `/narrator/${id}`)];

async function get(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { redirect: "follow", headers: { "user-agent": "sanad-link-check" } });
      return { status: r.status, text: r.headers.get("content-type")?.includes("html") ? await r.text() : "" };
    } catch (e) {
      if (attempt === 2) return { status: 0, text: "", error: String(e) };
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
}

while (queue.length) {
  const batch = queue.splice(0, 8);
  await Promise.all(
    batch.map(async (path) => {
      if (seen.has(path)) return;
      seen.set(path, null);
      const { status, text } = await get(base + path);
      seen.set(path, status);
      for (const m of text.matchAll(/href="([^"#]+)(#[^"]*)?"/g)) {
        const href = m[1].replace(/&amp;/g, "&");
        if (href.startsWith("/_next") || href.endsWith(".svg") || href.endsWith(".ico") || href.endsWith(".css")) continue;
        if (href.startsWith("/")) {
          const p = href.split("?")[0];
          if (!seen.has(p) && !queue.includes(p)) queue.push(p);
        } else if (/^https?:\/\//.test(href)) {
          if (!external.has(href)) external.set(href, new Set());
          external.get(href).add(path);
        }
      }
    }),
  );
}

const internalBad = [...seen].filter(([p, s]) => (p === "/does-not-exist-404-check" ? s !== 404 : s !== 200));
console.log(`internal pages: ${seen.size - 1} checked, ${internalBad.length} broken`);
for (const [p, s] of internalBad) console.log(`  BROKEN ${s} ${p}`);
console.log(`404 page for an unknown path: ${seen.get("/does-not-exist-404-check")}`);

const ext = [...external.keys()];
const extBad = [];
for (let i = 0; i < ext.length; i += 4) {
  await Promise.all(
    ext.slice(i, i + 4).map(async (u) => {
      const { status, error } = await get(u);
      if (!(status >= 200 && status < 400)) extBad.push([u, status, error, [...external.get(u)].slice(0, 2)]);
    }),
  );
}
const hosts = {};
for (const u of ext) hosts[new URL(u).host] = (hosts[new URL(u).host] ?? 0) + 1;
console.log(`external links: ${ext.length} (${Object.entries(hosts).map(([h, n]) => `${h} ${n}`).join(", ")}), ${extBad.length} not reachable`);
for (const [u, s, e, on] of extBad) console.log(`  EXTERNAL ${s} ${u} ${e ?? ""} (on ${on.join(", ")})`);
process.exit(internalBad.length ? 1 : 0);
