// Reads data/ at build time (server only). Pages are generated statically from these files.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import type { Hadith, Narrator } from "./types";

const dataDir = join(process.cwd(), "data");

// The order of the featured list on Home, as in the design.
const FEATURED_ORDER = ["niyyah", "man-kadhaba", "al-din-al-nasiha", "la-yuminu", "buniya-al-islam"];

function rank(id: string): number {
  const i = FEATURED_ORDER.indexOf(id);
  return i === -1 ? FEATURED_ORDER.length : i;
}

export const getHadiths = cache((): Hadith[] => {
  const dir = join(dataDir, "hadiths");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as Hadith)
    .sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id));
});

export const getHadith = cache((id: string): Hadith | undefined => getHadiths().find((h) => h.id === id));

export const getNarratorMap = cache((): Map<string, Narrator> => {
  const list = JSON.parse(readFileSync(join(dataDir, "narrators.json"), "utf8")) as Narrator[];
  return new Map(list.map((n) => [n.id, n]));
});

export const getNarrators = cache((): Narrator[] => [...getNarratorMap().values()]);

export const getNarrator = cache((id: string): Narrator | undefined => getNarratorMap().get(id));
