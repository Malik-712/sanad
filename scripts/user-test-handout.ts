// Printable isnād cards for the user test (docs/USER_TEST.md): one isnād each, word for word from data/, with its source.
//   pnpm tsx scripts/user-test-handout.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { Hadith } from "@/lib/data/types";
import { routeNumber } from "@/lib/data/derive";

const CARDS = [
  { card: "A", hadith: "niyyah", route: "bukhari-2529" },
  { card: "B", hadith: "buniya-al-islam", route: "bukhari-8" },
];
mkdirSync("docs/user-test", { recursive: true });
for (const c of CARDS) {
  const h = JSON.parse(readFileSync(`data/hadiths/${c.hadith}.json`, "utf8")) as Hadith;
  const r = h.routes.find((x) => x.id === c.route)!;
  const lines = [
    `# Card ${c.card} — an isnād`,
    "",
    `Copied word for word from \`data/hadiths/${c.hadith}.json\` (${r.book.nameAr}، ${routeNumber(r)}); source: ${r.url}`,
    "",
    '<div dir="rtl" lang="ar">',
    "",
    "**المهمة:** اذكر ثلاثة أحاديث على الأقل (الكتاب ورقم الحديث) ورد فيها هذا الإسناد نفسه أو ما يقاربه.",
    "",
    r.isnadAr,
    "",
    "</div>",
    "",
  ];
  writeFileSync(`docs/user-test/card-${c.card}.md`, lines.join("\n"));
  console.log(`docs/user-test/card-${c.card}.md`);
}
