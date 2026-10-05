// Client-side search for the Home list: the server builds one folded string per hadith,
// the client keeps the ids whose string contains every word of the query.
import { normalizeArabic } from "@/lib/arabic/normalize";
import type { Hadith, Narrator } from "@/lib/data/types";

export type SearchEntry = { id: string; text: string };

export function buildSearchEntry(h: Hadith, narrators: Map<string, Narrator>): SearchEntry {
  const names = new Set<string>();
  for (const route of h.routes) {
    for (const id of route.chain) {
      const n = narrators.get(id);
      if (!n) continue;
      names.add(n.nameAr);
      names.add(n.fullNameAr);
      for (const alias of n.aliasesAr) names.add(alias);
    }
  }
  return { id: h.id, text: normalizeArabic([h.titleAr, h.matnAr, ...names].join(" ")) };
}

export function filterEntries(entries: SearchEntry[], query: string): string[] {
  const words = normalizeArabic(query).split(" ").filter(Boolean);
  if (words.length === 0) return entries.map((e) => e.id);
  return entries.filter((e) => words.every((w) => e.text.includes(w))).map((e) => e.id);
}
