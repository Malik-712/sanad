const ARABIC_INDIC = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

/** Replaces Western digits (0-9) with Arabic-Indic digits (٠-٩); other characters are kept. */
export function toArabicIndic(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => ARABIC_INDIC[Number(d)] ?? d);
}
