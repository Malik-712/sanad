import Link from "next/link";
import { Diamond } from "@/components/ui/Diamond";

// One row of «أحاديث مختارة» (design `.item`): the quoted title, who narrated it and where, and the link line.
export function HadithCard({
  href,
  title,
  meta,
  openLabel,
}: {
  href: string;
  title: string;
  meta: string;
  openLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2.5 border-b border-line py-5 text-ink no-underline hover:text-ink"
    >
      <span className="text-[23px] leading-[1.8] group-hover:text-green">«{title}»</span>
      <span className="text-[14px] leading-[1.7] text-muted">{meta}</span>
      <span className="flex items-center gap-2.5 text-[15px] font-semibold text-green">
        <Diamond />
        {openLabel}
      </span>
    </Link>
  );
}
