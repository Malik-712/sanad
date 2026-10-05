"use client";

import { useState } from "react";
import { buttonOutline } from "@/components/ui/buttons";

// «انسخ التوثيق»: copies the citation; the label turns to «نُسخ التوثيق» and is announced.
export function CopyCitation({ text, label, doneLabel }: { text: string; label: string; doneLabel: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-live="polite"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
        } catch {
          setDone(false);
        }
      }}
      className={`${buttonOutline} min-h-12 flex-[1_1_140px]`}
    >
      {done ? doneLabel : label}
    </button>
  );
}
