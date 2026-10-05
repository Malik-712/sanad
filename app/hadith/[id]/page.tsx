import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { ChainRow } from "@/components/hadith/ChainList";
import { HadithView, HadithViewFromUrl, type RouteItem } from "@/components/hadith/HadithView";
import { RoutePanelBody } from "@/components/hadith/RoutePanelBody";
import { TreePlaceholder } from "@/components/hadith/TreePlaceholder";
import { DemoTag } from "@/components/ui/DemoTag";
import { Diamond } from "@/components/ui/Diamond";
import { GoldFrame } from "@/components/ui/GoldFrame";
import { ChevronIcon } from "@/components/ui/icons";
import { countDefinite, countNoun, numberWord } from "@/lib/arabic/count";
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import { compilerIds, displayName, routeNumber, routeStatus } from "@/lib/data/derive";
import { getHadith, getHadiths, getNarrator } from "@/lib/data/load";
import type { Route } from "@/lib/data/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return getHadiths().map((h) => ({ id: h.id }));
}

export async function generateMetadata({ params }: PageProps<"/hadith/[id]">): Promise<Metadata> {
  const { id } = await params;
  const h = getHadith(id);
  return h ? { title: h.titleAr } : {};
}

// Chain from the Prophet ﷺ (top) down to the compiler, with the transmission word between each two names.
function chainOf(route: Route): { rows: ChainRow[]; links: string[] } {
  const top = [...route.chain].reverse();
  const rows = top.map((id) => {
    const n = getNarrator(id);
    return { id, name: n ? displayName(n) : id, role: n?.role ?? "narrator", href: `/narrator/${id}` } as ChainRow;
  });
  const sighas = route.sighas ?? [];
  const m = route.chain.length - 1;
  const links = top.slice(0, -1).map((_, j) => sighas[m - j - 1] ?? "");
  return { rows, links };
}

export default async function HadithPage({ params }: PageProps<"/hadith/[id]">) {
  const { id } = await params;
  const h = getHadith(id);
  if (!h) notFound();

  const total = h.routes.length;
  const counts = ar.hadith.counts(countNoun(total, "isnad"), countNoun(compilerIds(h).length, "compiler", "gen"));
  const routes: RouteItem[] = h.routes.map((route, i) => {
    const { rows, links } = chainOf(route);
    return {
      id: route.id,
      no: toArabicIndic(i + 1),
      title: ar.hadith.routeTitle(route.book.nameAr, routeNumber(route)),
      panelTitle: ar.hadith.panelTitle(route.book.nameAr, routeNumber(route)),
      panelEyebrow: ar.hadith.panelEyebrow(toArabicIndic(i + 1), total >= 3 ? numberWord(total, "gen") : toArabicIndic(total)),
      summary: route.isnadAr,
      status: routeStatus(route),
      body: <RoutePanelBody route={route} chain={rows} links={links} />,
    };
  });
  const viewProps = {
    routes,
    listLabel: countDefinite(total, "isnad"),
    tree: <TreePlaceholder />,
    disclaimer: (
      <p className="m-0 flex items-start gap-2.5 text-[14px] leading-[1.7]">
        <Diamond tone="green" className="mt-2" />
        {ar.disclaimerLine}
      </p>
    ),
  };

  return (
    <>
      <div className="ongreen bg-green text-parchment">
        <section className="relative flex flex-col gap-2.5 px-5 pt-1 pb-6 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-x-12 lg:gap-y-4 lg:px-12 lg:pt-7 lg:pb-9">
          <span className="hidden lg:block">
            <GoldFrame inset="12px 20px 14px" />
          </span>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1 self-start text-[14px] text-on-green-muted no-underline hover:text-parchment lg:hidden"
          >
            <ChevronIcon />
            {ar.hadith.back}
          </Link>
          <div className="flex min-w-0 flex-col gap-1.5 lg:flex-[1_1_560px]">
            <span className="hidden text-[14px] text-on-green-muted lg:block">{ar.hadith.eyebrow}</span>
            <h1 className="m-0 text-[26px] leading-[1.75] font-normal break-words lg:text-[34px] lg:leading-[1.6]">
              «{h.matnAr}»
            </h1>
            <p className="m-0 text-[14px] leading-[1.7] text-on-green-muted">
              {ar.hadith.matnFrom}:{" "}
              <a href={h.matnSource.url} target="_blank" rel="noopener noreferrer" className="text-parchment hover:text-parchment">
                {toArabicIndic(h.matnSource.book)}، {toArabicIndic(h.matnSource.number)}
              </a>
            </p>
            {h.matnVariants?.length ? (
              <details className="text-[14px] leading-[1.7] text-on-green-muted">
                <summary className="min-h-11 cursor-pointer content-center">{ar.hadith.variantsSummary}</summary>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {h.matnVariants.map((v) => (
                    <li key={v.sourceUrl + v.textAr}>
                      «{v.textAr}»: {v.note}{" "}
                      <a href={v.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-parchment hover:text-parchment">
                        {ar.hadith.variantSource}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
          <div className="flex flex-col items-start gap-2.5 lg:flex-[0_1_380px]">
            <p className="m-0 text-[15px] leading-[1.7] text-on-green-muted">{counts}</p>
            {h.demo ? <DemoTag onGreen /> : null}
          </div>
        </section>
      </div>

      <Suspense fallback={<HadithView {...viewProps} initial={routes[0]?.id ?? null} />}>
        <HadithViewFromUrl {...viewProps} />
      </Suspense>
    </>
  );
}
