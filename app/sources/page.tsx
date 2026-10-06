import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import { getHadiths, getNarrators } from "@/lib/data/load";
import { countSource, NOTE_SOURCES, TEXT_SOURCES, type SourceBook, type SourceCount } from "@/lib/data/sources";

export const metadata: Metadata = { title: ar.sources.metaTitle };

// /sources (owner, 6 Oct): every book and site Sanad copies from (docs/SOURCES.md), and how much of what
// was copied the owner has checked — counted from data/, never written by hand.
function countLine(c: SourceCount): string {
  const total = toArabicIndic(c.total);
  const checked = toArabicIndic(c.checked);
  return c.kind === "isnads" ? ar.sources.isnads(total, checked) : c.kind === "entries" ? ar.sources.entries(total, checked) : ar.sources.quotes(total, checked);
}

function BookFacts({ book }: { book: SourceBook }) {
  return (
    <dl className="m-0 grid grid-cols-1 gap-1.5 text-[14px] leading-[1.7] sm:grid-cols-2">
      <div>
        <dt className="inline text-muted">{ar.sources.author}: </dt>
        <dd className="m-0 inline">{book.authorAr ?? ar.hadith.notMentioned}</dd>
      </div>
      <div>
        <dt className="inline text-muted">{ar.sources.edition}: </dt>
        <dd className="m-0 inline">{book.editionAr ?? ar.narrator.editionNotMentioned}</dd>
      </div>
    </dl>
  );
}

function OpenLink({ url }: { url: string | null }) {
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center self-start text-[15px]">
      {ar.sources.open}
    </a>
  ) : (
    <span className="text-[14px] text-muted">{ar.sources.noLink}</span>
  );
}

export default function SourcesPage() {
  const hadiths = getHadiths();
  const narrators = getNarrators();

  return (
    <>
      <div className="ongreen bg-green text-parchment">
        <section className="mx-auto flex max-w-[720px] flex-col gap-2.5 px-5 pt-5 pb-8">
          <h1 className="m-0 text-[36px] leading-[1.3] font-bold">{ar.sources.title}</h1>
          <p className="m-0 text-[16px] leading-[1.8] text-on-green-muted">{ar.sources.intro}</p>
        </section>
      </div>

      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-10 px-4 pt-6 pb-10">
        <section aria-labelledby="text-h" className="flex flex-col gap-4">
          <SectionHeading id="text-h" size={26}>
            {ar.sources.textTitle}
          </SectionHeading>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {TEXT_SOURCES.map((book) => {
              const c = countSource(book.id, hadiths, narrators);
              return (
                <li key={book.id} className="flex flex-col gap-3 rounded-sq border-[1.5px] border-ink bg-paper p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="m-0 text-[21px] leading-[1.5] font-semibold">{book.nameAr}</h3>
                    {c ? <StatusBadge status={c.status} /> : null}
                  </div>
                  <BookFacts book={book} />
                  <p className="m-0 text-[15px] leading-[1.7]">
                    <span className="text-muted">{ar.sources.use}: </span>
                    {book.useAr}
                  </p>
                  {c ? <p className="m-0 text-[14px] leading-[1.7]">{countLine(c)}</p> : null}
                  {c ? <p className="m-0 text-[13px] leading-[1.7] text-muted">{ar.about.statusText[c.status]}</p> : null}
                  {book.id === "dorar" ? <p className="m-0 text-[13px] leading-[1.7] text-muted">{ar.sources.licenceNote}</p> : null}
                  <OpenLink url={book.url} />
                </li>
              );
            })}
          </ul>
          <p className="m-0 text-[13px] leading-[1.7] text-muted">{ar.about.statusNote}</p>
        </section>

        <section aria-labelledby="notes-h" className="flex flex-col gap-4">
          <SectionHeading id="notes-h" size={26}>
            {ar.sources.notesTitle}
          </SectionHeading>
          <p className="m-0 text-[15px] leading-[1.7]">{ar.sources.notesText}</p>
          <ul className="m-0 flex list-none flex-col p-0">
            {NOTE_SOURCES.map((book) => (
              <li key={book.id} className="flex flex-col gap-1.5 border-b border-line py-3.5">
                <h3 className="m-0 text-[18px] leading-[1.5] font-semibold">{book.nameAr}</h3>
                <BookFacts book={book} />
                <OpenLink url={book.url} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="verify-h" className="flex flex-col gap-3 rounded-sq border-[1.5px] border-ink bg-paper p-5">
          <h2 id="verify-h" className="m-0 text-[20px] leading-[1.4] font-semibold">
            {ar.hadith.verifyTitle}
          </h2>
          <ol className="m-0 flex list-decimal flex-col gap-1.5 ps-6 text-[15px] leading-[1.7]">
            {ar.hadith.verifySteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </div>

      <SiteFooter variant="green" />
    </>
  );
}
