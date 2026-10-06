import type { ReactNode } from "react";

// A name found in the pasted isnad, with its match tag. «needs checking» names get a dashed amber border.
export function NarratorChip({ name, tag, warn = false }: { name: string; tag?: ReactNode; warn?: boolean }) {
  return (
    <li
      className={`inline-flex min-h-10 max-w-full items-center gap-2 rounded-sq bg-paper ps-3 ${tag ? "pe-1.5" : "pe-3"} ${
        warn ? "border-[1.5px] border-dashed border-check" : "border border-line-strong"
      }`}
    >
      <span className="min-w-0 py-1 text-[17px] break-words">{name}</span>
      {tag}
    </li>
  );
}

const tones = {
  ok: { box: "bg-ok-bg text-ok-fg", dot: "bg-ok" },
  check: { box: "bg-check-bg text-check-fg", dot: "bg-check" },
  none: { box: "bg-none-bg text-none-fg", dot: "bg-[var(--color-none)]" },
  chosen: { box: "bg-selected text-green", dot: "bg-green" },
} as const;

/** The design's match tag: 24px high, a 7px square, 13px text. `hidden` is read by screen readers only. */
export function MatchTag({ tone, children, hidden }: { tone: keyof typeof tones; children: ReactNode; hidden?: string }) {
  const t = tones[tone];
  return (
    <span className={`inline-flex h-6 flex-none items-center gap-1.5 rounded-sq px-2 text-[13px] font-medium ${t.box}`}>
      <span aria-hidden="true" className={`size-[7px] flex-none ${t.dot}`} />
      {hidden ? <span className="sr-only">{hidden} </span> : null}
      {children}
    </span>
  );
}
