import type { CSSProperties } from "react";

// The thin gold frame with a diamond in each corner. Once per screen, on its most important area.
export function GoldFrame({ inset = "10px" }: { inset?: CSSProperties["inset"] }) {
  return (
    <span className="gold-frame" aria-hidden="true" style={{ inset }}>
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
