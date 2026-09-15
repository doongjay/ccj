import { expect, test, type Page } from "@playwright/test";
import type Phaser from "phaser";
import type { StoryDialog } from "../src/ui/StoryDialog";
import { installPlayerObservation } from "./corridor-observables";
import { startPreparedScene } from "./stage-fixtures";
import { chooseStory, clickGame, dismissLobbyArrival, fillProfile } from "./story-helpers";

type Sample = { id: number; scene: string; copy: string; state: string; rect: { x: number; y: number; width: number; height: number } };
declare global {
  interface Window { __layoutDialog?: StoryDialog; __layoutSelected: number; __layoutSamples: Sample[] }
}

async function observe(page: Page): Promise<void> {
  await installPlayerObservation(page);
  await page.addInitScript(() => {
    window.__layoutSamples = [];
    const ids = new WeakMap<Element, number>();
    let nextId = 0;
    const sample = () => {
      for (const panel of document.querySelectorAll(".story-overlay:not([hidden]) > button.story-narration")) {
        if (!ids.has(panel)) ids.set(panel, ++nextId);
        const { x, y, width, height } = panel.getBoundingClientRect();
        window.__layoutSamples.push({ id: ids.get(panel)!, copy: panel.getAttribute("aria-label") ?? "", scene: document.querySelector("canvas")?.dataset.activeScene ?? "", state: document.querySelector("canvas")?.dataset.storyState ?? "", rect: { x, y, width, height } });
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await page.evaluate(() => document.fonts.ready);
}

const viewports = [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }];
const placements = ["default", "bottom", "station", "photo", "group-photo", "car", "parking", "ceremony", "notebook"] as const;

for (const viewport of viewports) {
  test(`all nine dialogue placements stay fixed while choices appear at ${viewport.width}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
    await observe(page);
    // This matrix mounts dialogs on Intro only as a rendering fixture. Its
    // unrelated start buttons must not navigate while testing focus/activation.
    await page.evaluate(() => {
      const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("IntroScene");
      for (const child of scene.children.list) child.disableInteractive();
    });
    const measurements = [];
    for (const placement of placements) {
      const before = await page.evaluate(async placement => {
        window.__layoutDialog?.hide();
        const path = "/src/ui/StoryDialog.ts";
        const { StoryDialog } = await import(path) as typeof import("../src/ui/StoryDialog");
        const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("IntroScene");
        const dialog = window.__layoutDialog = new StoryDialog(scene, placement);
        window.__layoutSelected = 0;
        const labels = placement === "station" ? ["1번\n출구", "2번\n출구", "3번\n출구", "4번\n출구", "5번\n출구"] : placement === "car" ? ["노란색", "분홍색", "파란색"] : ["계속 둘러보기", "로비로 돌아가기"];
        dialog.show("양재시민의숲역에서 내리라고 했지.\n근데 셔틀이 몇번 출구더라?", labels.map((label, index) => ({ label, tried: placement === "car" && index === 0, onSelect: () => { window.__layoutSelected++; } })));
        const panel = document.querySelector(".story-overlay:not([hidden]) .story-narration")!;
        const { x, y, width, height } = panel.getBoundingClientRect();
        return { x, y, width, height };
      }, placement);
      const overlay = page.locator(".story-overlay:visible");
      await expect(overlay.locator(".story-choice:visible")).toHaveCount(0);
      await expect(overlay.getByRole("button")).toHaveCount(1);
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest(".story-choices"))).toBe(false);
      if (placement === "station" || placement === "bottom") await page.screenshot({ path: testInfo.outputPath(`${placement}-typing-${viewport.width}.png`) });
      if (placement === "station") {
        await expect(page.locator("canvas")).toHaveAttribute("data-story-state", "choices");
      } else if (placement === "bottom") {
        await overlay.locator(".story-narration").focus();
        await page.keyboard.press("Enter");
      } else await overlay.locator(".story-narration").click();
      const after = await overlay.locator(".story-narration").boundingBox();
      expect(after).not.toBeNull();
      const delta = Math.max(...(["x", "y", "width", "height"] as const).map(key => Math.abs(before[key] - after![key])));
      measurements.push({ placement, before, after, delta });
      expect.soft(delta, `${placement}: narration moved when choices appeared`).toBeLessThanOrEqual(0.5);
      expect(await page.evaluate(() => window.__layoutSelected)).toBe(0);
      if (placement === "car") await expect(overlay.locator(".story-choice[data-tried]" )).toBeDisabled();
      const first = overlay.locator(".story-choice:not([data-tried])").first();
      await expect(first).toBeVisible();
      await expect(first).toBeEnabled();
      if (placement === "station") {
        const geometry = await overlay.evaluate(node => {
          const panel = node.querySelector(".story-narration")!.getBoundingClientRect();
          const choices = node.querySelector(".story-choices")!.getBoundingClientRect();
          return { height: panel.height, spaceBelow: node.getBoundingClientRect().bottom - choices.bottom };
        });
        expect(Math.abs(geometry.spaceBelow - geometry.height - 8)).toBeLessThanOrEqual(0.5);
      }
      if (placement === "station" || placement === "bottom") await page.screenshot({ path: testInfo.outputPath(`${placement}-choices-${viewport.width}.png`) });
      await first.click();
      expect(await page.evaluate(() => window.__layoutSelected)).toBe(1);
    }
    await testInfo.attach("layout-measurements", { body: JSON.stringify(measurements, null, 2), contentType: "application/json" });
    await testInfo.attach("rendered-frame-samples", { body: JSON.stringify(await page.evaluate(() => window.__layoutSamples)), contentType: "application/json" });
    expect(errors).toEqual([]);
  });

  test(`real choice scenes keep their narration position at ${viewport.width}`, async ({ page }, testInfo) => {
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
    await observe(page);
    const audit = async (name: string, natural = false) => {
      const panel = page.locator(".story-overlay:visible .story-narration");
      await expect(panel).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath(`${name}-typing-${viewport.width}.png`) });
      if (!natural && await page.locator("canvas").getAttribute("data-story-state") === "typing") await panel.click();
      await expect(page.locator("canvas")).toHaveAttribute("data-story-state", "choices");
      await expect(page.locator(".story-overlay:visible .story-choice").first()).toBeEnabled();
      await page.screenshot({ path: testInfo.outputPath(`${name}-choices-${viewport.width}.png`) });
    };
    await startPreparedScene(page, "HomeSelectScene");
    await fillProfile(page);
    await audit("guest-side");
    await page.getByRole("button", { name: "신랑측", exact: true }).click();
    await audit("travel-mode");
    await startPreparedScene(page, "SubwayRouteScene");
    await audit("subway", true);
    await startPreparedScene(page, "CarRouteScene");
    await audit("car");
    await startPreparedScene(page, "ReceptionScene");
    await audit("reception");
    await startPreparedScene(page, "VenueLobbyScene");
    await expect(page.locator("canvas")).toHaveAttribute("data-lobby-ready", "true");
    await dismissLobbyArrival(page);
    await clickGame(page, 360, 150);
    await expect(page.locator("canvas")).toHaveAttribute("data-lobby-info", "meal-order");
    await audit("meal-order");
    await startPreparedScene(page, "VenueHallScene");
    await audit("ceremony");
    await page.getByRole("button", { name: "박수를 친다", exact: true }).click();
    await expect(page.locator("canvas")).toHaveAttribute("data-ceremony-stage", "group-photo");
    await audit("group-photo");
    await chooseStory(page, "사진 찍기");
    await clickGame(page, 360, 600);
    await expect(page.locator("canvas")).toHaveAttribute("data-ceremony-stage", "photo");
    await clickGame(page, 360, 600);
    await audit("photo-complete");
    await startPreparedScene(page, "EndingScene");
    await page.getByRole("button", { name: "나중에 남기기", exact: true }).click();
    await audit("ending");
    const samples = await page.evaluate(() => window.__layoutSamples);
    await testInfo.attach("real-scenes-rendered-frames", { body: JSON.stringify(samples), contentType: "application/json" });
    const groups = [...new Set(samples.map(s => s.id))].map(id => samples.filter(s => s.id === id));
    const complete = groups.filter(g => g.some(s => s.state === "typing") && g.some(s => s.state === "choices"));
    expect(complete.length).toBe(10);
    for (const group of complete) {
      for (const key of ["x", "y", "width", "height"] as const) {
        const values = group.map(s => s.rect[key]);
        expect(Math.max(...values) - Math.min(...values), `${group[0]!.scene} ${group[0]!.copy} ${key}`).toBeLessThanOrEqual(0.5);
      }
    }
    expect(errors).toEqual([]);
  });
}
