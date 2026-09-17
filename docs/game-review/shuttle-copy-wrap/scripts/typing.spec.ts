import { expect, test } from "../../../../game/node_modules/@playwright/test/index.mjs";
import { installPlayerObservation } from "../../../../game/e2e/corridor-observables";
import { startPreparedScene } from "../../../../game/e2e/stage-fixtures";

for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }]) {
  test(`wrong-exit letters stay on their final lines while typing at ${viewport.width}`, async ({ page }, info) => {
    await page.setViewportSize(viewport);
    await installPlayerObservation(page);
    await page.goto("/");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    await startPreparedScene(page, "SubwayRouteScene");
    await page.locator(".story-narration").click();
    await expect(page.getByRole("button", { name: "1번 출구", exact: true })).toBeEnabled();
    await page.evaluate(() => {
      const samples: { copy: string; maxShift: number }[] = [];
      (window as unknown as { typingSamples: typeof samples }).typingSamples = samples;
      new MutationObserver(() => {
        const panel = document.querySelector('.story-narration[aria-label^="셔틀버스는"]');
        const copy = panel?.querySelector(".story-copy");
        const reserve = panel?.querySelector(".story-reserve");
        if (!copy?.firstChild || !reserve?.firstChild) return;
        let maxShift = 0;
        const value = copy.textContent!;
        for (let i = 0; i < value.length; i++) {
          if (/\s/.test(value[i])) continue;
          const a = document.createRange(), b = document.createRange();
          a.setStart(copy.firstChild, i); a.setEnd(copy.firstChild, i + 1);
          b.setStart(reserve.firstChild, i); b.setEnd(reserve.firstChild, i + 1);
          const current = a.getBoundingClientRect(), final = b.getBoundingClientRect();
          maxShift = Math.max(maxShift, Math.abs(current.x - final.x), Math.abs(current.y - final.y));
        }
        samples.push({ copy: value, maxShift });
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    await page.getByRole("button", { name: "1번 출구", exact: true }).click();
    const panel = page.locator('.story-narration[aria-label^="셔틀버스는"]');
    await expect(panel).toBeVisible({ timeout: 10000 });
    await expect(panel.locator(".story-copy")).not.toBeEmpty();
    await page.screenshot({ path: info.outputPath(`shuttle-typing-${viewport.width}.png`) });
    await expect(panel.locator(".story-copy")).toHaveText("셔틀버스는\n5번 출구 앞 이었던것 같은데...");
    await page.screenshot({ path: info.outputPath(`shuttle-complete-${viewport.width}.png`) });
    const samples = await page.evaluate(() => (window as unknown as { typingSamples: { copy: string; maxShift: number }[] }).typingSamples);
    expect(samples.length).toBeGreaterThan(10);
    expect(Math.max(...samples.map(s => s.maxShift))).toBeLessThanOrEqual(0.5);
    await info.attach("typing-positions", { body: JSON.stringify({ viewport, samples }), contentType: "application/json" });
  });
}
