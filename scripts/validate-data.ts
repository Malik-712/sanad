// Minimal data check run before every build (prebuild).
// Session B replaces the hand-written checks with the zod schemas in lib/data/schema.ts.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = join(process.cwd(), "data");
const errors: string[] = [];

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    errors.push(`${path}: invalid JSON (${(err as Error).message})`);
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// Narrators
const narratorsPath = join(dataDir, "narrators.json");
const narrators = readJson(narratorsPath);
const narratorIds = new Set<string>();
if (narrators !== undefined && !Array.isArray(narrators)) {
  errors.push(`${narratorsPath}: expected an array`);
} else if (Array.isArray(narrators)) {
  narrators.forEach((n, i) => {
    if (!isRecord(n) || !nonEmptyString(n.id)) {
      errors.push(`${narratorsPath}[${i}]: missing id`);
      return;
    }
    if (narratorIds.has(n.id)) errors.push(`${narratorsPath}: duplicate narrator id "${n.id}"`);
    narratorIds.add(n.id);
  });
}

// Hadiths
const hadithsDir = join(dataDir, "hadiths");
const hadithFiles = readdirSync(hadithsDir).filter((f) => f.endsWith(".json"));
const hadithIds = new Set<string>();
const routeIds = new Set<string>();
let routeCount = 0;

for (const file of hadithFiles) {
  const path = join(hadithsDir, file);
  const hadith = readJson(path);
  if (hadith === undefined) continue;
  if (!isRecord(hadith) || !nonEmptyString(hadith.id)) {
    errors.push(`${path}: missing id`);
    continue;
  }
  if (`${hadith.id}.json` !== file) errors.push(`${path}: id "${hadith.id}" does not match the file name`);
  if (hadithIds.has(hadith.id)) errors.push(`${path}: duplicate hadith id "${hadith.id}"`);
  hadithIds.add(hadith.id);

  if (!Array.isArray(hadith.routes) || hadith.routes.length === 0) {
    errors.push(`${path}: no routes`);
    continue;
  }
  hadith.routes.forEach((route, i) => {
    const where = `${path} routes[${i}]`;
    if (!isRecord(route) || !nonEmptyString(route.id)) {
      errors.push(`${where}: missing id`);
      return;
    }
    routeCount++;
    if (routeIds.has(route.id)) errors.push(`${where}: duplicate route id "${route.id}"`);
    routeIds.add(route.id);
    // CLAUDE.md: every route has a source (book, number, URL).
    if (!nonEmptyString(route.url)) errors.push(`${where} (${route.id}): missing source url`);
    if (!nonEmptyString(route.number)) errors.push(`${where} (${route.id}): missing number`);
    if (!isRecord(route.book) || !nonEmptyString(route.book.nameAr)) {
      errors.push(`${where} (${route.id}): missing book`);
    }
    if (!Array.isArray(route.chain) || route.chain.length === 0) {
      errors.push(`${where} (${route.id}): empty chain`);
    } else {
      for (const id of route.chain) {
        if (typeof id !== "string" || !narratorIds.has(id)) {
          errors.push(`${where} (${route.id}): unknown narrator "${String(id)}"`);
        }
      }
    }
  });
}

if (errors.length > 0) {
  console.error(`validate:data failed with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `validate:data OK — ${hadithIds.size} hadiths, ${routeCount} routes, ${narratorIds.size} narrators`,
);
