import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// The main flow (Home → search → tree → route → source), the narrator panel and page, About,
// and an axe scan of every page type. Values compared with the page are read from data/.

const niyyah = JSON.parse(readFileSync("data/hadiths/niyyah.json", "utf8")) as {
  titleAr: string;
  routes: { id: string; url: string; book: { nameAr: string } }[];
};
const bukhari1 = niyyah.routes.find((r) => r.id === "bukhari-1")!;

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 1024;

async function seriousAxe(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return r.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

test("verified hadith: the tree, an isnad, its source link (reached by its address)", async ({ page }) => {
  await page.goto("/hadith/niyyah");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  if (isMobile(page)) await page.getByRole("group", { name: "طريقة العرض" }).getByRole("button").nth(1).click();
  const routeButton = page.getByRole("button", { name: /صحيح البخاري، حديث ١(?![٠-٩])/ }).first();
  await routeButton.click();
  await expect(page).toHaveURL(/isnad=bukhari-1/);
  const panel = page.getByRole("region", { name: "لوحة المصدر" });
  await expect(panel.getByRole("link", { name: "افتح الموضع في المصدر" })).toHaveAttribute("href", bukhari1.url);
});

test("header: three links only, on every page", async ({ page }) => {
  await page.goto("/about");
  const nav = page.getByRole("navigation", { name: "القائمة الرئيسية" }).first();
  await expect(nav.getByRole("link")).toHaveText(["محلّل الإسناد", "الكتب والمصادر", "عن المشروع"]);
});

test("/parse leads to Home", async ({ page }) => {
  await page.goto("/parse");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByLabel("نصّ الإسناد")).toBeVisible();
});

test("a deep link opens the selected isnad", async ({ page }) => {
  await page.goto("/hadith/niyyah?isnad=bukhari-1");
  await expect(page.getByRole("region", { name: "لوحة المصدر" })).toBeVisible();
});

test("tree: a narrator node opens the narrator panel and the full page", async ({ page }) => {
  await page.goto("/hadith/niyyah");
  const tree = page.getByLabel("شجرة الأسانيد");
  await expect(tree).toBeVisible();
  const node = tree.getByRole("button", { name: /^عمر بن الخطاب/ }).first();
  await node.click();
  const panel = page.getByRole("region", { name: "لوحة الراوي" });
  await expect(panel).toBeVisible();
  await panel.getByRole("link", { name: "الترجمة كاملة" }).click();
  await expect(page).toHaveURL(/\/narrator\/umar-ibn-al-khattab$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("عمر بن الخطاب");
});

test("hadith page: the source above the tree, and «كيف أتحقق من هذا؟»", async ({ page }) => {
  await page.goto("/hadith/niyyah");
  await expect(page.getByRole("link", { name: "افتح في المصدر" })).toHaveAttribute("href", bukhari1.url);
  const verify = page.getByRole("region", { name: "كيف أتحقق من هذا؟" });
  await expect(verify.getByRole("listitem")).toHaveCount(3);
  await verify.getByRole("link", { name: "كل المصادر وحالتها" }).click();
  await expect(page).toHaveURL(/\/sources$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("المصادر وكيف نتحقق");
});

test("About states the disclaimer; unknown pages give the 404 page", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("أداة مساعدة بالذكاء الاصطناعي، لا تحكم على الأحاديث ولا تُفتي").first()).toBeVisible();
  const res = await page.goto("/hadith/does-not-exist");
  expect(res?.status()).toBe(404);
});

for (const path of ["/", "/hadith/niyyah", "/hadith/niyyah?isnad=bukhari-1", "/narrator/umar-ibn-al-khattab", "/c/bukhari/1", "/about", "/sources"]) {
  test(`axe (WCAG 2.1 A/AA): no serious or critical issues on ${path}`, async ({ page }) => {
    await page.goto(path);
    if (path.startsWith("/c/")) await expect(page.getByRole("heading", { level: 1 })).toContainText("حديث", { timeout: 20_000 });
    expect(await seriousAxe(page)).toEqual([]);
  });
}
