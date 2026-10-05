import { GoldFrame } from "@/components/ui/GoldFrame";
import { ar } from "@/lib/copy/ar";

// The tree area until Session B draws the tree: the paper stage with its gold frame, one sentence, and the legend.
export function TreePlaceholder() {
  return (
    <section
      aria-label={ar.hadith.treeLabel}
      className="flex flex-col overflow-hidden rounded-sq border-[1.5px] border-ink bg-paper"
    >
      <div className="relative flex min-h-[320px] items-center justify-center px-10 py-12 lg:min-h-[520px]">
        <GoldFrame inset="8px" />
        <p className="m-0 max-w-[320px] text-center text-[15px] leading-[1.7] text-muted">{ar.hadith.treeSoon}</p>
      </div>
      <TreeLegend />
    </section>
  );
}

export function TreeLegend() {
  const item = "inline-flex items-center gap-[7px]";
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2.5 border-t-[1.5px] border-ink px-3.5 py-3 text-[13px] lg:gap-x-[22px] lg:px-4">
      <span className={item}>
        <span className="mx-0.5 size-[9px] rotate-45 border-2 border-green bg-gold" aria-hidden="true" />
        {ar.legend.prophet}
      </span>
      <span className={item}>
        <span className="size-[11px] bg-green" aria-hidden="true" />
        {ar.legend.companion}
      </span>
      <span className={item}>
        <span className="size-[11px] border-2 border-sage" aria-hidden="true" />
        {ar.legend.narrator}
      </span>
      <span className={item}>
        <span className="h-[11px] w-[15px] bg-ink" aria-hidden="true" />
        {ar.legend.compiler}
      </span>
      <span className={item}>
        <span className="mx-0.5 size-3 rotate-45 border-2 border-gold" aria-hidden="true" />
        {ar.legend.common}
      </span>
      <span className={item}>
        <span className="mx-0.5 size-2 rotate-45 bg-gold" aria-hidden="true" />
        {ar.legend.branch}
      </span>
      <span className={`${item} hidden lg:inline-flex`}>
        <span className="h-1 w-[22px] bg-green" aria-hidden="true" />
        {ar.legend.selected}
      </span>
    </div>
  );
}
