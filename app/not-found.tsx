import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { buttonPrimary } from "@/components/ui/buttons";
import { ar } from "@/lib/copy/ar";

export const metadata: Metadata = { title: ar.notFound.metaTitle };

export default function NotFound() {
  return (
    <>
      <div className="ongreen bg-green text-parchment">
        <section className="mx-auto flex max-w-[720px] flex-col gap-2.5 px-5 pt-5 pb-8">
          <h1 className="m-0 text-[40px] leading-[1.25] font-bold">{ar.notFound.title}</h1>
          <p className="m-0 text-[16px] leading-[1.8] text-on-green-muted">{ar.notFound.text}</p>
        </section>
      </div>
      <div className="mx-auto w-full max-w-[720px] px-4 py-10">
        <Link href="/" className={`${buttonPrimary} self-start`}>
          {ar.footer.startSearch}
        </Link>
      </div>
      <SiteFooter variant="green" />
    </>
  );
}
