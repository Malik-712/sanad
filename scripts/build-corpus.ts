// Turns the pinned corpus + the model's reading of every isnad (ml/index_corpus.py) into the static files the
// browser loads, and writes corpus/MANIFEST.json (what was built from what, with hashes and sizes).
//   python ml/index_corpus.py     (downloads at the pinned commit, reads isnads with the model)
//   pnpm tsx scripts/build-corpus.ts
// Shipped (public/corpus/): names.json (name dictionary + each hadith's name ids), idx.json (word → hadith ids),
// docs/<book>-<k>.json (the isnad text and the names read from it, for 200 hadiths each). Full hadith text is NOT shipped (fetched from the pinned source).
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CORPUS_BOOKS, CORPUS_PIN } from "../lib/corpus/books";
import { distinctive } from "../lib/corpus/names";
import { tokenize } from "../lib/parser/tokenize";

const OUT = "public/corpus";
const CHUNK = 200;
const MAX_ISNAD_CHARS = 420;
const BUDGET_BYTES = 40 * 1024 * 1024;

type Raw = { hadiths: { hadithnumber: number; text: string }[] };
type NamesLine = { n: number; names: string[] };

/** The isnad part of the text: from the start to just before the Prophet ﷺ is mentioned, capped at a word boundary. */
function isnadText(text: string): string {
  const toks = tokenize(text);
  let end = text.length;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]!.text;
    if ((t === "رسول" && toks[i + 1]?.text === "الله") || t === "النبي" || t === "نبي") {
      end = toks[i]!.start;
      break;
    }
  }
  let s = text.slice(0, end).replace(/\s+/g, " ").trim();
  if (s.length > MAX_ISNAD_CHARS) s = s.slice(0, s.lastIndexOf(" ", MAX_ISNAD_CHARS)) + " …";
  return s;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "docs"), { recursive: true });

const dict = new Map<string, number>();
const hadithNames: number[][] = [];
const postings = new Map<string, number[]>();
const books: { id: string; count: number; offset: number; sha256: string; chunks: number }[] = [];

for (const book of CORPUS_BOOKS) {
  const rawPath = `corpus/raw/${book.id}.min.json`;
  const rawBytes = readFileSync(rawPath);
  const raw = JSON.parse(rawBytes.toString("utf8")) as Raw;
  const lines = readFileSync(`corpus/names/${book.id}.jsonl`, "utf8").trim().split("\n").map((l) => JSON.parse(l) as NamesLine);
  if (lines.length !== raw.hadiths.length) throw new Error(`${book.id}: ${lines.length} names lines vs ${raw.hadiths.length} hadiths`);
  const offset = hadithNames.length;
  const numbers: number[] = [];
  const texts: string[] = [];
  const nameLists: string[][] = [];
  raw.hadiths.forEach((h, i) => {
    const line = lines[i]!;
    if (line.n !== h.hadithnumber) throw new Error(`${book.id}: number mismatch at ${i}`);
    const gid = offset + i;
    const ids = line.names.map((nm) => {
      let id = dict.get(nm);
      if (id === undefined) dict.set(nm, (id = dict.size));
      return id;
    });
    hadithNames.push(ids);
    for (const w of new Set(line.names.flatMap(distinctive))) {
      const list = postings.get(w) ?? [];
      list.push(gid);
      postings.set(w, list);
    }
    numbers.push(h.hadithnumber);
    texts.push(isnadText(h.text));
    nameLists.push(line.names);
  });
  const chunks = Math.ceil(numbers.length / CHUNK);
  for (let k = 0; k < chunks; k++) {
    const part = { n: numbers.slice(k * CHUNK, (k + 1) * CHUNK), t: texts.slice(k * CHUNK, (k + 1) * CHUNK), m: nameLists.slice(k * CHUNK, (k + 1) * CHUNK) };
    writeFileSync(join(OUT, "docs", `${book.id}-${k}.json`), JSON.stringify(part));
  }
  books.push({ id: book.id, count: numbers.length, offset, sha256: createHash("sha256").update(rawBytes).digest("hex"), chunks });
}

// Names as a list ordered by id (dictionary order = first appearance, which is fixed by the input order).
const dictList = [...dict.entries()].sort((a, b) => a[1] - b[1]).map(([nm]) => nm);
writeFileSync(join(OUT, "names.json"), JSON.stringify({ dict: dictList, h: hadithNames }));
// Postings as increasing id lists, delta-encoded (small numbers compress well).
const idx: Record<string, number[]> = {};
for (const [w, ids] of [...postings.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  let prev = 0;
  idx[w] = ids.map((id) => {
    const d = id - prev;
    prev = id;
    return d;
  });
}
writeFileSync(join(OUT, "idx.json"), JSON.stringify(idx));

const files: Record<string, number> = {};
let total = 0;
const walk = (dir: string) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else {
      const size = statSync(p).size;
      total += size;
      files[p.replace(/\\/g, "/")] = size;
    }
  }
};
walk(OUT);
const manifest = {
  corpus: "fawazahmed0/hadith-api",
  repository: "https://github.com/fawazahmed0/hadith-api",
  pinnedCommit: CORPUS_PIN,
  editions: "ara-<book> (Arabic, with diacritics), as published; text origin and licence are not stated by the corpus",
  reader: "narrator names read from each isnad by the trained tagger (ml/index_corpus.py, ONNX int8), cut before the Prophet ﷺ is mentioned",
  total: books.reduce((n, b) => n + b.count, 0),
  books,
  names: dictList.length,
  indexedWords: Object.keys(idx).length,
  shippedBytes: total,
  chunkSize: CHUNK,
};
writeFileSync("corpus/MANIFEST.json", JSON.stringify(manifest, null, 2) + "\n");
// The page needs the book list, counts and offsets; shipped without the hashes.
writeFileSync(
  join(OUT, "manifest.json"),
  JSON.stringify({ pinnedCommit: manifest.pinnedCommit, total: manifest.total, chunkSize: CHUNK, books: books.map(({ id, count, offset, chunks }) => ({ id, count, offset, chunks })) }),
);
console.log(`${manifest.total} hadiths · ${manifest.names} names · ${manifest.indexedWords} words · ${(total / 1048576).toFixed(1)} MB in ${Object.keys(files).length} files`);
if (total > BUDGET_BYTES) {
  console.error(`over the ${BUDGET_BYTES / 1048576} MB budget`);
  process.exit(1);
}
const biggest = Object.entries(files).sort((a, b) => b[1] - a[1]).slice(0, 3);
console.log("largest:", biggest.map(([f, s]) => `${f} ${(s / 1048576).toFixed(2)} MB`).join(", "));
