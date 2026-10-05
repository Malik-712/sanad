"use client";

// Two-way switch from the design («الشجرة / الأسانيد …»): buttons with aria-pressed inside a green outline.
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-sq border-2 border-green">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`h-11 flex-1 cursor-pointer border-0 text-[15px] ${
              on ? "bg-green font-semibold text-parchment" : "bg-transparent text-green"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
