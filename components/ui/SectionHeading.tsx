import type { ReactNode } from "react";

// A section title over a 2px ink rule, with an optional item at the other end (a tag).
export function SectionHeading({
  id,
  children,
  end,
  size = 28,
}: {
  id?: string;
  children: ReactNode;
  end?: ReactNode;
  size?: 26 | 28;
}) {
  return (
    <div className="flex items-end justify-between gap-3 border-b-2 border-ink pb-3">
      <h2
        id={id}
        className={`m-0 leading-[1.3] font-semibold ${size === 26 ? "text-[26px]" : "text-[28px]"}`}
      >
        {children}
      </h2>
      {end}
    </div>
  );
}
