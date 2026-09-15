import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { writeFile } from "node:fs/promises";
import { enterLobby, clickGame } from "./story-helpers";
import { installPlayerObservation } from "./corridor-observables";
import { REVIEW_EVIDENCE as evidence } from "./review-evidence";

test("F21/F22 real lobby resize: readable nameplates, unchanged targets and portrait/landscape frame", async ({ page }) => {
  test.setTimeout(60000); await installPlayerObservation(page);
  await page.setViewportSize({ width: 393, height: 852 }); await page.goto("/"); await enterLobby(page, "car", "bride");
  const observations: unknown[] = [];
  for (const [width, height] of [[320, 568], [393, 852], [430, 932], [1440, 900], [852, 393], [393, 650], [393, 852]]) {
    await page.setViewportSize({ width: width!, height: height! }); await page.waitForTimeout(200);
    const layout = await page.evaluate(() => ({ viewport: [innerWidth, innerHeight], scroll: [document.body.scrollHeight, document.documentElement.scrollHeight], nodes: [...document.body.children].map(n => ({ tag: n.tagName, className: n.className, bounds: n.getBoundingClientRect().toJSON() })) }));
    await writeFile(`${evidence}/frame-layout-${width}x${height}.json`, JSON.stringify(layout, null, 2));
    expect(await page.evaluate(() => ({ scroll: document.body.scrollHeight > innerHeight, background: getComputedStyle(document.querySelector("#app")!).backgroundColor }))).toEqual({ scroll: false, background: "rgb(248, 242, 231)" });
    const labels = await page.evaluate(() => {
      const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("VenueLobbyScene");
      const scale = scene.game.canvas.getBoundingClientRect().width / 720;
      return scene.children.list.filter(c => c.name.startsWith("lobby-label-")).map(c => {
        const text = c as Phaser.GameObjects.Text, bounds = text.getBounds();
        return { name: text.text, font: Number(String(text.style.fontSize).replace("px", "")) * scale, bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height } };
      });
    });
    const box = (await page.locator("#app canvas").boundingBox())!;
    expect(box.width / box.height).toBeCloseTo(720 / 1280, 2);
    if (width! < height! || height! > 600) {
      expect(labels).toHaveLength(8);
      expect(labels.every(l => l.font >= 14)).toBe(true);
      for (const [i, a] of labels.entries()) {
        expect(a.bounds.x).toBeGreaterThanOrEqual(0); expect(a.bounds.x + a.bounds.width).toBeLessThanOrEqual(720);
        for (const b of labels.slice(i + 1)) expect(a.bounds.x < b.bounds.x + b.bounds.width && a.bounds.x + a.bounds.width > b.bounds.x && a.bounds.y < b.bounds.y + b.bounds.height && a.bounds.y + a.bounds.height > b.bounds.y).toBe(false);
      }
      await expect(page.getByRole("button", { name: "청첩장", exact: true })).toBeVisible();
      await clickGame(page, 128, 60); await expect(page.locator(".story-info-notebook")).toBeVisible(); await page.keyboard.press("Escape");
    } else await expect(page.getByRole("button", { name: "청첩장 바로 보기", exact: true })).toBeVisible();
    await page.screenshot({ path: `${evidence}/f21-f22-lobby-${width}x${height}.png` });
    observations.push({ width, height, box, labels });
  }
  await writeFile(`${evidence}/frame-geometry.json`, JSON.stringify({ observations, limitation: "Desktop Chromium viewport automation; no physical phone/browser toolbar or native keyboard certification." }, null, 2));
});
