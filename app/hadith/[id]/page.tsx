import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { ChainRow } from "@/components/hadith/ChainList";
import { HadithView, HadithViewFromUrl, type NarratorItem, type RouteItem } from "@/components/hadith/HadithView";
import { RoutePanelBody } from "@/components/hadith/RoutePanelBody";
import { NarratorPanelBody } from "@/components/panels/NarratorPanelBody";
import { DemoTag } from "@/components/ui/DemoTag";
import { Diamond } from "@/components/ui/Diamond";
import { GoldFrame } from "@/components/ui/GoldFrame";
import { buttonOnGreen } from "@/components/ui/buttons";
import { ChevronIcon } from "@/components/ui/icons";
import { countDefinite, countNoun, numberWord } from "@/lib/arabic/count";
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import { displayName, matnRoute, routeNumber, routeStatus, volumePage } from "@/lib/data/derive";
import { getHadith, getHadiths, getNarrator, getNarratorMap } from "@/lib/data/load";
import type { Route } from "@/lib/data/types";
import { analyze } from "@/lib/isnad/analyze";
import { buildGraph } from "@/lib/isnad/graph";
import { DESKTOP, layoutTree, MOBILE } from "@/lib/isnad/layout";
import { countsSentence } from "@/lib/isnad/summary";

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
  const source = matnRoute(h);
  const narratorMap = getNarratorMap();
  const graph = buildGraph(h, narratorMap);
  const analysis = analyze(graph);
  const counts = countsSentence(h, graph, analysis, narratorMap);
  const totalWord = total >= 3 ? numberWord(total, "gen") : toArabicIndic(total);
  const routes: RouteItem[] = h.routes.map((route, i) => {
    const { rows, links } = chainOf(route);
    return {
      id: route.id,
      no: toArabicIndic(i + 1),
      title: ar.hadith.routeTitle(route.book.nameAr, routeNumber(route)),
      panelTitle: ar.hadith.panelTitle(route.book.nameAr, routeNumber(route)),
      panelEyebrow: ar.hadith.panelEyebrow(toArabicIndic(i + 1), totalWord),
      summary: route.isnadAr,
      status: routeStatus(route),
      chain: route.chain,
      body: <RoutePanelBody route={route} chain={rows} links={links} />,
    };
  });
  // Tree labels: the short name from data/; a companion's honorific goes on a small second line.
  const labels: Record<string, string> = {};
  const honorifics: Record<string, string> = {};
  const arias: Record<string, string> = {};
  const narrators: Record<string, NarratorItem> = {};
  for (const node of graph.nodes.values()) {
    const n = narratorMap.get(node.id);
    labels[node.id] = n?.nameAr ?? node.id;
    if (n?.honorificAr) honorifics[node.id] = n.honorificAr;
    const isCommon = node.id === analysis.commonLink;
    const roleWord = isCommon ? ar.narratorPanel.roleCommon(ar.narrator.role[node.role]) : ar.narrator.role[node.role];
    arias[node.id] = ar.tree.nodeAria(n ? displayName(n) : node.id, roleWord);
    if (!n) continue;
    const through = node.routeIds.length;
    let lead = null;
    if (node.role === "prophet") lead = <p className="m-0 text-[15px] leading-[1.8]">{ar.narratorPanel.prophetNote}</p>;
    else if (isCommon) {
      const students = node.students.length;
      const line =
        (through === total
          ? ar.narratorPanel.commonAll(countDefinite(total, "isnad"))
          : ar.narratorPanel.commonSome(countNoun(through, "isnad"), totalWord)) +
        (students >= 2 ? ar.narratorPanel.branchesTo(countNoun(students, "narrator", "gen")) : "") +
        ".";
      lead = (
        <p className="m-0 flex items-start gap-2.5 text-[15px] leading-[1.7]">
          <span aria-hidden="true" className="mt-2 size-2.5 flex-none rotate-45 border-2 border-gold" />
          {line}
        </p>
      );
    }
    const books = [...new Set(h.routes.filter((r) => r.chain[0] === node.id).map((r) => r.book.nameAr))];
    narrators[node.id] = {
      id: node.id,
      name: displayName(n),
      eyebrow: roleWord,
      through: ar.narratorPanel.through(toArabicIndic(through), countNoun(total, "isnad", "gen")),
      body: <NarratorPanelBody narrator={n} books={books} lead={lead} />,
    };
  }
  const honorificSet = new Set(Object.keys(honorifics));
  const labelMap = new Map(Object.entries(labels));
  const viewProps = {
    routes,
    narrators,
    listLabel: countDefinite(total, "isnad"),
    layouts: {
      mobile: layoutTree(graph, analysis, labelMap, MOBILE, honorificSet),
      desktop: layoutTree(graph, analysis, labelMap, DESKTOP, honorificSet),
    },
    labels,
    honorifics,
    arias,
    exportTitle: h.titleAr,
    exportFile: `sanad-${h.id}.png`,
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
            {/* Where the matn is from, so it can be checked (owner, 6 Oct): book, compiler, number, volume and page,
                all from the route whose source page carries this matn. */}
            <div className="flex flex-col gap-3 pt-1">
              <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-2 text-[14px] leading-[1.6] sm:grid-cols-4">
                <div className="flex flex-col">
                  <dt className="text-on-green-muted">{ar.hadith.sourceBook}</dt>
                  <dd className="m-0">
                    {source.book.nameAr} ({source.book.edition})
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-on-green-muted">{ar.hadith.sourceAuthor}</dt>
                  <dd className="m-0">{source.book.authorAr}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-on-green-muted">{ar.hadith.sourceNumber}</dt>
                  <dd className="m-0">{routeNumber(source)}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-on-green-muted">{ar.hadith.sourcePlace}</dt>
                  <dd className="m-0">{volumePage(source)}</dd>
                </div>
              </dl>
              <a
                href={h.matnSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonOnGreen} self-start px-5 text-[15px]`}
              >
                {ar.hadith.openInSource}
              </a>
            </div>
            {h.matnVariants?.length ? (
              <details className="text-[14px] leading-[1.7] text-on-green-muted">
                <summary className="min-h-11 cursor-pointer content-center">{ar.hadith.variantsSummary}</summary>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {h.matnVariants.map((v) => (
                    <li key={v.sourceUrl + v.textAr}>
                      «{v.textAr}»: {v.note}{" "}
                      <a href={v.sourceUrl} target="_blank" rel="noopener noreferrer" className="py-2 text-parchment hover:text-parchment">
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

      <Suspense fallback={<HadithView {...viewProps} initial={routes[0] ? { kind: "route", id: routes[0].id } : null} />}>
        <HadithViewFromUrl {...viewProps} />
      </Suspense>

      {/* «كيف أتحقق من هذا؟» (owner, 6 Oct): three steps, and the list of every source. */}
      <section
        aria-labelledby="verify-h"
        className="mx-4 mb-10 flex flex-col gap-3 rounded-sq border-[1.5px] border-ink bg-paper p-5 lg:mx-8 lg:max-w-[720px]"
      >
        <h2 id="verify-h" className="m-0 text-[20px] leading-[1.4] font-semibold">
          {ar.hadith.verifyTitle}
        </h2>
        <ol className="m-0 flex list-decimal flex-col gap-1.5 ps-6 text-[15px] leading-[1.7]">
          {ar.hadith.verifySteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <Link href="/sources" className="inline-flex min-h-11 items-center self-start text-[15px]">
          {ar.hadith.allSources}
        </Link>
      </section>
    </>
  );
}
