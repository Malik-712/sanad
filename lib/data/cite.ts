// The text copied by «انسخ التوثيق»: the isnad text, then book، place، number. URL
import { ar } from "@/lib/copy/ar";
import { routeNumber, routePlace } from "./derive";
import type { Route } from "./types";

export function citationText(route: Route): string {
  const reference = `${route.book.nameAr}، ${routePlace(route)}، ${ar.place.number} ${routeNumber(route)}. ${route.url}`;
  return [route.isnadAr, reference].join("\n");
}
