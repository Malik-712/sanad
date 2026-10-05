import Image from "next/image";
import Link from "next/link";
import { ar } from "@/lib/copy/ar";
import { HeaderSearch } from "./HeaderSearch";
import { NavLinks } from "./NavLinks";

// Below 1024px: the mobile header (64px, small mark at 44px, two links).
// From 1024px: the TreeDesktop header (72px, full mark at 48px, nav, search) on every page.
export function SiteHeader() {
  return (
    <div className="ongreen bg-green text-parchment">
      <header className="flex h-16 items-center justify-between ps-4 pe-2 lg:hidden">
        <Link href="/" aria-label={ar.nav.home} className="flex min-h-11 items-center">
          {/* Below 48px the mark has no gold frame (identity board). */}
          <Image src="/brand/sanad-mark-small.svg" alt="" width={44} height={44} priority />
        </Link>
        <NavLinks />
      </header>
      <header className="hidden min-h-[72px] flex-wrap items-center gap-x-8 gap-y-3 border-b border-green-line px-8 py-2.5 lg:flex">
        <Link href="/" aria-label={ar.nav.home} className="flex min-h-11 items-center">
          <Image src="/brand/sanad-mark.svg" alt="" width={48} height={48} priority />
        </Link>
        <NavLinks desktop />
        <HeaderSearch />
      </header>
    </div>
  );
}
