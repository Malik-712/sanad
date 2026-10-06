import Image from "next/image";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ParseApp } from "@/components/parse/ParseApp";
import { ar } from "@/lib/copy/ar";
import { getHadiths, getNarrators } from "@/lib/data/load";
import { buildParseData } from "@/lib/linker/parseData";

// Home = the Smart Isnād Explorer: paste an isnād, the model reads it in the browser, and the hadiths that have this
// isnād (or a close one) are listed and drawn. The narrator records and verified routes it needs are passed as props;
// the corpus files are static files loaded by the browser. Nothing pasted is sent anywhere.
export default function Home() {
  const data = buildParseData(getHadiths(), getNarrators());

  return (
    <>
      <div className="ongreen bg-green text-parchment">
        <section className="mx-auto flex max-w-[760px] flex-col items-center gap-4 px-5 pt-9 pb-10 text-center lg:pt-12">
          <Image src="/brand/sanad-mark.svg" alt="" width={64} height={64} priority />
          <h1 className="m-0 text-[36px] leading-[1.25] font-bold lg:text-[46px]">{ar.slogan}</h1>
          <p className="m-0 max-w-[560px] text-[16px] leading-[1.8] text-on-green-muted">{ar.explorer.hero}</p>
        </section>
      </div>

      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-7 px-4 pt-6 pb-10">
        <ParseApp data={data} />
      </div>

      <SiteFooter variant="green" />
    </>
  );
}
