import { ar } from "@/lib/copy/ar";

// The «سفيان» chooser: a name that matches more than one narrator. The likely one (from a known
// teacher or student next to it) is pre-selected; the user confirms or changes it.
export function NarratorChooser({
  name,
  options,
  selected,
  reason,
  onChoose,
}: {
  name: string;
  options: { id: string; label: string }[];
  selected: string | null;
  reason: string | null;
  onChoose: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-sq border-[1.5px] border-ink bg-paper p-4">
      <p className="m-0 text-[15px] leading-[1.7]">
        <b className="font-semibold">{ar.parse.chooserTitle(name)}</b> {reason ? `${reason} ` : ""}
        {ar.parse.chooserAsk}
      </p>
      <div role="group" aria-label={ar.parse.chooserGroup(name)} className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.id === selected;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChoose(o.id)}
              className={`min-h-11 cursor-pointer rounded-sq border-2 border-green px-4 text-[18px] ${
                on ? "bg-green text-parchment hover:bg-green-deep" : "bg-transparent text-green hover:bg-hover"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
