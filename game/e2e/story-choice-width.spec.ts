import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";

for (const width of [320, 393]) {
  test(`story choices keep readable equal widths within each placement at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 852 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await installPlayerObservation(page);
    await page.goto("/");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    const widths: number[] = [];
    for (const placement of ["default", "bottom", "station", "photo"] as const) {
      await page.evaluate(async placement => {
        document.querySelectorAll(".story-overlay").forEach(node => node.remove());
        const path = "/src/ui/StoryDialog.ts";
        const { StoryDialog } = await import(path);
        const game = window.__venueQaGame as Phaser.Game;
        const dialog = new StoryDialog(game.scene.getScene("IntroScene"), placement);
        const labels = placement === "station" ? ["1번 출구", "2번 출구", "3번 출구", "4번 출구", "5번 출구"] : ["포토부스에서 사진 찍기", "포토테이블 구경하기", "축의대에서 접수하기"];
        dialog.show("웨딩홀에 들어가기 전에 둘러볼까?", labels.map(label => ({ label, onSelect: () => {} })));
      }, placement);
      const audit = await page.locator(".story-choices .story-choice").evaluateAll(nodes => nodes.map(node => ({
        width: node.getBoundingClientRect().width, fits: node.scrollWidth <= node.clientWidth,
        height: node.getBoundingClientRect().height,
      })));
      expect(audit.length).toBe(placement === "station" ? 5 : 3);
      expect(audit.every(item => item.fits && item.height >= 44)).toBe(true);
      expect(Math.max(...audit.map(item => item.width)) - Math.min(...audit.map(item => item.width))).toBeLessThanOrEqual(1);
      expect(audit.every(item => item.width >= 44)).toBe(true);
      if (placement !== "station") widths.push(...audit.map(item => item.width));
      if (placement === "default") await page.screenshot({ path: testInfo.outputPath("equal-choice-width.png") });
    }
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
  });
}
