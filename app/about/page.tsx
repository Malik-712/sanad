import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GoldFrame } from "@/components/ui/GoldFrame";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import { getHadiths } from "@/lib/data/load";
import type { Status } from "@/lib/data/types";

export const metadata: Metadata = { title: ar.about.metaTitle };

const h2 = "m-0 border-b-2 border-ink pb-2.5 text-[28px] leading-[1.3] font-semibold";

function Key({ shape, label }: { shape: ReactNode; label: string }) {
  return (
    <div className="flex min-h-11 items-center gap-3 text-[15px]">
      <span className="flex w-7 flex-none justify-center">{shape}</span>
      {label}
    </div>
  );
}

export default function AboutPage() {
  const hadiths = getHadiths();
  // Only the books that are actually in data/ (the design's list of six is sample content).
  const books = [...new Set(hadiths.flatMap((h) => h.routes.map((r) => r.book.nameAr)))];
  const hasDemo = hadiths.some((h) => h.demo);
  const statuses: Status[] = ["ok", "check", "none"];

  return (
    <>
      <div className="ongreen bg-green text-parchment">
        <div className="mx-auto max-w-[720px]">
          <section className="flex flex-col gap-2.5 px-5 pt-5 pb-7">
            <h1 className="m-0 text-[40px] leading-[1.25] font-bold">{ar.about.title}</h1>
            <p className="m-0 text-[16px] leading-[1.8] text-on-green-muted">{ar.about.intro}</p>
          </section>
          <div className="relative mx-4 bg-green-deep px-6 py-7">
            <GoldFrame inset="8px" />
            <p role="note" className="m-0 text-center text-[22px] leading-[1.6] font-semibold">
              {ar.disclaimerLine}
            </p>
          </div>
          <div className="h-6" />
        </div>
      </div>

      <main id="main" className="mx-auto flex w-full max-w-[720px] flex-col gap-10 px-4 pt-8 pb-10">
        <section aria-labelledby="how-h" className="flex flex-col">
          <h2 id="how-h" className={h2}>
            {ar.about.stepsTitle}
          </h2>
          <ol className="m-0 list-none p-0">
            {ar.about.steps.map((s, i) => (
              <li
                key={s.title}
                className={`grid grid-cols-[40px_minmax(0,1fr)] gap-3.5 py-4 ${i < ar.about.steps.length - 1 ? "border-b border-line" : ""}`}
              >
                <span aria-hidden="true" className="flex size-10 items-center justify-center bg-green text-[20px] text-parchment">
                  {toArabicIndic(i + 1)}
                </span>
                <span className="flex flex-col gap-1">
                  <b className="text-[17px] font-semibold">{s.title}</b>
                  <span className="text-[15px] leading-[1.7] text-muted">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="read-h" className="flex flex-col gap-1.5">
          <h2 id="read-h" className={h2}>
            {ar.about.readTitle}
          </h2>
          <div className="flex flex-col pt-1.5">
            <Key shape={<span className="size-[13px] rotate-45 border-2 border-green bg-gold" />} label={ar.about.key.prophet} />
            <Key shape={<span className="size-3.5 bg-green" />} label={ar.about.key.companion} />
            <Key shape={<span className="size-3.5 border-2 border-sage" />} label={ar.about.key.narrator} />
            <Key shape={<span className="h-[18px] w-6 bg-ink" />} label={ar.about.key.compiler} />
            <Key
              shape={
                <span className="relative flex h-7 items-center justify-center">
                  <span className="absolute size-[22px] rotate-45 border-2 border-gold" />
                  <span className="relative size-3 border-2 border-sage bg-parchment" />
                </span>
              }
              label={ar.about.key.common}
            />
            <Key shape={<span className="size-[9px] rotate-45 bg-gold" />} label={ar.about.key.branch} />
          </div>
        </section>

        <section aria-labelledby="src-h" className="flex flex-col">
          <h2 id="src-h" className={h2}>
            {ar.about.sourcesTitle}
          </h2>
          <dl className="m-0 flex flex-col">
            <div className="flex flex-col gap-1.5 border-b border-line py-4">
              <dt className="text-[14px] font-medium text-muted">{ar.about.booksLabel}</dt>
              <dd className="m-0 text-[19px] leading-[1.9]">{books.join(ar.about.listJoin)}.</dd>
            </div>
            <div className="flex flex-col gap-1.5 border-b border-line py-4">
              <dt className="text-[14px] font-medium text-muted">{ar.about.rijalLabel}</dt>
              <dd className="m-0 flex flex-col gap-1.5">
                <span className="text-[19px] leading-[1.9]">{ar.about.rijalBook}</span>
                <span className="text-[14px] leading-[1.7] text-muted">{ar.about.rijalNote}</span>
              </dd>
            </div>
            <div className="flex flex-col gap-1.5 py-4">
              <dt className="text-[14px] font-medium text-muted">{ar.about.editionsLabel}</dt>
              <dd className="m-0 text-[15px] leading-[1.7]">{ar.about.editionsPlaceholder}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="status-h" className="flex flex-col gap-3.5">
          <h2 id="status-h" className={h2}>
            {ar.about.statusTitle}
          </h2>
          <div className="flex flex-col gap-4">
            {statuses.map((s) => (
              <div key={s} className="flex flex-col gap-1.5">
                <StatusBadge status={s} />
                <span className="text-[15px] leading-[1.7]">{ar.about.statusText[s]}</span>
              </div>
            ))}
          </div>
          <p className="m-0 rounded-sq border border-line-strong bg-paper px-4 py-3.5 text-[15px] leading-[1.7]">
            {ar.about.statusNote}
          </p>
        </section>

        <section aria-labelledby="limits-h" className="flex flex-col gap-3.5">
          <h2 id="limits-h" className={h2}>
            {ar.about.limitsTitle}
          </h2>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {ar.about.limits.map((l) => (
              <li key={l} className="flex items-start gap-3 text-[15px] leading-[1.7]">
                <span aria-hidden="true" className="mt-[9px] size-2 flex-none rotate-45 bg-check" />
                {l}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="privacy-h" className="flex flex-col gap-3.5">
          <h2 id="privacy-h" className={h2}>
            {ar.about.privacyTitle}
          </h2>
          <p className="m-0 text-[15px] leading-[1.8]">{ar.about.privacyText}</p>
        </section>
      </main>

      <SiteFooter variant="about" showDemoNote={hasDemo} />
    </>
  );
}
