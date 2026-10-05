import Link from "next/link";
import { Suspense } from "react";
import { HadithCard } from "@/components/home/HadithCard";
import { HeroTree } from "@/components/home/HeroTree";
import { HomeSearch, HomeSearchFromUrl } from "@/components/home/HomeSearch";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DemoTag } from "@/components/ui/DemoTag";
import { GoldFrame } from "@/components/ui/GoldFrame";
import { PasteIcon } from "@/components/ui/icons";
import { countNoun, numberWord } from "@/lib/arabic/count";
import { joinAr } from "@/lib/arabic/list";
import { ar } from "@/lib/copy/ar";
import { companionIds, compilerIds, displayName } from "@/lib/data/derive";
import { getHadiths, getNarrator, getNarratorMap } from "@/lib/data/load";
import type { Hadith } from "@/lib/data/types";
import { buildSearchEntry } from "@/lib/search/filter";

// The two «جرّب» suggestions: a hadith and a narrator, both read from data/.
const TRY_HADITH = "niyyah";
const TRY_NARRATOR = "yahya-ibn-said-al-ansari";

function names(ids: string[]): string[] {
  return ids.map((id) => {
    const n = getNarrator(id);
    return n ? displayName(n) : id;
  });
}

function compilersLine(h: Hadith): string {
  return joinAr(names(compilerIds(h)));
}

function narratedByLine(h: Hadith): string {
  const companions = companionIds(h);
  const who = companions.length <= 2 ? joinAr(names(companions)) : ar.home.companionsCount(numberWord(companions.length, "gen"));
  return ar.home.narratedBy(who, compilersLine(h));
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
        openLabel={ar.home.openTree(countNoun(h.routes.length, "isnad"))}
      />
    ),
  }));

  const heroHadith = hadiths.find((h) => h.id === TRY_HADITH) ?? hadiths[0];
  const tryNarrator = getNarrator(TRY_NARRATOR);
  const tryLinks = [
    ...(heroHadith ? [{ href: `/hadith/${heroHadith.id}`, label: heroHadith.titleAr }] : []),
    ...(tryNarrator ? [{ href: `/narrator/${tryNarrator.id}`, label: tryNarrator.nameAr }] : []),
  ];

  const between = (
    <Link href="/parse" className="flex min-h-14 items-center gap-3.5 text-ink no-underline hover:text-ink">
      <span className="flex size-10 flex-none items-center justify-center bg-green text-parchment">
        <PasteIcon />
      </span>
      <span className="flex flex-col gap-0.5">
        <b className="text-[16px] font-semibold text-green">{ar.home.pasteTitle}</b>
        <span className="text-[14px] text-muted">{ar.home.pasteText}</span>
      </span>
    </Link>
  );
  const demoTag = hadiths.some((h) => h.demo) ? <DemoTag /> : null;
  const searchProps = { entries, cards, tryLinks, between, demoTag };

  return (
    <>
      <div className="ongreen bg-green text-parchment">
        <section className="relative mx-auto flex max-w-[720px] flex-col gap-5 px-7 pt-10 pb-28">
          <GoldFrame inset="0 10px 10px" />
          <h1 className="m-0 text-[46px] leading-[1.22] font-bold">
            {ar.slogan}
          </h1>
          <p className="m-0 max-w-[300px] text-[16px] leading-[1.8] text-on-green-muted">{ar.home.intro}</p>
          {heroHadith ? (
            <figure className="m-0 mt-2 flex flex-col gap-2.5">
              <HeroTree />
              <figcaption className="text-[14px] leading-[1.7] text-on-green-muted">
                {ar.home.heroCaption(
                  heroHadith.titleAr,
                  countNoun(heroHadith.routes.length, "isnad"),
                  countNoun(compilerIds(heroHadith).length, "compiler", "gen"),
                )}
              </figcaption>
            </figure>
          ) : null}
        </section>
      </div>

      <Suspense fallback={<HomeSearch {...searchProps} initialQuery="" />}>
        <HomeSearchFromUrl {...searchProps} />
      </Suspense>

      <SiteFooter variant="green" />
    </>
  );
}
