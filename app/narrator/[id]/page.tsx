import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Diamond } from "@/components/ui/Diamond";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { countNoun } from "@/lib/arabic/count";
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import { displayName, narratorStatus, routesThrough } from "@/lib/data/derive";
import { getHadiths, getNarrator, getNarrators } from "@/lib/data/load";

export const dynamicParams = false;

export function generateStaticParams() {
  return getNarrators().map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: PageProps<"/narrator/[id]">): Promise<Metadata> {
  const { id } = await params;
  const n = getNarrator(id);
  return n ? { title: displayName(n) } : {};
}

// The narrator page, built from the design's narrator panel. Every value comes from data/narrators.json.
export default async function NarratorPage({ params }: PageProps<"/narrator/[id]">) {
  const { id } = await params;
  const n = getNarrator(id);
  if (!n) notFound();

  const through = routesThrough(getHadiths(), n.id);
  const byHadith = [...new Map(through.map((x) => [x.hadith.id, x.hadith])).values()].map((h) => ({
    hadith: h,
    count: through.filter((x) => x.hadith.id === h.id).length,
  }));
  const books = [...new Set(through.filter((x) => x.route.chain[0] === n.id).map((x) => x.route.book.nameAr))];
  const isProphet = n.role === "prophet";
  const isCompiler = n.role === "compiler";
  const showTaqrib = n.role === "companion" || n.role === "narrator";

  return (
    <>
      <div className="ongreen bg-green text-parchment">
        <div className="mx-auto flex max-w-[720px] flex-col gap-0.5 px-5 pt-5 pb-6">
          <span className="text-[13px] text-on-green-muted">{ar.narrator.role[n.role]}</span>
          <h1 className="m-0 text-[28px] leading-[1.5] font-bold lg:text-[30px]">{displayName(n)}</h1>
          {n.fullNameAr !== n.nameAr ? (
            <p className="m-0 text-[15px] leading-[1.7] text-on-green-muted">{n.fullNameAr}</p>
          ) : null}
        </div>
      </div>

      <main id="main" className="mx-auto w-full max-w-[720px] px-4 pt-6 pb-10">
        <div className="flex flex-col gap-[18px] rounded-sq border-[1.5px] border-ink bg-paper p-5 lg:px-6">
          {isProphet ? <p className="m-0 text-[15px] leading-[1.8]">{ar.narrator.prophetNote}</p> : null}

          {isProphet ? null : (
            <dl className="m-0 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <dt className="text-[13px] text-muted">{ar.narrator.tabaqa}</dt>
                <dd className="m-0 text-[16px]">{n.tabaqa ?? ar.narrator.notReported}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-[13px] text-muted">{ar.narrator.death}</dt>
                <dd className="m-0 text-[16px]">{n.deathAr ?? ar.narrator.notReported}</dd>
              </div>
            </dl>
          )}

          {isCompiler && books.length ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] text-muted">{ar.narrator.book}</span>
              <span className="text-[19px]">{books.join("، ")}</span>
            </div>
          ) : null}

          {showTaqrib ? (
            <div className="flex flex-col gap-2.5 border-t border-line pt-4">
              <span className="text-[14px] font-medium">{ar.narrator.taqribHeading}</span>
              {n.taqrib ? (
                <>
                  <blockquote className="m-0 text-[21px] leading-[1.9] lg:text-[22px]">«{n.taqrib.quoteAr}»</blockquote>
                  <span className="flex items-center gap-2 text-[13px] text-muted">
                    <Diamond size={7} />
                    <span>
                      {ar.narrator.taqribRef(toArabicIndic(n.taqrib.page), toArabicIndic(n.taqrib.entryNo))}
                      {n.taqrib.url ? (
                        <>
                          {"، "}
                          <a href={n.taqrib.url} target="_blank" rel="noopener noreferrer" className="py-2">
                            {ar.narrator.sourceLink}
                          </a>
                        </>
                      ) : null}
                    </span>
                  </span>
                </>
              ) : (
                <p className="m-0 border border-dashed border-edge px-3.5 py-3 text-[14px] leading-[1.7] text-muted">
                  {ar.narrator.noQuote}
                </p>
              )}
              <StatusBadge status={narratorStatus(n)} />
            </div>
          ) : null}

          {n.identification ? (
            <div className="flex flex-col gap-1 border-t border-line pt-4">
              <span className="text-[13px] text-muted">{ar.narrator.identification}</span>
              <p className="m-0 text-[15px] leading-[1.7] break-words">
                <b className="font-semibold">{n.identification.kind}</b>: {n.identification.note}
              </p>
            </div>
          ) : null}

          {through.length ? (
            <div className="flex flex-col gap-2 border-t border-line pt-4">
              <span className="text-[14px]">{ar.narrator.routesThrough(countNoun(through.length, "isnad"))}</span>
              <ul className="m-0 flex list-none flex-col p-0">
                {byHadith.map(({ hadith, count }) => (
                  <li key={hadith.id}>
                    <Link
                      href={`/hadith/${hadith.id}`}
                      className="flex min-h-11 flex-wrap items-center gap-x-3 border-b border-line py-2 text-ink no-underline hover:text-green"
                    >
                      <span className="text-[17px]">«{hadith.titleAr}»</span>
                      <span className="text-[13px] text-muted">{countNoun(count, "isnad")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </main>

      <SiteFooter variant="green" />
    </>
  );
}
