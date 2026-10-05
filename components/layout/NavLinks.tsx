"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ar } from "@/lib/copy/ar";

// Mobile: «الصق إسنادًا», «المنهج». Desktop: «الرئيسية», «شجرة الأسانيد» (hadith pages only), «الصق إسنادًا», «المنهج».
// The current page gets a gold underline and aria-current.
export function NavLinks({ desktop = false }: { desktop?: boolean }) {
  const pathname = usePathname();
  const onHadith = pathname.startsWith("/hadith/");

  const links: { href: string; label: string; current: boolean }[] = [];
  if (desktop) links.push({ href: "/", label: ar.nav.homeLink, current: pathname === "/" });
  if (desktop && onHadith) links.push({ href: pathname, label: ar.nav.tree, current: true });
  links.push({ href: "/parse", label: ar.nav.parse, current: pathname === "/parse" });
  links.push({ href: "/about", label: ar.nav.about, current: pathname === "/about" });

  const size = desktop ? "px-3 text-[15px] hover:border-on-green-muted" : "px-2.5 text-[14px]";

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
