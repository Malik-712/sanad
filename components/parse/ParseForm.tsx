"use client";

import { forwardRef, type FormEvent, type KeyboardEvent } from "react";
import { buttonOutline, buttonPrimary } from "@/components/ui/buttons";
import { LockIcon } from "@/components/ui/icons";
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import { MAX_CHARS, type InputProblem } from "@/lib/linker/analyze";

// The paste form. Nothing is sent anywhere: the form has no action, and the text is read in the browser.
export const ParseForm = forwardRef<
  HTMLTextAreaElement,
  {
    value: string;
    onChange: (value: string) => void;
    onAnalyse: () => void;
    onSample?: () => void;
    problem: InputProblem | null;
    sampleNote?: string;
  }
>(function ParseForm({ value, onChange, onAnalyse, onSample, problem, sampleNote }, ref) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onAnalyse();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onAnalyse();
    }
  };
  const tooLong = value.length > MAX_CHARS;
  const message =
    problem === "tooLong" ? ar.parse.problems.tooLong(toArabicIndic(MAX_CHARS)) : problem ? ar.parse.problems[problem] : null;

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5" noValidate>
      <label htmlFor="isnad-in" className="text-[15px] font-medium">
        {ar.parse.label}
      </label>
      <textarea
        ref={ref}
        id="isnad-in"
        name="isnad"
        rows={7}
        dir="rtl"
        lang="ar"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={ar.parse.placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        aria-invalid={problem ? true : undefined}
        aria-describedby={`isnad-hint isnad-count${message ? " isnad-problem" : ""}`}
        className={`box-border w-full resize-y rounded-sq border-[1.5px] bg-paper px-4 py-3.5 text-[19px] leading-[1.9] text-ink ${
          problem ? "border-check" : "border-ink"
        }`}
      />
      {message ? (
        <p id="isnad-problem" role="alert" className="m-0 flex items-start gap-2 text-[14px] leading-[1.7] text-check-fg">
          <span aria-hidden="true" className="mt-[9px] size-2 flex-none bg-check" />
          {message}
        </p>
      ) : null}
      <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span id="isnad-hint" className="text-[13px] text-muted">
          {ar.parse.hint}
        </span>
        <span
          id="isnad-count"
          className={`text-[13px] tabular-nums ${tooLong ? "font-medium text-check-fg" : "text-muted"}`}
        >
          {ar.parse.counter(toArabicIndic(value.length), toArabicIndic(MAX_CHARS))}
        </span>
      </span>
      <span className="flex items-center gap-2 text-[13px] text-muted">
        <LockIcon />
        {ar.parse.privacy}
      </span>
      <div className="flex flex-wrap items-center gap-2.5">
        <button type="submit" className={`${buttonPrimary} h-[52px] min-w-0 flex-1 basis-56`}>
          {ar.parse.analyse}
        </button>
        {onSample ? (
          <button type="button" onClick={onSample} className={`${buttonOutline} h-[52px] flex-1 basis-36`}>
            {ar.parse.sample}
          </button>
        ) : null}
      </div>
      <span className="text-[13px] text-muted">
        {sampleNote ? `${sampleNote} ` : ""}
        <span className="max-md:hidden">{ar.parse.shortcut}</span>
      </span>
    </form>
  );
});
