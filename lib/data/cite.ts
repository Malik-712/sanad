// The text copied by «انسخ التوثيق»: book، place، number. URL
import { ar } from "@/lib/copy/ar";
import { routeNumber, routePlace } from "./derive";
import type { Route } from "./types";

export function citationText(route: Route): string {
  return `${route.book.nameAr}، ${routePlace(route)}، ${ar.place.number} ${routeNumber(route)}. ${route.url}`;
}
