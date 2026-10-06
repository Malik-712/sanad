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

test("Home → search → tree → select an isnad → its source link", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "ابحث بكلمات الحديث أو باسم راوٍ" });
  await search.fill("بالنيات");
  const card = page.locator('a[href="/hadith/niyyah"]').first();
  await expect(card).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(/\/hadith\/niyyah$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  if (isMobile(page)) {
    // Mobile: the isnad list is the second view of the switch.
    await page.getByRole("group", { name: "طريقة العرض" }).getByRole("button").nth(1).click();
  }
  const routeButton = page.getByRole("button", { name: /صحيح البخاري، حديث ١(?![٠-٩])/ }).first();
  await routeButton.click();
  await expect(page).toHaveURL(/isnad=bukhari-1/);
  // Desktop keeps the list beside the tree; mobile switches back to the tree view (the list is then hidden).
  if (!isMobile(page)) await expect(routeButton).toHaveAttribute("aria-pressed", "true");

  const panel = page.getByRole("region", { name: "لوحة المصدر" });
  await expect(panel).toBeVisible();
  const source = panel.getByRole("link", { name: "افتح الموضع في المصدر" });
  await expect(source).toHaveAttribute("href", bukhari1.url);
  await expect(source).toHaveAttribute("target", "_blank");
  await expect(panel.getByText("ذِكرُ الحديث في كتابٍ ليس حكمًا عليه.", { exact: false })).toBeVisible();
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

test("search with no result explains what to try", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "ابحث بكلمات الحديث أو باسم راوٍ" }).fill("كلمة غير موجودة إطلاقا");
  await expect(page.getByRole("status")).toContainText("لم نجد حديثًا بهذه الكلمات");
});

test("About states the disclaimer; unknown pages give the 404 page", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("أداة مساعدة بالذكاء الاصطناعي، لا تحكم على الأحاديث ولا تُفتي").first()).toBeVisible();
  const res = await page.goto("/hadith/does-not-exist");
  expect(res?.status()).toBe(404);
});

test("keyboard only: skip link, search, open a hadith, select an isnad", async ({ page }) => {
  test.skip(isMobile(page), "keyboard path checked at desktop width");
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveAttribute("href", "#main");
  await page.getByRole("searchbox", { name: "ابحث بكلمات الحديث أو باسم راوٍ" }).focus();
  await page.keyboard.type("بالنيات");
  const card = page.locator('a[href="/hadith/niyyah"]').first();
  await card.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/hadith\/niyyah$/);
  const routeButton = page.getByRole("button", { name: /صحيح البخاري، حديث ١(?![٠-٩])/ }).first();
  await routeButton.focus();
  await expect(routeButton).toBeFocused();
  // A visible focus ring (outline) on the focused control.
  const outline = await routeButton.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "لوحة المصدر" })).toBeVisible();
});

for (const path of ["/", "/hadith/niyyah", "/hadith/niyyah?isnad=bukhari-1", "/narrator/umar-ibn-al-khattab", "/parse", "/about"]) {
  test(`axe (WCAG 2.1 A/AA): no serious or critical issues on ${path}`, async ({ page }) => {
    await page.goto(path);
    expect(await seriousAxe(page)).toEqual([]);
  });
}
