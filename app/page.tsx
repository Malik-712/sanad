import { SiteFooter } from "@/components/layout/SiteFooter";
import { GoldFrame } from "@/components/ui/GoldFrame";
import { ar } from "@/lib/copy/ar";

// Temporary page until Stage 4 builds the Home screen from design/screens/Home.dc.html.
export default function Home() {
  return (
    <>
      <div className="ongreen bg-green text-parchment">
        <section className="relative mx-auto flex max-w-[720px] flex-col gap-5 px-7 pt-10 pb-16">
          <GoldFrame inset="0 10px 10px" />
          <h1 className="m-0 text-[46px] leading-[1.22] font-bold">{ar.slogan}</h1>
          <p className="m-0 max-w-[300px] text-[16px] leading-[1.8] text-on-green-muted">{ar.placeholder.intro}</p>
        </section>
      </div>
      <main id="main" className="mx-auto w-full max-w-[720px] px-4 py-10">
        <p className="m-0 text-[15px] font-medium">{ar.placeholder.building}</p>
      </main>
      <SiteFooter variant="green" />
    </>
  );
}
