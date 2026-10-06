import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Request } from "@playwright/test";

// The Smart Isnād Explorer on Home: paste an isnād → the model reads it in the browser → the hadiths of the corpus
// that have this isnād are listed and drawn. Isnāds pasted here are read from data/ (word for word, source there);
// the privacy test uses a made-up isnād.

const niyyah = JSON.parse(readFileSync("data/hadiths/niyyah.json", "utf8")) as {
  titleAr: string;
  routes: { id: string; isnadAr: string }[];
};
const route = (id: string) => niyyah.routes.find((r) => r.id === id)!;

test("the sample: the model reads it, the chooser, the chain, the hadiths found and the graph", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "جرّب مثالًا" }).click();

  await expect(page.getByRole("heading", { name: "سبعة أسماء" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("قرأ النموذجُ الأسماء في متصفحك")).toBeVisible({ timeout: 30_000 });
  const chooser = page.getByRole("group", { name: /سُفْيَانُ/ });
  await expect(chooser.getByRole("button", { name: "سفيان بن عيينة" })).toHaveAttribute("aria-pressed", "true");
  // The explorer: a summary with real counts, the shared-chain graph, and the list.
  const summary = page.getByRole("status").filter({ hasText: "وجدنا" });
  await expect(summary).toContainText("بالإسناد نفسه", { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "الإسناد المشترك في رسم واحد" })).toBeVisible();
  await expect(page.getByLabel("شجرة الأسانيد").first()).toBeVisible();

  // Bukhari 1 is in the list as the same isnād, with all six names and its status.
  const first = page.getByRole("listitem").filter({ hasText: "صحيح البخاري، حديث ١" }).first();
  await expect(first).toContainText("الإسناد نفسه", { timeout: 30_000 });
  await expect(first).toContainText("٦ من ٦ رواة");
  await expect(first).toContainText("يحتاج تحققًا — من مجموعة خارجية");
  await expect(first.locator("mark").first()).toBeVisible();

  // The verified route is still found in its tree.
  await expect(page.getByRole("link", { name: "اعرض الإسناد في الشجرة" })).toHaveAttribute("href", "/hadith/niyyah?isnad=bukhari-1", { timeout: 30_000 });
});

test("filters: by book, by match type, and by a name", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("نصّ الإسناد").fill(route("bukhari-1").isnadAr);
  await page.getByRole("button", { name: "حلِّل الإسناد" }).click();
  await expect(page.getByRole("status").filter({ hasText: "وجدنا" })).toBeVisible({ timeout: 30_000 });

  const all = page.getByRole("button", { name: /^الكل \(/ }).first();
  const total = Number(((await all.textContent()) ?? "").replace(/[^٠-٩]/g, "").replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))));
  expect(total).toBeGreaterThan(1);

  await page.getByRole("button", { name: /^صحيح البخاري \(/ }).click();
  const shown = page.getByRole("status").filter({ hasText: "يظهر" });
  await expect(shown).toBeVisible();
  for (const li of await page.getByRole("listitem").filter({ hasText: "حديث" }).all())
    if ((await li.locator("b").count()) > 0) await expect(li.locator("b").first()).toContainText("صحيح البخاري");

  await page.getByRole("button", { name: /^الإسناد نفسه \(/ }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "الإسناد نفسه" }).first()).toBeVisible();

  await page.getByLabel("ضيِّق النتائج بأسماء من الإسناد").fill("قزقز");
  await expect(page.getByText("لا حديث يوافق هذا التضييق.")).toBeVisible();
});

test("a hadith found opens its page, with the evidence and its status", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("نصّ الإسناد").fill(route("bukhari-1").isnadAr);
  await page.getByRole("button", { name: "حلِّل الإسناد" }).click();
  const first = page.getByRole("listitem").filter({ hasText: "صحيح البخاري، حديث ١" }).first();
  await first.getByRole("link", { name: "افتح الحديث" }).click();
  await expect(page).toHaveURL(/\/c\/bukhari\/1$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("صحيح البخاري، حديث ١");
  await expect(page.getByText("يحتاج تحققًا — من مجموعة خارجية").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "افتح ملف المصدر" })).toHaveAttribute("href", /hadith-api@df57907be35291c91ad6a6691180e22ca9920784\/editions\/ara-bukhari\.min\.json$/);
  await expect(page.getByRole("region", { name: "كيف أتحقق من هذا؟" })).toBeVisible();
});

test("Ctrl+Enter analyses", async ({ page }) => {
  await page.goto("/");
  const box = page.getByLabel("نصّ الإسناد");
  await box.fill(route("bukhari-1").isnadAr);
  await box.press("Control+Enter");
  await expect(page.getByRole("heading", { name: "السلسلة كما وردت" })).toBeVisible({ timeout: 30_000 });
});

test("input rules: empty, too long, not an isnad", async ({ page }) => {
  await page.goto("/");
  const analyse = page.getByRole("button", { name: "حلِّل الإسناد" });
  const box = page.getByLabel("نصّ الإسناد");
  const problem = page.locator("#isnad-problem");

  await analyse.click();
  await expect(problem).toHaveText("الصق نصّ الإسناد أولًا.");
  await expect(box).toBeFocused();

  await box.fill("حدثنا زيد عن عمرو ".repeat(120));
  await analyse.click();
  await expect(problem).toContainText("النص أطول من ٢٠٠٠ حرف");

  await box.fill("هذا كلام عادي ليس فيه شيء من ذلك البتة");
  await analyse.click();
  await expect(problem).toContainText("لم نجد في النص إسنادًا", { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "السلسلة كما وردت" })).toHaveCount(0);
});

test("an isnād that is not in the corpus: nothing found, nothing invented", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("نصّ الإسناد").fill("حدثنا قزمان بن طرخان، عن هلال بن سمعان، عن ترتان بن مرتان");
  await page.getByRole("button", { name: "حلِّل الإسناد" }).click();
  await expect(page.getByText("لم نجد في المجموعة حديثًا بهذا الإسناد.")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("listitem").filter({ hasText: "صحيح" })).toHaveCount(0);
});

test("fallback: with the model blocked the rules read the isnād, the page says so, and results still come", async ({ page }) => {
  await page.route("**/models/**", (r) => r.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "جرّب مثالًا" }).click();
  await expect(page.getByText("تعمل الآن الطريقة البديلة (القواعد)")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("قرأت القواعدُ الأسماء في متصفحك")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "وجدنا" })).toContainText("بالإسناد نفسه", { timeout: 30_000 });
});

test("privacy: no request carries the pasted text; only this site's static files are fetched", async ({ page, baseURL }) => {
  // Made-up names, so the text cannot appear in any page or data file.
  const secret = "حدثنا قزمان بن طرخان عن هلال بن سمعان عن زيد بن خالد";
  const seen: Request[] = [];
  page.on("request", (r) => seen.push(r));
  await page.goto("/");
  await page.getByLabel("نصّ الإسناد").fill(secret);
  await page.getByRole("button", { name: "حلِّل الإسناد" }).click();
  await expect(page.getByRole("heading", { name: "السلسلة كما وردت" })).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(800);

  const needles = [secret, "قزمان", encodeURIComponent("قزمان"), encodeURIComponent(secret)];
  for (const r of seen) {
    const haystack = `${r.url()}\n${r.postData() ?? ""}`;
    for (const n of needles) expect(haystack, `request ${r.method()} ${r.url()}`).not.toContain(n);
    expect(r.method()).toBe("GET");
  }
  // Nothing leaves the site while analysing: every request goes to the site's own origin.
  // (A Vercel preview adds its own toolbar script from vercel.live; a production deployment does not.)
  const origin = new URL(baseURL!).origin;
  for (const r of seen) if (!r.url().startsWith("https://vercel.live/")) expect(new URL(r.url()).origin, r.url()).toBe(origin);
  await expect(page).toHaveURL(/\/$/);
});

test("accessibility: no serious or critical axe issues, before and after a result", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const before = await new AxeBuilder({ page }).analyze();
  expect(before.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);

  await page.getByRole("button", { name: "جرّب مثالًا" }).click();
  await expect(page.getByRole("status").filter({ hasText: "وجدنا" })).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(500);
  const after = await new AxeBuilder({ page }).analyze();
  expect(after.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});
