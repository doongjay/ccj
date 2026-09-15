import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";

const examples = [
  ["양재IC랑 가깝군. 그런데 진입구에\n유도선이 많은데?", "양재IC랑 가깝군.\n그런데 진입구에\n유도선이 많은데?"],
  ["어라. 타워주차장이었네. 귀찮지만 어쩔수없지.", "어라. 타워주차장이었네.\n귀찮지만 어쩔수없지."],
  ["아하. 잘 먹었다. 이제 집에 가야지.", "아하. 잘 먹었다.\n이제 집에 가야지."],
  ["좋다. 다음으로 가자.", "좋다.\n다음으로 가자."],
  ["셔틀 버스는 5번 출구 앞 이었던것 같은데... 다음 출구로 가자.", "셔틀 버스는 5번 출구 앞 이었던것 같은데... 다음 출구로 가자."],
  ["오후 2.5시간. https://example.com 안내를 보자.", "오후 2.5시간.\nhttps://example.com 안내를 보자."],
  ["여긴 이마트 주차장이네.\n주차 정산이 안될테니 다른 유도선을 타야겠군.", "여긴 이마트 주차장이네.\n주차 정산이 안될테니 다른 유도선을 타야겠군."],
  ["도착했다.다음 장소로 가자.", "도착했다.\n다음 장소로 가자."],
];

for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }]) {
  test(`sentence lines preserve short exclamations, ellipses and typing geometry at ${viewport.width}`, async ({ page }, info) => {
    await page.setViewportSize(viewport);
    await installPlayerObservation(page);
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
    await page.goto("/");
    await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    const observations = [];
    for (const [index, [copy, expected]] of examples.entries()) {
      await page.evaluate(async copy => {
        window.__layoutDialog?.hide();
        const path = "/src/ui/StoryDialog.ts";
        const { StoryDialog } = await import(path) as typeof import("../src/ui/StoryDialog");
        window.__layoutDialog = new StoryDialog((window.__venueQaGame as Phaser.Game).scene.getScene("IntroScene"), "car");
        window.__layoutDialog.show(copy!, [{ label: "진행", onSelect: () => {} }]);
      }, copy);
      const panel = page.locator(".story-overlay:visible .story-narration");
      expect(await panel.locator(".story-reserve").textContent()).toBe(expected);
      const before = await panel.boundingBox();
      await panel.click();
      await expect(page.locator(".story-overlay:visible .story-choice")).toBeEnabled();
      expect(await panel.locator(".story-copy").textContent()).toBe(expected);
      await expect(panel).toHaveAttribute("aria-label", copy!);
      await expect(panel).toHaveCSS("white-space", "pre-line");
      const after = await panel.boundingBox();
      for (const key of ["x", "y", "width", "height"] as const) expect(Math.abs(before![key] - after![key])).toBeLessThanOrEqual(.5);
      expect(after!.y).toBeGreaterThanOrEqual(0);
      expect(after!.y + after!.height).toBeLessThanOrEqual(viewport.height);
      if (index < 2) await page.screenshot({ path: `${process.env.REVIEW_EVIDENCE}/sentence-lines-${index}-${viewport.width}.png` });
      await page.evaluate(copy => window.__layoutDialog!.showInfo(copy!, () => {}, { tapToContinue: true }), copy);
      expect(await page.locator(".story-overlay:visible .story-copy").textContent()).toBe(expected);
      observations.push({ copy, expected, before, after });
    }
    expect(errors).toEqual([]);
    await info.attach("sentence-lines", { body: JSON.stringify({ observations, errors }), contentType: "application/json" });
  });
}
