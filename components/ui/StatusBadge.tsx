import { ar } from "@/lib/copy/ar";
import type { Status } from "@/lib/data/types";

// The three evidence statuses. The colour always comes with its word; «لا مصدر بعد» is neutral grey.
const styles: Record<Status, { box: string; dot: string; word: string }> = {
  ok: { box: "bg-ok-bg text-ok-fg", dot: "bg-ok", word: "text-ok-fg" },
  check: { box: "bg-check-bg text-check-fg", dot: "bg-check", word: "text-check-fg" },
  none: { box: "bg-none-bg text-none-fg", dot: "bg-none", word: "text-none-fg" },
};

/** Tag with background (panels, mobile route cards): 26px high, 13px text. */
export function StatusBadge({ status }: { status: Status }) {
  const s = styles[status];
  return (
    <span
      className={`inline-flex h-[26px] items-center gap-[7px] self-start rounded-sq px-[9px] text-[13px] font-medium ${s.box}`}
    >
      <span aria-hidden="true" className={`size-2 flex-none ${s.dot}`} />
      {ar.status[status]}
    </span>
  );
}

/** Square and word without background (desktop route cards): 12px text. */
export function StatusInline({ status }: { status: Status }) {
  const s = styles[status];
  return (
    <>
      <span aria-hidden="true" className={`size-2 flex-none ${s.dot}`} />
      <span className={`text-[12px] font-medium ${s.word}`}>{ar.status[status]}</span>
    </>
  );
}
