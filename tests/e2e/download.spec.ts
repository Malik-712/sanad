import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// «تنزيل صورة»: the tree is saved as a PNG named after the hadith, on the hadith page and in the explorer.
// SAVE_DIR=<folder> keeps the pictures so they can be looked at.

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 1024;
const PNG_SIGNATURE = "89504e470d0a1a0a";

async function saved(download: import("@playwright/test").Download, name: string) {
  const path = await download.path();
  const bytes = readFileSync(path);
  expect(bytes.subarray(0, 8).toString("hex")).toBe(PNG_SIGNATURE);
  // PNG header: width and height are the two 32-bit numbers after the «IHDR» tag.
  const w = bytes.readUInt32BE(16);
  const h = bytes.readUInt32BE(20);
  expect(w).toBeGreaterThan(2000); // drawn at 3× for print quality
  expect(h).toBeGreaterThan(1500);
  if (process.env.SAVE_DIR) await download.saveAs(`${process.env.SAVE_DIR}/${name}`);
}

test("hadith page: the download button saves a PNG named after the hadith", async ({ page }, info) => {
  await page.goto("/hadith/niyyah");
  const button = page.getByRole("button", { name: "تنزيل الشجرة صورة" }).or(page.getByRole("button", { name: "تنزيل صورة" })).first();
  await expect(button).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent("download"), button.click()]);
  expect(download.suggestedFilename()).toBe("sanad-niyyah.png");
  await saved(download, `niyyah-${info.project.name}.png`);
});

test("explorer: the shared-chain graph saves a PNG", async ({ page }, info) => {
  test.skip(isMobile(page), "same code path as the hadith page; the explorer flow is covered on desktop");
  await page.goto("/");
  await page.getByRole("button", { name: "جرّب مثالًا" }).click();
  await expect(page.getByRole("heading", { name: "الإسناد المشترك في رسم واحد" })).toBeVisible({ timeout: 60_000 });
  const button = page.getByRole("button", { name: "تنزيل صورة" }).first();
  await expect(button).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent("download"), button.click()]);
  expect(download.suggestedFilename()).toBe("sanad-shared-chain.png");
  await saved(download, `explorer-${info.project.name}.png`);
});
