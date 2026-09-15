import { REVIEW_EVIDENCE } from "./review-evidence";
import { expect, test, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { chooseStory, clickGame, dismissLobbyArrival } from "./story-helpers";

const evidence = REVIEW_EVIDENCE;
test.use({ viewport: { width: 393, height: 852 }, video: { mode: "on", size: { width: 393, height: 852 } } });

async function scene(page: Page, name: string) { await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", name, { timeout: 20000 }); }
async function lobby(page: Page) { await scene(page, "VenueLobbyScene"); await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-ready", "true"); }
async function invitationBack(page: Page) {
  await page.getByRole("button", { name: "청첩장", exact: true }).click();
  await expect(page.locator(".invitation-page")).toBeVisible();
  await page.keyboard.press("Escape");
}

test("F12/F13/B-V01: actual photos persist, explicit returns, finite notebook keepsakes and clean controls", async ({ page }, info) => {
  test.setTimeout(180000);
  const start = Date.now(); const clips: { name: string; startMs: number; endMs: number }[] = [];
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", entry => { if (entry.type() === "error" || /(?:Texture|Frame).*(?:missing|not found|has no frame)/i.test(entry.text())) errors.push(entry.text()); });
  page.on("requestfailed", request => errors.push(request.url()));
  await page.addInitScript(() => {
    const events: unknown[] = []; (window as unknown as { photoEvents: unknown[] }).photoEvents = events;
    new MutationObserver(records => {
      for (const record of records) if (record.target instanceof HTMLCanvasElement && record.target.closest("#app")
        && /photo|keepsake|progress/.test(record.attributeName ?? "")) events.push({ at: performance.now(), attribute: record.attributeName, value: record.target.getAttribute(record.attributeName!) });
    }).observe(document, { attributes: true, subtree: true });
  });
  await page.goto("/"); await scene(page, "IntroScene"); await clickGame(page, 360, 1180);
  await page.getByRole("textbox", { name: "내 이름은", exact: true }).fill("QA 추억");
  await page.getByRole("button", { name: "여자", exact: true }).click();
  for (const name of ["안경 얼굴", "포니테일", "다음 의상 보기", "핑크 원피스", "시작하기"]) await page.getByRole("button", { name, exact: true }).click();
  await chooseStory(page, "신부측"); await chooseStory(page, "자차로 간다"); await chooseStory(page, "파란색"); await lobby(page); await dismissLobbyArrival(page);
  const canvas = page.locator("#app canvas");
  await clickGame(page, 130, 590); await scene(page, "PhotoBoothScene");
  await clickGame(page, 360, 1180); await lobby(page);
  await expect(canvas).toHaveAttribute("data-lobby-progress", "0/4");
  await expect(canvas).toHaveAttribute("data-session-keepsake-count", "0");
  await clickGame(page, 130, 590); await scene(page, "PhotoBoothScene");
  let clipStart = Date.now() - start;
  await clickGame(page, 360, 860);
  await page.keyboard.down("Enter");
  await expect(canvas).toHaveAttribute("data-photo-booth-stage", "posing");
  await expect(page.locator('.canvas-keyboard-button:not([hidden])')).toHaveCount(0);
  await expect(page.locator(".timed-continue-hint")).toHaveCount(0);
  await page.screenshot({ path: `${evidence}/f12-booth-controls-no-overlap-393.png` });
  const result = page.locator(".story-info-photo-result");
  await expect(result).toBeVisible();
  for (let i = 0; i < 8; i++) await page.keyboard.down("Enter");
  await expect(result).toBeVisible();
  await page.keyboard.up("Enter");
  await expect(result.locator(".keepsake")).toHaveAttribute("data-profile", JSON.stringify({ gender: "female", outfit: 3, hair: 2, face: 1 }));
  await page.screenshot({ path: `${evidence}/f12-booth-result-393.png` });
  const boothPixels = await result.locator("canvas").evaluate(node => (node as HTMLCanvasElement).toDataURL());
  const boothTextures = await canvas.getAttribute("data-photo-character-texture-count");
  await page.waitForTimeout(5500); await scene(page, "PhotoBoothScene"); await expect(result).toBeVisible();
  await page.getByRole("button", { name: "로비로 돌아가기", exact: true }).click(); await lobby(page);
  clips.push({ name: "f12-booth", startMs: clipStart, endMs: Date.now() - start });
  await expect(canvas).toHaveAttribute("data-lobby-progress", "1/4");
  await clickGame(page, 128, 60);
  expect(await page.locator('.notebook-keepsakes canvas').evaluate(node => (node as HTMLCanvasElement).toDataURL())).toBe(boothPixels);
  await page.keyboard.press("Escape");
  await clickGame(page, 130, 590); await scene(page, "PhotoBoothScene"); await clickGame(page, 360, 860); await expect(result).toBeVisible();
  await invitationBack(page); await scene(page, "PhotoBoothScene"); await expect(result).toBeVisible();
  for (const viewport of [{ width: 320, height: 568 }, { width: 430, height: 932 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => { const box = (await result.boundingBox())!; return box.x + box.width; }).toBeLessThanOrEqual(viewport.width);
    const action = (await page.getByRole("button", { name: "로비로 돌아가기", exact: true }).boundingBox())!;
    const photo = (await result.locator("canvas").boundingBox())!;
    expect(action.width).toBeGreaterThanOrEqual(44); expect(action.height).toBeGreaterThanOrEqual(44);
    expect(action.y).toBeGreaterThanOrEqual(photo.y + photo.height);
    expect(action.y + action.height).toBeLessThanOrEqual(viewport.height);
    await page.screenshot({ path: `${evidence}/${viewport.width === 320 ? 'f13-booth-result-320' : 'f13-photo-result-430'}.png` });
  }
  await page.setViewportSize({ width: 393, height: 852 });
  await page.getByRole("button", { name: "로비로 돌아가기", exact: true }).click(); await lobby(page);
  await expect(canvas).toHaveAttribute("data-photo-booth-completion-count", "1");
  await expect(canvas).toHaveAttribute("data-session-keepsake-builds", "1");
  await expect(canvas).toHaveAttribute("data-photo-character-texture-count", boothTextures!);
  await clickGame(page, 590, 990); await scene(page, "BridalRoomScene");
  await page.locator(".story-narration").click(); await expect(canvas).toHaveAttribute("data-bridal-visit-stage", "ready");
  await clickGame(page, 360, 1180); await lobby(page);
  await expect(canvas).toHaveAttribute("data-bridal-room-visited", "false");
  await clickGame(page, 590, 990); await scene(page, "BridalRoomScene");
  await page.locator(".story-narration").click(); await expect(canvas).toHaveAttribute("data-bridal-visit-stage", "ready");
  clipStart = Date.now() - start;
  await clickGame(page, 360, 860); await expect(result).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: `${evidence}/f12-bridal-result-393.png` });
  const bridalTextures = await canvas.getAttribute("data-photo-character-texture-count");
  await page.waitForTimeout(5500); await scene(page, "BridalRoomScene"); await expect(result).toBeVisible();
  await invitationBack(page); await scene(page, "BridalRoomScene");
  await page.getByRole("button", { name: "로비로 돌아가기", exact: true }).click(); await lobby(page);
  clips.push({ name: "f12-bridal", startMs: clipStart, endMs: Date.now() - start });
  await clickGame(page, 128, 60); await expect(page.locator(".notebook-keepsakes .keepsake")).toHaveCount(2);
  await page.screenshot({ path: `${evidence}/f12-notebook-keepsakes-393.png` });
  await page.keyboard.press("Escape");
  await clickGame(page, 590, 990); await scene(page, "BridalRoomScene");
  await page.locator(".story-narration").click(); await expect(canvas).toHaveAttribute("data-bridal-visit-stage", "ready");
  await clickGame(page, 360, 860); await expect(result).toBeVisible({ timeout: 15000 });
  await page.setViewportSize({ width: 320, height: 568 }); await page.screenshot({ path: `${evidence}/f13-bridal-result-320.png` });
  await page.setViewportSize({ width: 430, height: 932 }); await page.screenshot({ path: `${evidence}/f13-bridal-result-430.png` });
  await page.getByRole("button", { name: "로비로 돌아가기", exact: true }).click(); await lobby(page);
  await expect(canvas).toHaveAttribute("data-lobby-progress", "2/4");
  await expect(canvas).toHaveAttribute("data-bridal-photo-completion-count", "1");
  await expect(canvas).toHaveAttribute("data-session-keepsake-builds", "2");
  await expect(canvas).toHaveAttribute("data-photo-character-texture-count", bridalTextures!);
  expect(errors).toEqual([]);
  const events = await page.evaluate(() => (window as unknown as { photoEvents: unknown[] }).photoEvents);
  await mkdir(evidence, { recursive: true });
  await writeFile(`${evidence}/photo-events.json`, JSON.stringify({ testStart: start, clips, events, errors, video: await page.video()?.path() }, null, 2));
  await info.attach("photo-events", { body: JSON.stringify(events), contentType: "application/json" });
});
