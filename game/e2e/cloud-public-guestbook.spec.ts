import { expect, test } from "@playwright/test";

test.skip(process.env.VITE_SUPABASE_URL !== "http://127.0.0.1:54321", "Run npm run test:cloud.");
const entries = Array.from({ length: 31 }, (_, index) => ({
  id: `11111111-1111-4111-8111-${String(index + 1).padStart(12, "0")}`,
  name: `하객 ${index + 1}`, side: index % 2 ? "bride" : "groom", message: `${index + 1}번째 축하 메시지`,
  avatar: { gender: index % 2 ? "female" : "male", outfit: index === 0 ? 999 : index % 6, hair: index % 3, face: index % 3 },
  created_at: new Date(Date.UTC(2026, 8, 16, 0, index)).toISOString(),
}));

test("a new visitor sees everyone's messages and their avatars across photo pages without signing in", async ({ page }) => {
  let signIns = 0;
  await page.route("**/auth/v1/**", route => { signIns++; return route.abort(); });
  await page.route("**/rest/v1/guestbook_entries**", route => route.fulfill({ json: entries }));
  await page.setViewportSize({ width: 375, height: 852 });
  await page.goto("/#invitation");
  await expect(page.locator(".invitation-message")).toHaveCount(31);
  await expect(page.locator(".minimi-wall-count")).toHaveText("함께한 친구 31명");
  await expect(page.locator(".minimi-guest")).toHaveCount(30);
  await page.locator(".minimi-wall").scrollIntoViewIfNeeded();
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 852 });
    await page.screenshot({ path: test.info().outputPath(`public-avatars-${width}.png`) });
  }
  await page.getByRole("button", { name: "다음 미니미", exact: true }).click();
  await expect(page.locator(".minimi-guest")).toHaveCount(1);
  await page.getByRole("button", { name: "하객 31님의 메시지 보기", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("31번째 축하 메시지");
  expect(signIns).toBe(0);
});
