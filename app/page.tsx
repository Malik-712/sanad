import { Suspense } from "react";
import { HadithCard } from "@/components/home/HadithCard";
import { HomeSearch, HomeSearchFromUrl } from "@/components/home/HomeSearch";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { countNoun, numberWord } from "@/lib/arabic/count";
import { joinAr } from "@/lib/arabic/list";
import { ar } from "@/lib/copy/ar";
import { companionIds, compilerIds, displayName, matnRoute, routeNumber } from "@/lib/data/derive";
import { getHadiths, getNarrator, getNarratorMap } from "@/lib/data/load";
import type { Hadith } from "@/lib/data/types";
import { buildSearchEntry } from "@/lib/search/filter";

function names(ids: string[]): string[] {
  return ids.map((id) => {
    const n = getNarrator(id);
    return n ? displayName(n) : id;
  });
}

function narratedByLine(h: Hadith): string {
  const companions = companionIds(h);
  const who = companions.length <= 2 ? joinAr(names(companions)) : ar.home.companionsCount(numberWord(companions.length, "gen"));
  return ar.home.narratedBy(who, joinAr(names(compilerIds(h))));
}

// Book and number of the route that carries the matn shown on the hadith page, and the isnad count.
function sourceLine(h: Hadith): string {
  const r = matnRoute(h);
  return ar.home.sourceLine(r.book.nameAr, routeNumber(r), countNoun(h.routes.length, "isnad"));
}

export default function Home() {
  const hadiths = getHadiths();
  const narrators = getNarratorMap();
  const entries = hadiths.map((h) => buildSearchEntry(h, narrators));
  const cards = hadiths.map((h) => ({
    id: h.id,
    card: (
      <HadithCard
        href={`/hadith/${h.id}`}
        title={h.titleAr}
        meta={narratedByLine(h)}
        sourceLine={sourceLine(h)}
        openLabel={ar.home.openTree}
      />
    ),
  }));
  const props = { entries, cards };

  return (
    <>
      <Suspense fallback={<HomeSearch {...props} initialQuery="" />}>
        <HomeSearchFromUrl {...props} />
      </Suspense>
      <SiteFooter variant="green" />
    </>
  );
}
