import { Diamond } from "@/components/ui/Diamond";
import { ar } from "@/lib/copy/ar";

// The notice that goes with every automatic extraction.
export function AutoNotice() {
  return (
    <div role="note" className="flex items-start gap-3 rounded-sq border-[1.5px] border-check bg-paper px-4 py-3.5">
      <Diamond size={10} tone="check" className="mt-[9px]" />
      <span className="flex flex-col gap-0.5">
        <b className="text-[16px] font-semibold">{ar.parse.noticeTitle}</b>
        <span className="text-[14px] leading-[1.7]">{ar.parse.noticeText}</span>
      </span>
    </div>
  );
}
