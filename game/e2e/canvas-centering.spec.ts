import { expect, test } from "@playwright/test";

test("game canvas stays centered and proportional on viewport resize", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  for (const viewport of [{ width: 2048, height: 922 }, { width: 390, height: 844 },
    { width: 768, height: 1024 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => {
      const box = await canvas.boundingBox();
      if (box === null) return Number.POSITIVE_INFINITY;
      return Math.max(Math.abs(box.x + box.width / 2 - viewport.width / 2),
        Math.abs(box.y + box.height / 2 - viewport.height / 2));
    }).toBeLessThanOrEqual(1);
    const box = await canvas.boundingBox();
    if (box === null) throw new Error("Game canvas is missing.");
    expect(box.width / box.height).toBeCloseTo(720 / 1280, 2);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
  }
});
