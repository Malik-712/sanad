import { ar } from "@/lib/copy/ar";

/** Joins names the Arabic way: «البخاري ومسلم», «أ وب وج». */
export function joinAr(items: string[]): string {
  return items.join(` ${ar.home.and}`);
}
