"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ar } from "@/lib/copy/ar";

// Three links on every page and width: the explorer (Home), the books and sources, and about.
// The current page gets a gold underline and aria-current.
export function NavLinks({ desktop = false }: { desktop?: boolean }) {
  const pathname = usePathname();
  const links: { href: string; label: string; current: boolean }[] = [
    { href: "/", label: ar.nav.explorer, current: pathname === "/" },
    { href: "/sources", label: ar.nav.sources, current: pathname === "/sources" },
    { href: "/about", label: ar.nav.about, current: pathname === "/about" },
  ];

  // Hover as in the design: a muted underline bar on desktop, a text underline on mobile.
  const size = desktop
    ? "px-3 text-[15px] hover:border-on-green-muted"
    : "px-2.5 text-[14px] hover:underline hover:underline-offset-[6px]";

  return (
    <nav aria-label={ar.nav.label} className={`flex flex-wrap ${desktop ? "flex-1 gap-1" : "gap-0.5"}`}>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={l.current ? "page" : undefined}
          className={`flex min-h-11 items-center border-b-2 text-parchment no-underline hover:text-parchment ${size} ${
            l.current ? "border-gold font-semibold" : "border-transparent"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
