// The counts sentence under a hadith («ثمانية أسانيد عند مصنِّفَين، تلتقي كلها عند …»), built from the engine.
import { countNoun, numberWord } from "@/lib/arabic/count";
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import { compilerIds, displayName } from "@/lib/data/derive";
import type { Hadith, Narrator } from "@/lib/data/types";
import type { Analysis } from "./analyze";
import type { IsnadGraph } from "./graph";

export function countsSentence(h: Hadith, graph: IsnadGraph, analysis: Analysis, narrators: Map<string, Narrator>): string {
  const total = analysis.totalRoutes;
  const routes = countNoun(total, "isnad");
  const compilers = countNoun(compilerIds(h).length, "compiler", "gen");
  const madar = analysis.commonLink;
  const record = madar ? narrators.get(madar) : undefined;
  if (!madar || !record) return ar.hadith.counts(routes, compilers);
  const name = displayName(record);
  const through = graph.nodes.get(madar)?.routeIds.length ?? 0;
  if (through === total) return ar.hadith.countsMeetAll(routes, compilers, name);
  const some = through >= 3 ? numberWord(through) : toArabicIndic(through);
  return ar.hadith.countsMeetSome(routes, compilers, some, name);
}
