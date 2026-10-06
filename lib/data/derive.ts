// Pure helpers over the data. Nothing here invents a value: missing fields stay missing.
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import type { Hadith, Narrator, Route, Status } from "./types";

/** «مصدر موثق» only when the owner marked it verified and a source URL exists. */
export function routeStatus(route: Route): Status {
  if (!route.url) return "none";
  return route.verification.status === "verified" ? "ok" : "check";
}

/** A narrator's source is his Taqrib entry; without one, «لا مصدر بعد». */
export function narratorStatus(n: Narrator): Status {
  if (!n.taqrib) return "none";
  return n.verification.status === "verified" && n.taqrib.url ? "ok" : "check";
}

/** The name as shown in the UI, with the companion's honorific when the data gives one. */
export function displayName(n: Narrator): string {
  return n.honorificAr ? `${n.nameAr} ${n.honorificAr}` : n.nameAr;
}

function uniqueIds(ids: (string | undefined)[]): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

/** Compiler ids (first link of each chain), in order of first appearance. */
export function compilerIds(h: Hadith): string[] {
  return uniqueIds(h.routes.map((r) => r.chain[0]));
}

/** Ids of the narrators just below the Prophet ﷺ in each chain, in order of first appearance. */
export function companionIds(h: Hadith): string[] {
  return uniqueIds(h.routes.map((r) => r.chain[r.chain.length - 2]));
}

/** Every route, across hadiths, whose chain contains the narrator. */
export function routesThrough(hadiths: Hadith[], narratorId: string): { hadith: Hadith; route: Route }[] {
  return hadiths.flatMap((hadith) =>
    hadith.routes.filter((route) => route.chain.includes(narratorId)).map((route) => ({ hadith, route })),
  );
}

/** «ت عبد الباقي، ج ١، ص ٧٤». A missing volume is left out; a missing page says «غير مذكور» (owner, 6 Oct). */
export function routePlace(route: Route): string {
  const parts = [route.book.edition];
  if (route.volume) parts.push(`${ar.place.volume} ${toArabicIndic(route.volume)}`);
  parts.push(`${ar.place.page} ${route.page ? toArabicIndic(route.page) : ar.hadith.notMentioned}`);
  return parts.join("، ");
}

/** «ج ١، ص ٦», or «غير مذكور» for each missing part. */
export function volumePage(route: Route): string {
  const v = route.volume ? toArabicIndic(route.volume) : ar.hadith.notMentioned;
  const p = route.page ? toArabicIndic(route.page) : ar.hadith.notMentioned;
  return `${ar.place.volume} ${v}، ${ar.place.page} ${p}`;
}

/** The route whose source page carries the matn shown on the hadith page (same URL); else the first route. */
export function matnRoute(h: Hadith): Route {
  return h.routes.find((r) => r.url === h.matnSource.url) ?? h.routes[0]!;
}

/** «صحيح البخاري، حديث ١» style number as printed, in Arabic-Indic digits. */
export function routeNumber(route: Route): string {
  return toArabicIndic(route.number);
}
