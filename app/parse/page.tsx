import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ParseApp } from "@/components/parse/ParseApp";
import { ar } from "@/lib/copy/ar";
import { getHadiths, getNarrators } from "@/lib/data/load";
import { buildParseData } from "@/lib/linker/parseData";

export const metadata: Metadata = { title: ar.parse.title };

// The page is static. The narrator records and route chains it needs are passed to the browser as props,
// so analysing a pasted isnad makes no request: the text never leaves the device.
export default function ParsePage() {
  const data = buildParseData(getHadiths(), getNarrators());

  return (
    <>
      <div className="ongreen bg-green text-parchment">
        <section className="mx-auto flex max-w-[720px] flex-col gap-2.5 px-5 pt-5 pb-8">
          <h1 className="m-0 text-[40px] leading-[1.25] font-bold">{ar.parse.title}</h1>
          <p className="m-0 text-[16px] leading-[1.8] text-on-green-muted">{ar.parse.intro}</p>
        </section>
      </div>

      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-7 px-4 pt-6 pb-9">
        <ParseApp data={data} />
      </div>

      <SiteFooter variant="plain" />
    </>
  );
}
