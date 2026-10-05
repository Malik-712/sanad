import type { ReactNode } from "react";

// A name found in the pasted isnad. The confidence badge appears only when a model has produced one (Session D).
export function NarratorChip({ name, badge }: { name: string; badge?: ReactNode }) {
  return (
    <span className="inline-flex min-h-10 items-center gap-2 rounded-sq border border-line-strong bg-paper px-3">
      <span className="text-[17px]">{name}</span>
      {badge}
    </span>
  );
}
