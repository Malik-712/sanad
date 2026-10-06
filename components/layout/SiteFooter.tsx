import Link from "next/link";
import { Diamond } from "@/components/ui/Diamond";
import { ar } from "@/lib/copy/ar";

// The three footers in the design:
// Every variant links to /sources («المصادر وكيف نتحقق», owner 6 Oct).
// "green" (Home, narrator): disclaimer + «كيف نعمل، ومن أين ننقل»;
// "about" (About): the demo line only when sample data exists + «ابدأ البحث»;
// "plain" (Paste): a 2px ink rule with the disclaimer.
// The inner width is the page's 720px column less the footer's own padding (20px, or 16px for "plain"),
// so the footer text lines up with the band and the content above it.
// `wide` (Home): from 1024px the content lines up with the Home container (1344px, 48px gutters) instead of the 720px column.
const goldUnderline =
  "inline-flex min-h-11 items-center self-start text-parchment underline decoration-gold decoration-2 underline-offset-[6px] hover:text-parchment";

export function SiteFooter({
  variant,
  showDemoNote = false,
  wide = false,
}: {
  variant: "green" | "about" | "plain";
  showDemoNote?: boolean;
  wide?: boolean;
}) {
  if (variant === "plain") {
    return (
      <footer className="mt-auto border-t-2 border-ink px-4 pt-5 pb-7">
        <div className="mx-auto flex max-w-[688px] flex-col gap-1">
          <span className="flex items-start gap-2.5">
            <Diamond tone="green" className="mt-[9px]" />
            <span className="text-[14px] leading-[1.7]">{ar.disclaimerLine}</span>
          </span>
          <Link href="/sources" className="inline-flex min-h-11 items-center self-start text-[14px]">
            {ar.footer.sourcesLink}
          </Link>
        </div>
      </footer>
    );
  }

  if (variant === "about") {
    return (
      <footer className="ongreen mt-auto bg-green px-5 pt-6 pb-7 text-parchment">
        <div className="mx-auto flex max-w-[680px] flex-col gap-2">
          {showDemoNote ? <span className="text-[14px] text-on-green-muted">{ar.footer.demoNote}</span> : null}
          <Link href="/" className={`${goldUnderline} text-[15px]`}>
            {ar.footer.startSearch}
          </Link>
          <Link href="/sources" className={`${goldUnderline} text-[14px]`}>
            {ar.footer.sourcesLink}
          </Link>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`ongreen mt-auto bg-green px-5 pt-7 pb-8 text-parchment ${wide ? "lg:px-12" : ""}`}>
      <div className={`mx-auto flex max-w-[680px] flex-col gap-3 ${wide ? "lg:max-w-[84rem]" : ""}`}>
        <p className="m-0 text-[16px] leading-[1.7] font-medium">{ar.disclaimerLine}</p>
        <span className="flex flex-wrap gap-x-6">
          <Link href="/about" className={`${goldUnderline} text-[14px]`}>
            {ar.footer.aboutLink}
          </Link>
          <Link href="/sources" className={`${goldUnderline} text-[14px]`}>
            {ar.footer.sourcesLink}
          </Link>
        </span>
      </div>
    </footer>
  );
}
