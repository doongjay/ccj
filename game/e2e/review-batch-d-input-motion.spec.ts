import { expect, test, type Page } from "@playwright/test";
import type Phaser from "phaser";
import { writeFile } from "node:fs/promises";
import { REVIEW_EVIDENCE as evidence } from "./review-evidence";
import { clickGame, enterLobby, chooseStory, receiveEnvelope } from "./story-helpers";
import { installPlayerObservation } from "./corridor-observables";

test.use({ viewport: { width: 393, height: 852 }, video: { mode: "on", size: { width: 393, height: 852 } } });
test.beforeEach(async ({ page }) => { await installPlayerObservation(page); });
test("F17 isolated decorative heart stops its running tween on a live preference change", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" }); await page.goto("/"); await scene(page, "IntroScene");
  await page.evaluate(async () => {
    const path = "/src/ui/pixelFeedback.ts"; const { showPixelHeart } = await import(path) as typeof import("../src/ui/pixelFeedback");
    const owner = (window.__venueQaGame as Phaser.Game).scene.getScene("IntroScene");
    showPixelHeart(owner, 360, 500);
    owner.children.list.at(-1)!.setName("live-heart-fixture");
  });
  await page.waitForTimeout(500); await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.evaluate(() => {
    const owner = (window.__venueQaGame as Phaser.Game).scene.getScene("IntroScene");
    const heart = owner.children.getByName("live-heart-fixture") as Phaser.GameObjects.Graphics;
    return { y: heart.y, alpha: heart.alpha, tweens: owner.tweens.getTweensOf(heart).length };
  })).toEqual({ y: 500, alpha: 1, tweens: 0 });
});
async function scene(page: Page, name: string) {
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", name, { timeout: 15000 });
  if (name === "VenueLobbyScene") await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-ready", "true");
}

test("F16 actual drag cancellation, native touch cancellation, disabled fixture and keyboard focus", async ({ page }, info) => {
  await page.goto("/"); await scene(page, "IntroScene");
  const bounds = (await page.locator("#app canvas").boundingBox())!;
  const point = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height * 1180 / 1280 };
  await page.mouse.move(point.x, point.y); await page.mouse.down();
  const pressed = await page.screenshot();
  await page.mouse.move(bounds.x + 8, bounds.y + 8); await page.mouse.up();
  await page.waitForTimeout(350); await scene(page, "IntroScene");
  const canceled = await page.screenshot({ path: `${evidence}/f16-canceled.png` });
  expect(pressed.equals(canceled)).toBe(false);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  await page.waitForTimeout(350); await scene(page, "IntroScene");
  // Isolated disabled-control fixture: this is explicitly not a full-journey state injection.
  await page.evaluate(() => {
    const owner = (window.__venueQaGame as Phaser.Game).scene.getScene("IntroScene");
    (owner.children.getByName("ui-출발") as Phaser.GameObjects.Rectangle).disableInteractive();
  });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "출발", exact: true })).toBeDisabled();
  await page.screenshot({ path: `${evidence}/f16-disabled.png` });
  await clickGame(page, 360, 1180); await scene(page, "IntroScene");
  await page.evaluate(() => {
    const owner = (window.__venueQaGame as Phaser.Game).scene.getScene("IntroScene");
    (owner.children.getByName("ui-출발") as Phaser.GameObjects.Rectangle).setInteractive();
  });
  for (let i=0; i<8; i++) {
    await page.keyboard.press("Tab");
    if (await page.getByRole("button", { name: "출발", exact: true }).evaluate(el => el === document.activeElement)) break;
  }
  await expect(page.getByRole("button", { name: "출발", exact: true })).toBeFocused();
  await page.screenshot({ path: `${evidence}/f16-keyboard-focus.png` });
  await page.keyboard.down("Enter");
  for (let i=0;i<8;i++) await page.keyboard.down("Enter");
  await page.keyboard.up("Enter");
  await expect(page.getByRole("textbox", { name: "내 이름은", exact: true })).toBeVisible();
  await expect(page.locator(".text-entry-form")).toHaveCount(1);
  await expect(page.getByRole("alert")).not.toBeVisible();
  await info.attach("input-method", { body: "Real mouse drag + CDP touchCancel + Tab/Enter. Only disabled state is an isolated fixture. No forced focus.", contentType: "text/plain" });
});

for (const mode of ["normal", "reduced"] as const) test(`F17 ${mode}: three actual photo scenes, live preference changes and explicit result returns`, async ({ page }, info) => {
  test.setTimeout(160000);
  await page.emulateMedia({ reducedMotion: mode === "reduced" ? "reduce" : "no-preference" });
  const errors: string[] = [];
  page.on("pageerror",e=>errors.push(e.message)); page.on("console",e=>{if(e.type()==="error")errors.push(e.text());}); page.on("requestfailed",r=>errors.push(r.url()));
  await page.goto("/"); await enterLobby(page, "car", "bride");
  await page.evaluate(() => {
    const samples: { time: number; scene: string; flash: number; rec: number | null }[] = [];
    (window as unknown as { motionSamples: typeof samples }).motionSamples = samples;
    const sample = () => {
      const owner = (window.__venueQaGame as Phaser.Game).scene.getScenes(true)[0];
      const rec = owner?.children.list.find(child => (child as Phaser.GameObjects.Arc).fillColor === 0xf04c54) as Phaser.GameObjects.Arc | undefined;
      if (owner) samples.push({ time: performance.now(), scene: owner.scene.key, flash: owner.cameras.main.flashEffect.isRunning ? owner.cameras.main.flashEffect.alpha : 0, rec: rec?.alpha ?? null });
      requestAnimationFrame(sample);
    }; sample();
  });
  const clips: { name: string; start: number; end: number }[] = []; const start = Date.now();
  for (const kind of ["booth", "bridal"] as const) {
    await clickGame(page, kind==="booth"?130:590, kind==="booth"?590:990);
    await scene(page,kind==="booth"?"PhotoBoothScene":"BridalRoomScene");
    if(kind==="bridal") await page.locator(".story-narration").click();
    await expect(page.locator("#app canvas")).toHaveAttribute(kind === "bridal" ? "data-bridal-visit-stage" : "data-photo-booth-stage", "ready");
    const clipStart = Date.now()-start;
    await clickGame(page,360,860);
    await expect(page.locator(".story-info-photo-result")).toBeVisible({timeout:15000});
    await page.screenshot({path:`${evidence}/f17-${mode}-${kind}.png`});
    await page.waitForTimeout(5500); await expect(page.locator(".story-info-photo-result")).toBeVisible();
    await page.getByRole("button",{name:"로비로 돌아가기",exact:true}).click(); await scene(page,"VenueLobbyScene");
    clips.push({name:kind,start:clipStart,end:Date.now()-start});
  }
  await clickGame(page,360,420); await receiveEnvelope(page);
  await clickGame(page,550,450); await expect(page.locator("#app canvas")).toHaveAttribute("data-photo-gallery-open","true"); await page.keyboard.press("Escape");
  await clickGame(page,590,150); await scene(page,"VenueHallScene");
  await chooseStory(page,mode==="normal"?"환호를 한다":"박수를 친다");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-ceremony-stage","group-photo");
  // The browser preference is changed while the actual REC tween is alive.
  await page.emulateMedia({reducedMotion:"reduce"}); await page.waitForTimeout(800);
  const recording = await page.evaluate(() => {
    const owner=(window.__venueQaGame as Phaser.Game).scene.getScene("VenueHallScene");
    const dot=owner.children.list.find(c=>(c as Phaser.GameObjects.Arc).fillColor===0xf04c54) as Phaser.GameObjects.Arc;
    return {alpha:dot.alpha,tweens:owner.tweens.getTweensOf(dot).length};
  });
  expect(recording).toEqual({alpha:1,tweens:0});
  if(mode==="normal") await page.emulateMedia({reducedMotion:"no-preference"});
  await chooseStory(page,"사진 찍기");
  await expect(page.locator(".story-narration")).toHaveAttribute("aria-label","찰칵! 결혼 축하해!",{timeout:10000});
  await page.screenshot({path:`${evidence}/f17-${mode}-group.png`});
  const samples=await page.evaluate(()=>(window as unknown as {motionSamples:{time:number;scene:string;flash:number;rec:number|null}[]}).motionSamples);
  const flashes=samples.filter(s=>s.flash>0);
  if(mode==="reduced")expect(flashes).toHaveLength(0);else for(const name of ["PhotoBoothScene","BridalRoomScene","VenueHallScene"])expect(flashes.some(s=>s.scene===name)).toBe(true);
  expect(errors).toEqual([]);
  await writeFile(`${evidence}/f17-${mode}-motion.json`,JSON.stringify({start,clips,recording,errors,flashes,samples,video:await page.video()?.path()},null,2));
  await info.attach("motion-observation",{body:JSON.stringify({recording,flashFrames:flashes.length,samples:samples.length}),contentType:"application/json"});
});
