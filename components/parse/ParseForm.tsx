import { buttonPrimary } from "@/components/ui/buttons";
import { LockIcon } from "@/components/ui/icons";
import { ar } from "@/lib/copy/ar";

// The paste form. Nothing is sent anywhere: there is no action, and analysis is not built yet («قريبًا»).
export function ParseForm({ defaultValue }: { defaultValue: string }) {
  return (
    <form className="flex flex-col gap-2.5">
      <label htmlFor="isnad-in" className="text-[15px] font-medium">
        {ar.parse.label}
      </label>
      <textarea
        id="isnad-in"
        name="isnad"
        rows={7}
        defaultValue={defaultValue}
        className="box-border w-full resize-y rounded-sq border-[1.5px] border-ink bg-paper px-4 py-3.5 text-[19px] leading-[1.9] text-ink"
      />
      <span className="text-[13px] text-muted">{ar.parse.hint}</span>
      <span className="flex items-center gap-2 text-[13px] text-muted">
        <LockIcon />
        {ar.parse.privacy}
      </span>
      <button type="button" disabled aria-disabled="true" className={`${buttonPrimary} h-[52px] opacity-60 hover:bg-green`}>
        {ar.parse.analyse} ({ar.parse.soon})
      </button>
    </form>
  );
}
