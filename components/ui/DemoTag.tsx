import { ar } from "@/lib/copy/ar";

// «بيانات توضيحية»: a dashed tag on sample data. On green it uses the muted parchment colour.
export function DemoTag({ onGreen = false }: { onGreen?: boolean }) {
  const tone = onGreen ? "border-on-green-muted text-on-green-muted" : "border-muted text-muted";
  return (
    <span
      className={`inline-flex h-[26px] items-center self-start rounded-sq border border-dashed px-2 text-[13px] ${tone}`}
    >
      {ar.demoTag}
    </span>
  );
}
