import Link from "next/link";
import type { Role } from "@/lib/data/types";

// The vertical chain from the Paste screen: the Prophet ﷺ at the top, the compiler at the bottom,
// with the transmission word («حدثنا»، «سمعت») between each two names.
export type ChainRow = {
  id: string;
  name: string;
  role: Role;
  href?: string;
  /** Paste screen: a name that needs checking (dashed amber square) or has no record (dashed grey square). */
  status?: "check" | "none";
  /** Word shown after the name («يحتاج تحققًا»، «لا مصدر بعد»). */
  note?: string;
  /** The meeting point of the matched tree: gold diamond ring and a label. */
  meeting?: string;
};

function Shape({ role, status }: { role: Role; status?: ChainRow["status"] }) {
  if (status === "check") return <span className="size-3.5 border-2 border-dashed border-check" aria-hidden="true" />;
  if (status === "none") return <span className="size-3.5 border-2 border-dashed border-[var(--color-none)]" aria-hidden="true" />;
  if (role === "prophet")
    return <span className="size-[13px] rotate-45 border-2 border-green bg-gold" aria-hidden="true" />;
  if (role === "companion") return <span className="size-3.5 bg-green" aria-hidden="true" />;
  if (role === "compiler") return <span className="h-[18px] w-6 bg-ink" aria-hidden="true" />;
  return <span className="size-3.5 border-2 border-sage" aria-hidden="true" />;
}

export function ChainList({
  rows,
  links,
  label,
  missingCompiler,
}: {
  rows: ChainRow[];
  links: string[];
  label: string;
  /** Paste screen: the compiler is not named in the pasted text (dashed row). */
  missingCompiler?: string;
}) {
  return (
    <ol aria-label={label} className="m-0 flex list-none flex-col p-0">
      {rows.map((r, i) => (
        <li key={`${r.id}-${i}`} className="flex flex-col">
          <div className="flex min-h-7 flex-wrap items-center gap-x-3.5 gap-y-1">
            <span className="relative flex h-7 w-7 flex-none items-center justify-center">
              {r.meeting ? (
                <span className="absolute size-[22px] rotate-45 border-2 border-gold" aria-hidden="true" />
              ) : null}
              <span className={r.meeting ? "relative bg-paper" : "contents"}>
                <Shape role={r.role} status={r.status} />
              </span>
            </span>
            {r.href ? (
              // 7px of padding taken back by the margin: a 44px hit area without changing the row's height.
              <Link
                href={r.href}
                className={`-my-[7px] py-[7px] text-[19px] leading-[1.6] ${r.role === "prophet" ? "font-bold" : ""}`}
              >
                {r.name}
              </Link>
            ) : (
              <span className={`text-[19px] leading-[1.6] ${r.role === "prophet" ? "font-bold" : ""}`}>{r.name}</span>
            )}
            {r.meeting ? (
              <span className="inline-flex h-6 items-center border-[1.5px] border-gold px-2 text-[12px] font-medium">
                {r.meeting}
              </span>
            ) : null}
            {r.note ? (
              <span className={`text-[13px] font-medium ${r.status === "check" ? "text-check-fg" : "text-none-fg"}`}>
                {r.note}
              </span>
            ) : null}
          </div>
          {i < rows.length - 1 || missingCompiler ? (
            <div className="flex h-8 items-center gap-3.5">
              <span className="flex w-7 flex-none justify-center">
                <span
                  className={i < rows.length - 1 ? "h-8 w-0.5 bg-edge" : "h-8 w-0 border-s-2 border-dashed border-edge"}
                  aria-hidden="true"
                />
              </span>
              <em className="text-[13px] text-muted not-italic">{links[i] ?? ""}</em>
            </div>
          ) : null}
        </li>
      ))}
      {missingCompiler ? (
        <li className="flex min-h-7 items-center gap-3.5">
          <span className="flex w-7 flex-none justify-center">
            <span className="h-[18px] w-6 border-2 border-dashed border-ink" aria-hidden="true" />
          </span>
          <span className="text-[14px] text-muted">{missingCompiler}</span>
        </li>
      ) : null}
    </ol>
  );
}
