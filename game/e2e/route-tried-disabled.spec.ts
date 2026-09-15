import { expect, test } from "@playwright/test";
import { installPlayerObservation } from "./corridor-observables";
import { startPreparedScene } from "./stage-fixtures";

test.use({ hasTouch: true });
const evidence = process.env.REVIEW_EVIDENCE!;
const viewports = [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }];

for (const viewport of viewports) for (const route of ["car", "subway"] as const) {
  test(`tried ${route} choices are gray, disabled and reset for a new journey at ${viewport.width}`, async ({ page }, info) => {
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    await installPlayerObservation(page);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", entry => { if (entry.type() === "error") errors.push(entry.text()); });
    await page.goto("/");
    const canvas = page.locator("#app canvas");
    await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
    const scene = route === "car" ? "CarRouteScene" : "SubwayRouteScene";
    await startPreparedScene(page, scene);
    const panel = page.locator(route === "car" ? ".story-car .story-narration" : ".story-station .story-narration");
    await panel.tap();
    const labels = route === "car" ? ["노란색", "분홍색", "파란색"] : ["1번 출구", "2번 출구", "3번 출구", "4번 출구", "5번 출구"];
    const correct = page.getByRole("button", { name: labels.at(-1)!, exact: true });
    await expect(correct).toBeEnabled();
    const initial = await panel.boundingBox();
    const selected = new Set<string>();
    const records = [];
    for (const wrong of route === "car" ? ["노란색"] : ["1번 출구", "3번 출구", "2번 출구", "4번 출구"]) {
      await page.getByRole("button", { name: wrong, exact: true }).tap();
      selected.add(wrong);
      await expect(canvas).toHaveAttribute("data-route-quiz-wrong-count", String(selected.size), { timeout: 10000 });
      const feedback = route === "car" ? "여긴 이마트 주차장이네.\n주차 정산이 안될테니 다른 유도선을 타야겠군." : "셔틀 버스는 5번 출구 앞 이었던것 같은데...";
      await expect(page.locator(".story-copy")).toHaveText(feedback);
      await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", feedback);
      if (selected.size === 1) await page.screenshot({ path: `${evidence}/${route}-wrong-copy-${viewport.width}.png` });
      await expect(correct).toBeEnabled({ timeout: 15000 });
      const returned = await panel.boundingBox();
      for (const key of ["x", "y", "width", "height"] as const) expect(Math.abs(initial![key] - returned![key])).toBeLessThanOrEqual(0.5);
      const buttons = [];
      for (const label of labels) {
        const button = page.getByRole("button", { name: label, exact: true });
        if (selected.has(label)) await expect(button).toBeDisabled();
        else await expect(button).toBeEnabled();
        const data = await button.evaluate(el => {
          const style = getComputedStyle(el), box = el.getBoundingClientRect();
          return { label: el.textContent, disabled: (el as HTMLButtonElement).disabled,
            background: style.backgroundColor, filter: style.filter, after: getComputedStyle(el, "::after").content,
            width: box.width, height: box.height };
        });
        expect(data.after).not.toContain("확인함");
        expect(data.height).toBeGreaterThanOrEqual(44);
        if (selected.has(label)) expect(data.filter).toBe("grayscale(1)");
        buttons.push(data);
      }
      // Native touch on a disabled choice cannot start another trip or increment the count.
      const disabled = page.getByRole("button", { name: wrong, exact: true });
      const box = (await disabled.boundingBox())!;
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(350);
      await expect(canvas).toHaveAttribute("data-route-quiz-wrong-count", String(selected.size));
      await expect(canvas).toHaveAttribute("data-story-state", "choices");
      expect((await page.evaluate(() => window.__venuePlayerSnapshot()))?.moving).toBe(false);
      await page.screenshot({ path: `${evidence}/${route}-tried-${selected.size}-${viewport.width}.png` });
      await panel.focus();
      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: labels.find(label => !selected.has(label))!, exact: true })).toBeFocused();
      records.push({ selected: [...selected], initial, returned, buttons });
    }
    await correct.tap();
    await expect(canvas).toHaveAttribute("data-active-scene", "VenueLobbyScene", { timeout: 15000 });
    await expect(canvas).toHaveAttribute("data-lobby-ready", "true");
    await startPreparedScene(page, scene);
    await panel.tap();
    await expect(correct).toBeEnabled();
    await expect(page.locator(".story-choice[data-tried]")).toHaveCount(0);
    for (const label of labels) await expect(page.getByRole("button", { name: label, exact: true })).toBeEnabled();
    expect(errors).toEqual([]);
    await info.attach("choice-states", { body: JSON.stringify({ viewport, route, records, errors }, null, 2), contentType: "application/json" });
  });
}
