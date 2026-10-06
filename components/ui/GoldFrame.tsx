import type { CSSProperties } from "react";

// The thin gold frame with a diamond in each corner. Once per screen, on its most important area.
// Pass `inset`, or `className` with inset utilities when the inset changes by breakpoint.
export function GoldFrame({ inset, className = "" }: { inset?: CSSProperties["inset"]; className?: string }) {
  return (
    <span className={`gold-frame ${className}`} aria-hidden="true" style={inset === undefined && className ? undefined : { inset: inset ?? "10px" }}>
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
