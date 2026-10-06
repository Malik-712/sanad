import { ar } from "@/lib/copy/ar";
import { displayName, routeNumber } from "@/lib/data/derive";
import type { Hadith, Narrator, Role } from "@/lib/data/types";
import { commonLink } from "@/lib/isnad/analyze";
import type { MatchRoute } from "@/lib/isnad/chainMatch";
import { buildGraph } from "@/lib/isnad/graph";
import { chainEdges, type LinkIndex } from "./linker";

// The small, serialisable slice of data/ that /parse needs in the browser (no fetch: it is passed as props).
export type Person = { name: string; role: Role };

export type ParseData = {
  index: LinkIndex;
  routes: MatchRoute[];
  people: Record<string, Person>;
  /** The meeting point (common link) of each hadith's tree, from the isnad engine. */
  commonLinks: Record<string, string | null>;
  /** «جرّب مثالًا»: one isnad from data/, word for word, with where it is from. */
  sample: { text: string; label: string } | null;
};

const SAMPLE = { hadith: "niyyah", route: "bukhari-1" };

export function buildParseData(hadiths: Hadith[], narrators: Narrator[]): ParseData {
  const index: LinkIndex = {
    narrators: narrators.map(({ id, nameAr, fullNameAr, aliasesAr, role }) => ({ id, nameAr, fullNameAr, aliasesAr, role })),
    edges: chainEdges(hadiths.flatMap((h) => h.routes.map((r) => r.chain))),
  };
  const routes: MatchRoute[] = hadiths.flatMap((h) =>
    h.routes.map((r, i) => ({
      hadithId: h.id,
      hadithTitle: h.titleAr,
      routeId: r.id,
      chain: r.chain,
      index: i,
      total: h.routes.length,
      label: ar.hadith.routeTitle(r.book.nameAr, routeNumber(r)),
    })),
  );
  const people = Object.fromEntries(narrators.map((n) => [n.id, { name: displayName(n), role: n.role }]));
  const h = hadiths.find((x) => x.id === SAMPLE.hadith);
  const r = h?.routes.find((x) => x.id === SAMPLE.route);
  const sample = r ? { text: r.isnadAr, label: ar.hadith.routeTitle(r.book.nameAr, routeNumber(r)) } : null;
  const map = new Map(narrators.map((n) => [n.id, n]));
  const commonLinks = Object.fromEntries(hadiths.map((x) => [x.id, commonLink(buildGraph(x, map))]));
  return { index, routes, people, commonLinks, sample };
}
