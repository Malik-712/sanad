import Image from "next/image";
import Link from "next/link";
import { ar } from "@/lib/copy/ar";

// Temporary placeholder that exercises the font, RTL and tokens.
// Replaced by the Home screen from design/screens/Home.dc.html in a later item.
export default function Home() {
  return (
    <>
      <div className="ongreen bg-green text-parchment">
        <header className="flex h-16 items-center justify-between ps-4 pe-2">
          <Link href="/" aria-label={ar.nav.home} aria-current="page" className="flex min-h-11 items-center">
            <Image src="/brand/sanad-mark.svg" alt="" width={48} height={48} priority />
          </Link>
        </header>
        <section className="flex flex-col gap-5 px-7 pt-10 pb-16">
          <h1 className="m-0 text-[46px] leading-[1.22] font-bold">{ar.slogan}</h1>
          <p className="m-0 max-w-[300px] text-base leading-[1.8] text-on-green-muted">
            {ar.placeholder.intro}
          </p>
        </section>
      </div>

      <main className="flex flex-col gap-3 px-4 py-10">
        <p className="m-0 text-[15px] font-medium">{ar.placeholder.building}</p>
      </main>

      <footer className="ongreen mt-auto flex flex-col gap-3 bg-green px-5 pt-7 pb-8 text-parchment">
        <p className="m-0 text-base leading-[1.7] font-medium">{ar.disclaimer}.</p>
      </footer>
    </>
  );
}
