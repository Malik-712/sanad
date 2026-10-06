import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { NarratorPanelBody } from "@/components/panels/NarratorPanelBody";
import { countNoun } from "@/lib/arabic/count";
import { ar } from "@/lib/copy/ar";
import { displayName, routesThrough } from "@/lib/data/derive";
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

      <div className="mx-auto w-full max-w-[720px] px-4 pt-6 pb-10">
        <div className="rounded-sq border-[1.5px] border-ink bg-paper">
          <NarratorPanelBody
            narrator={n}
            books={books}
            lead={n.role === "prophet" ? <p className="m-0 text-[15px] leading-[1.8]">{ar.narrator.prophetNote}</p> : null}
          >
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
          </NarratorPanelBody>
        </div>
      </div>

      <SiteFooter variant="green" />
    </>
  );
}
