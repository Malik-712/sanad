import type { Metadata } from "next";
import Link from "next/link";
import { ChainList, type ChainRow } from "@/components/hadith/ChainList";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AutoNotice } from "@/components/parse/AutoNotice";
import { NarratorChip } from "@/components/parse/NarratorChip";
import { ParseForm } from "@/components/parse/ParseForm";
import { buttonOnGreen } from "@/components/ui/buttons";
import { DemoTag } from "@/components/ui/DemoTag";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { countNoun, numberWord } from "@/lib/arabic/count";
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import { displayName, routeNumber } from "@/lib/data/derive";
import { getHadith, getNarrator } from "@/lib/data/load";

export const metadata: Metadata = { title: ar.parse.title };

// The sample under the form is built from one isnad in data/ and tagged «بيانات توضيحية».
// No model has run: no match percentages, no chooser, no status badges.
const SAMPLE_HADITH = "niyyah";
const SAMPLE_ROUTE = "bukhari-1";

export default function ParsePage() {
  const hadith = getHadith(SAMPLE_HADITH);
  const index = hadith?.routes.findIndex((r) => r.id === SAMPLE_ROUTE) ?? -1;
  const route = hadith?.routes[index];

  // Names as they come in the text: from the compiler's teacher up to the Prophet ﷺ (the compiler is not in the text).
  const inText = route ? route.chain.slice(1) : [];
  const rows: ChainRow[] = [...inText].reverse().map((id) => {
    const n = getNarrator(id);
    return { id, name: n ? displayName(n) : id, role: n?.role ?? "narrator" };
  });
  const sighas = route?.sighas ?? [];
  // sighas[i] links chain[i] and chain[i+1]; the rows run from the Prophet ﷺ down, and the last link leads to the compiler.
  const m = route ? route.chain.length - 1 : 0;
  const links = rows.map((_, j) => sighas[m - j - 1] ?? "");
  const total = hadith?.routes.length ?? 0;

  return (
    <>
      <div className="ongreen bg-green text-parchment">
        <section className="mx-auto flex max-w-[720px] flex-col gap-2.5 px-5 pt-5 pb-8">
          <h1 className="m-0 text-[40px] leading-[1.25] font-bold">{ar.parse.title}</h1>
          <p className="m-0 text-[16px] leading-[1.8] text-on-green-muted">{ar.parse.intro}</p>
        </section>
      </div>

      <main id="main" className="mx-auto flex w-full max-w-[720px] flex-col gap-7 px-4 pt-6 pb-9">
        <ParseForm defaultValue={route?.isnadAr ?? ""} />
        <AutoNotice />

        {hadith && route ? (
          <>
            <section aria-labelledby="found-h" className="flex flex-col gap-3.5">
              <SectionHeading id="found-h" size={26} end={<DemoTag />}>
                {countNoun(inText.length, "name")}
              </SectionHeading>
              <div className="flex flex-wrap gap-2">
                {inText.map((id) => {
                  const n = getNarrator(id);
                  return <NarratorChip key={id} name={n ? displayName(n) : id} />;
                })}
              </div>
            </section>

            <section aria-labelledby="chain-h" className="flex flex-col gap-3.5">
              <SectionHeading id="chain-h" size={26} end={<DemoTag />}>
                {ar.parse.chainTitle}
              </SectionHeading>
              <div className="rounded-sq border border-line-strong bg-paper p-5">
                <ChainList rows={rows} links={links} label={ar.parse.chainAria} missingCompiler={ar.parse.missingCompiler} />
              </div>
              <p className="m-0 text-[13px] leading-[1.7] text-muted">{ar.parse.chainNote}</p>
            </section>

            <section className="ongreen flex flex-col gap-2.5 bg-green p-5 text-parchment">
              <span className="text-[22px] font-semibold">{ar.parse.foundTitle(hadith.titleAr)}</span>
              <span className="text-[14px] leading-[1.7] text-on-green-muted">
                {index === 0
                  ? ar.parse.foundFirst(numberWord(total, "gen"), ar.hadith.routeTitle(route.book.nameAr, routeNumber(route)))
                  : ar.parse.foundNth(
                      toArabicIndic(index + 1),
                      numberWord(total, "gen"),
                      ar.hadith.routeTitle(route.book.nameAr, routeNumber(route)),
                    )}
              </span>
              <span className="self-start">
                <DemoTag onGreen />
              </span>
              <Link href={`/hadith/${hadith.id}?isnad=${route.id}`} className={`${buttonOnGreen} mt-1.5`}>
                {ar.parse.showInTree}
              </Link>
            </section>
          </>
        ) : null}
      </main>

      <SiteFooter variant="plain" />
    </>
  );
}
