import { ar } from "@/lib/copy/ar";

// «بيانات توضيحية»: a dashed tag on sample data. On green it uses the muted parchment colour.
// The same tag marks the Home drawing as «رسم توضيحي» (`label`).
export function DemoTag({ onGreen = false, label = ar.demoTag }: { onGreen?: boolean; label?: string }) {
  const tone = onGreen ? "border-on-green-muted text-on-green-muted" : "border-muted text-muted";
  return (
    <span
      className={`inline-flex h-[26px] items-center self-start rounded-sq border border-dashed px-2 text-[13px] ${tone}`}
    >
      {label}
    </span>
  );
}
