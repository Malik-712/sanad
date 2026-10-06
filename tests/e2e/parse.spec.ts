import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Request } from "@playwright/test";

// /parse end to end. Routes pasted here are read from data/ (word for word, with their source there);
// the privacy test uses a made-up isnad.

const niyyah = JSON.parse(readFileSync("data/hadiths/niyyah.json", "utf8")) as {
  titleAr: string;
  routes: { id: string; isnadAr: string }[];
};
const route = (id: string) => niyyah.routes.find((r) => r.id === id)!;

test("the sample: names, the «سفيان» chooser, the chain and the match card", async ({ page }) => {
  await page.goto("/parse");
  await page.getByRole("button", { name: "جرّب مثالًا" }).click();

  await expect(page.getByRole("heading", { name: "سبعة أسماء" })).toBeVisible();
  const chooser = page.getByRole("group", { name: /سُفْيَانُ/ });
  await expect(chooser.getByRole("button", { name: "سفيان بن عيينة" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("نقطة الالتقاء")).toBeVisible();

  const show = page.getByRole("link", { name: "اعرض الإسناد في الشجرة" });
  await expect(show).toHaveAttribute("href", "/hadith/niyyah?isnad=bukhari-1");

  // Choosing the other «سفيان» changes the chain: it is no longer this route.
  await chooser.getByRole("button", { name: "سفيان الثوري" }).click();
  await expect(page.getByText("لم نجده في شجرة بعد", { exact: true })).toBeVisible();
  await expect(show).toHaveCount(0);

  await page.getByRole("group", { name: /سُفْيَانُ/ }).getByRole("button", { name: "سفيان بن عيينة" }).click();
  await expect(page.getByRole("link", { name: "اعرض الإسناد في الشجرة" })).toBeVisible();
});

test("pasting another route from data/ finds its tree", async ({ page }) => {
  await page.goto("/parse");
  await page.getByLabel("نصّ الإسناد").fill(route("bukhari-2529").isnadAr);
  await page.getByRole("button", { name: "حلِّل الإسناد" }).click();
  await expect(page.getByRole("link", { name: "اعرض الإسناد في الشجرة" })).toHaveAttribute(
    "href",
    "/hadith/niyyah?isnad=bukhari-2529",
  );
});

test("Ctrl+Enter analyses", async ({ page }) => {
  await page.goto("/parse");
  const box = page.getByLabel("نصّ الإسناد");
  await box.fill(route("bukhari-1").isnadAr);
  await box.press("Control+Enter");
  await expect(page.getByRole("heading", { name: "السلسلة كما وردت" })).toBeVisible();
});

test("input rules: empty, too long, not an isnad", async ({ page }) => {
  await page.goto("/parse");
  const analyse = page.getByRole("button", { name: "حلِّل الإسناد" });
  const box = page.getByLabel("نصّ الإسناد");
  const problem = page.locator("#isnad-problem");

  await analyse.click();
  await expect(problem).toHaveText("الصق نصّ الإسناد أولًا.");
  await expect(problem).toHaveAttribute("role", "alert");
  await expect(box).toBeFocused();

  await box.fill("حدثنا زيد عن عمرو ".repeat(120));
  await analyse.click();
  await expect(problem).toContainText("النص أطول من ٢٠٠٠ حرف");

  await box.fill("هذا كلام عادي ليس فيه شيء من ذلك البتة");
  await analyse.click();
  await expect(problem).toContainText("لم نجد في النص إسنادًا");
  await expect(page.getByRole("heading", { name: "السلسلة كما وردت" })).toHaveCount(0);
});

test("privacy: no request carries the pasted text", async ({ page }) => {
  // Made-up names, so the text cannot appear in any page or data file.
  const secret = "حدثنا قزمان بن طرخان عن هلال بن سمعان عن زيد بن خالد";
  const seen: Request[] = [];
  page.on("request", (r) => seen.push(r));
  await page.goto("/parse");
  await page.getByLabel("نصّ الإسناد").fill(secret);
  await page.getByRole("button", { name: "حلِّل الإسناد" }).click();
  await expect(page.getByRole("heading", { name: "السلسلة كما وردت" })).toBeVisible();
  await page.waitForTimeout(500);

  const needles = [secret, "قزمان", encodeURIComponent("قزمان"), encodeURIComponent(secret)];
  for (const r of seen) {
    const haystack = `${r.url()}\n${r.postData() ?? ""}`;
    for (const n of needles) expect(haystack, `request ${r.method()} ${r.url()}`).not.toContain(n);
  }
  // Nothing after the page load is sent anywhere except static files of the site itself.
  for (const r of seen) expect(r.method()).toBe("GET");
  await expect(page).toHaveURL(/\/parse$/);
});

test("accessibility: no serious or critical axe issues, before and after a result", async ({ page }) => {
  // Reduced motion: axe measures colours after the results have faded in.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/parse");
  const before = await new AxeBuilder({ page }).analyze();
  expect(before.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);

  await page.getByRole("button", { name: "جرّب مثالًا" }).click();
  await expect(page.getByRole("heading", { name: "السلسلة كما وردت" })).toBeVisible();
  const after = await new AxeBuilder({ page }).analyze();
  expect(after.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});
