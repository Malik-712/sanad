// Printable handouts for the user test (docs/USER_TEST.md): the isnad texts of one hadith, word for word from data/,
// each with its book, number and source link, in a shuffled but fixed order. No tree, no narrator names added.
//   pnpm tsx scripts/user-test-handout.ts buniya-al-islam la-yuminu
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { Hadith } from "@/lib/data/types";
import { routeNumber } from "@/lib/data/derive";

const ids = process.argv.slice(2);
mkdirSync("docs/user-test", { recursive: true });

for (const id of ids) {
  const h = JSON.parse(readFileSync(`data/hadiths/${id}.json`, "utf8")) as Hadith;
  // Fixed order that is not the site's order, so the handout does not hint at the tree.
  const all = [...h.routes].sort((a, b) => (a.id.length * 7 + a.id.charCodeAt(a.id.length - 1)) % 5 - (b.id.length * 7 + b.id.charCodeAt(b.id.length - 1)) % 5 || a.id.localeCompare(b.id));
  // Two isnads can share one text (e.g. «… وعن فلان …»): print the text once and say so.
  const counts = new Map<string, number>();
  for (const r of all) counts.set(r.isnadAr, (counts.get(r.isnadAr) ?? 0) + 1);
  const routes = all.filter((r, i) => all.findIndex((x) => x.isnadAr === r.isnadAr) === i);
  const lines = [
    `# Handout — «${h.titleAr}»`,
    "",
    "For the by-hand task in `docs/USER_TEST.md`. Print this page. The isnad texts are copied word for word from `data/hadiths/" + id + ".json`; each has its source.",
    "",
    "<div dir=\"rtl\" lang=\"ar\">",
    "",
    "**المهمة:** ارسم شجرة واحدة تجمع هذه الأسانيد: النبي ﷺ في الأعلى، والمصنِّفون في الأسفل. الراوي الذي يتكرر يُرسم مرة واحدة. ضع دائرة حول الراوي الذي تلتقي عنده أكثر الأسانيد.",
    "",
    ...routes.flatMap((r, i) => [
      `### ${i + 1}. ${r.book.nameAr}، ${routeNumber(r)}`,
      "",
      r.isnadAr,
      "",
      ...(counts.get(r.isnadAr)! > 1 ? [`(في هذا النص إسنادان.)`, ""] : []),
      `المصدر: ${r.url}`,
      "",
    ]),
    "</div>",
    "",
  ];
  writeFileSync(`docs/user-test/handout-${id}.md`, lines.join("\n"));
  console.log(`docs/user-test/handout-${id}.md: ${routes.length} texts, ${all.length} isnads`);
}
