// Runs before every build (prebuild). The rules live in lib/data/validate.ts.
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { type DataFile, validateData } from "../lib/data/validate";

const dataDir = resolve(process.argv[2] ?? "data");

function read(path: string): DataFile {
  try {
    return { file: path, json: JSON.parse(readFileSync(path, "utf8")) };
  } catch (err) {
    console.error(`validate:data failed: ${path}: invalid JSON (${(err as Error).message})`);
    process.exit(1);
  }
}

const narrators = read(join(dataDir, "narrators.json"));
const hadithDir = join(dataDir, "hadiths");
const hadiths = readdirSync(hadithDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => read(join(hadithDir, f)));

const errors = validateData(narrators, hadiths);
if (errors.length > 0) {
  console.error(`validate:data failed with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const routes = hadiths.reduce((n, h) => n + ((h.json as { routes: unknown[] }).routes?.length ?? 0), 0);
console.log(
  `validate:data OK — ${hadiths.length} hadiths, ${routes} routes, ${(narrators.json as unknown[]).length} narrators`,
);
