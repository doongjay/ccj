import { expect, test, type Page } from "@playwright/test";
import type Phaser from "phaser";
import { writeFile } from "node:fs/promises";
import { installPlayerObservation } from "./corridor-observables";
import { startPreparedScene } from "./stage-fixtures";
import { chooseStory, fillProfile } from "./story-helpers";

const evidence = process.env.REVIEW_EVIDENCE!;
const before = process.env.HALL_CAPTURE_PHASE === "before";
const sizes = before ? [{ width: 393, height: 852 }] : [
  { width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 },
];
const cases = sizes.flatMap(viewport => (["applause", "cheer"] as const).flatMap(reaction =>
  (before ? ["groom"] as const : ["groom", "bride"] as const).map(side => ({ viewport, reaction, side, reduced: false }))));
if (!before) cases.push({ viewport: { width: 393, height: 852 }, reaction: "cheer", side: "bride", reduced: true });

async function geometry(page: Page) {
  return page.evaluate(() => {
    const rect = (el: Element) => {
      const { x, y, width, height, top, bottom, left, right } = el.getBoundingClientRect();
      return { x, y, width, height, top, bottom, left, right };
    };
    return { canvas: rect(document.querySelector("#app canvas")!),
      panel: rect(document.querySelector(".story-overlay:not([hidden]) .story-narration")!),
      buttons: [...document.querySelectorAll(".story-overlay:not([hidden]) .story-choice")].map(rect) };
  });
}

for (const { viewport, reaction, side, reduced } of cases) {
  test(`hall subjects, screen-centred copy and frame actions ${viewport.width} ${reaction} ${side}${reduced ? " reduced" : ""}`, async ({ page }, info) => {
    test.setTimeout(60000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: reduced ? "reduce" : "no-preference" });
    const suffix = `${viewport.width}-${reaction}-${side}${reduced ? "-reduced" : ""}`;
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
    await installPlayerObservation(page);
    await page.goto("/");
    await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    await startPreparedScene(page, "HomeSelectScene");
    await fillProfile(page, "테스트하객", side === "bride" ? "female" : "male");
    await chooseStory(page, side === "bride" ? "신부측" : "신랑측");
    if (side === "bride") await page.evaluate(async () => {
      const path = "/src/state/gameState.ts";
      const { completeProgressionFlag, PROGRESSION_FLAGS } = await import(path) as typeof import("../src/state/gameState");
      completeProgressionFlag((window.__venueQaGame as Phaser.Game).registry, PROGRESSION_FLAGS.bridalRoomVisited);
    });
    await startPreparedScene(page, "VenueHallScene");
    await page.locator(".story-narration").click();
    await expect(page.getByRole("button", { name: "박수를 친다", exact: true })).toBeEnabled();
    const ceremony = await geometry(page);
    await page.screenshot({ path: `${evidence}/ceremony-choice-${suffix}.png` });
    if (!before) {
      const { canvas, panel, buttons } = ceremony;
      expect(panel.top).toBeGreaterThan(canvas.top + canvas.height * 746 / 1280);
      expect(panel.bottom).toBeLessThan(canvas.top + canvas.height * 952 / 1280);
      expect(buttons[0]!.top - panel.bottom).toBeCloseTo(8, 0);
      expect(buttons[0]!.right).toBeLessThan(canvas.left + canvas.width * 328 / 720 - 4);
      expect(buttons[1]!.left).toBeGreaterThan(canvas.left + canvas.width * 392 / 720 + 4);
      expect(buttons[1]!.top).toBeCloseTo(buttons[0]!.top, 1);
      for (const button of buttons) expect(button.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole("button", { name: reaction === "applause" ? "박수를 친다" : "환호를 한다", exact: true }).click();
    await expect(page.locator("canvas")).toHaveAttribute("data-ceremony-stage", "reaction");
    await page.waitForTimeout(260);
    const reply = await page.evaluate(() => {
      const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("VenueHallScene");
      const label = scene.children.list.find(child => child.getData("recipient")) as Phaser.GameObjects.Text | undefined;
      return label ? { x: label.x, y: label.y, recipient: label.getData("recipient"), text: label.text } : null;
    });
    if (!before) expect(reply).toMatchObject({ x: side === "bride" ? 395 : 320, recipient: side });
    await page.screenshot({ path: `${evidence}/ceremony-response-${suffix}.png` });
    await expect(page.locator("canvas")).toHaveAttribute("data-ceremony-stage", "group-photo");
    await page.locator(".story-narration").click();
    await expect(page.getByRole("button", { name: "사진 찍기", exact: true })).toBeEnabled();
    const group = await geometry(page);
    await page.screenshot({ path: `${evidence}/group-photo-ready-${suffix}.png` });
    const greetings: { text: string; x: number; y: number; width: number; height: number; fontSize: string | number; scaleX: number; scaleY: number }[] = [];
    if (!before) {
      await expect(page.locator("canvas")).toHaveAttribute("data-group-player-marker", "false");
      const sampleGreeting = () => page.evaluate(() => {
        const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("VenueHallScene");
        const labels = scene.children.list.filter(child => child.type === "Text") as Phaser.GameObjects.Text[];
        const greetings = labels.filter(child => child.getData("groupGreeting"));
        return { marker: labels.some(label => label.text === "나"), greetings: greetings.map(label => ({ text: label.text, x: label.x, y: label.y,
          width: label.width, height: label.height, fontSize: label.style.fontSize, scaleX: label.scaleX, scaleY: label.scaleY })) };
      });
      const first = await sampleGreeting();
      expect(first.marker).toBe(false);
      expect(first.greetings).toHaveLength(1);
      expect(first.greetings[0]).toMatchObject({ fontSize: "16px", scaleX: 1, scaleY: 1 });
      greetings.push(...first.greetings);
      for (let i = 0; i < (reduced ? 1 : 4); i++) {
        if (reduced) await page.waitForTimeout(1700);
        else {
          // Observe the next actual scene-timer result instead of sampling its 1500ms boundary.
          const phrases = ["축하해!", "잘살아!", "멋지다!", "예쁘다!", "행복해!"];
          const next = phrases[(phrases.indexOf(greetings.at(-1)!.text) + 1) % phrases.length];
          await expect.poll(async () => (await sampleGreeting()).greetings[0]?.text, { timeout: 5000 }).toBe(next);
        }
        const sample = await sampleGreeting();
        expect(sample.greetings).toHaveLength(1);
        greetings.push(...sample.greetings);
        if (!reduced) await page.screenshot({ path: `${evidence}/guest-greeting-${i + 2}-${suffix}.png` });
      }
      expect(new Set(greetings.map(g => g.text)).size).toBe(reduced ? 1 : 5);
      if (!reduced) expect(greetings.map(g => g.text)).toContain("행복해!");
      expect(group.panel.width).toBeCloseTo(group.canvas.width * .9, 1);
      expect(group.panel.left - group.canvas.left).toBeCloseTo(group.canvas.width * .05, 1);
      const screenTop = group.canvas.top + group.canvas.height * 262.6 / 1280;
      const screenBottom = group.canvas.top + group.canvas.height * 464 / 1280;
      expect(group.panel.top).toBeGreaterThanOrEqual(screenTop);
      expect(group.panel.bottom).toBeLessThanOrEqual(screenBottom);
      expect(Math.abs((group.panel.top - screenTop) - (screenBottom - group.panel.bottom))).toBeLessThan(2);
      expect(group.buttons[0]!.top - (group.canvas.top + group.canvas.height * 1004 / 1280)).toBeCloseTo(8, 0);
    }
    await page.getByRole("button", { name: "사진 찍기", exact: true }).click();
    if (!before) {
      const hasGreeting = () => page.evaluate(() => (window.__venueQaGame as Phaser.Game).scene.getScene("VenueHallScene").children.list.some(child => child.getData("groupGreeting")));
      expect(await hasGreeting()).toBe(false);
      await page.waitForTimeout(1600);
      expect(await hasGreeting()).toBe(false);
    }
    await expect(page.locator("canvas")).toHaveAttribute("data-ceremony-stage", "photo", { timeout: 8000 });
    await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", "찰칵! 결혼 축하해!");
    await page.locator(".story-narration").click();
    await expect(page.getByRole("button", { name: "다음으로", exact: true })).toBeEnabled();
    const result = await geometry(page);
    await page.screenshot({ path: `${evidence}/group-photo-result-${suffix}.png` });
    if (!before) {
      expect(result.buttons[0]!.top).toBeCloseTo(group.buttons[0]!.top, 1);
      expect(result.buttons[0]!.left).toBeCloseTo(group.buttons[0]!.left, 1);
      expect(result.panel.top + result.panel.height / 2).toBeCloseTo(group.panel.top + group.panel.height / 2, 1);
      expect(result.panel.width).toBeCloseTo(group.panel.width, 1);
      expect(result.panel.left).toBeCloseTo(group.panel.left, 1);
    }
    await page.getByRole("button", { name: "다음으로", exact: true }).click();
    await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "DinnerJourneyScene");
    expect(errors).toEqual([]);
    await writeFile(info.outputPath("geometry.json"), JSON.stringify({ viewport, reaction, side, reduced, ceremony, reply, group, greetings, result, errors }, null, 2));
  });
}

test("greenery corridor retains the bridal-room journey without its entrance label", async ({ page }, info) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await installPlayerObservation(page);
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await startPreparedScene(page, "HomeSelectScene");
  await fillProfile(page, "신부친구", "female");
  await chooseStory(page, "신부측");
  await startPreparedScene(page, "GreeneryCorridorScene");
  await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "GreeneryCorridorScene");
  await page.waitForTimeout(380);
  await page.screenshot({ path: `${evidence}/greenery-corridor-393.png` });
  const texts = await page.evaluate(() => {
    const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("GreeneryCorridorScene");
    return scene.children.list.filter(child => child.type === "Text").map(child => (child as Phaser.GameObjects.Text).text);
  });
  if (!before) {
    expect(texts).not.toContain("신부대기실 입구");
    expect(texts).not.toContain("입구 →");
    expect(texts).toContain("신부대기실 가는 길");
  }
  await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "BridalRoomScene", { timeout: 10000 });
  await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", "현서야 결혼 축하해!");
  await info.attach("corridor-texts", { body: JSON.stringify(texts), contentType: "application/json" });
});
