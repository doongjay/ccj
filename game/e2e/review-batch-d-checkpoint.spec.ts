import { expect, test, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { CHECKPOINT_KEY, validCheckpoint, type Checkpoint } from "../src/state/checkpointData";
import { createInitialProgressionState } from "../src/state/gameState";
import { REVIEW_EVIDENCE as evidence } from "./review-evidence";
import { finishMealByTap, clickGame, enterLobby, chooseStory, receiveEnvelope, completeLobbyTours, takeGroupPhoto } from "./story-helpers";

test.use({ viewport: { width: 393, height: 852 }, video: { mode: "on", size: { width: 393, height: 852 } } });
const canvas = (page: Page) => page.locator("#app canvas");
async function scene(page: Page, name: string) {
  await expect(canvas(page)).toHaveAttribute("data-active-scene", name, { timeout: 20000 });
  if (name === "VenueLobbyScene") await expect(canvas(page)).toHaveAttribute("data-lobby-ready", "true");
}
async function saved(page: Page): Promise<Checkpoint> { return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CHECKPOINT_KEY); }
async function resume(page: Page, target = "VenueLobbyScene") {
  await page.reload(); await scene(page, "IntroScene");
  await expect(page.getByRole("button", { name: "이어하기", exact: true })).toHaveCount(1);
  await clickGame(page, 360, 1120); await scene(page, target);
}

test("F18 semantic checkpoint rejects incompatible profiles, photo versions and contradictory progress", () => {
  const good: Checkpoint = { version: 1, assets: 1, name: "하객", profile: { gender: "female", outfit: 3, hair: 2, face: 1 }, side: "bride", route: "car", validRoute: "tower", progression: { ...createInitialProgressionState(), routeChosen: true, routeQuizSolved: true, guestSideChosen: true }, photos: [], mealOrder: "pending", point: "lobby", ending: "pending" };
  expect(validCheckpoint(good)).toBe(true);
  for (const change of [
    { version: 99 }, { assets: 99 }, { name: " " }, { profile: { ...good.profile, outfit: 6 } },
    { profile: { ...good.profile, face: -1 } }, { profile: { ...good.profile, hair: 0.5 } },
    { validRoute: "exit5" }, { point: "hall" }, { point: "ending" }, { mealOrder: "after" },
    { progression: { ...good.progression, photoBoothVisited: true } },
    { photos: [{ kind: "booth", profile: good.profile, composition: 2 }] },
    { progression: { ...good.progression, banquetGuideComplete: true } },
  ]) expect(validCheckpoint({ ...good, ...change }), JSON.stringify(change)).toBe(false);
});

test("F18 actual one/two photos restore identical pixels, profile and progress; in-flight photo restarts at lobby", async ({ page }, info) => {
  test.setTimeout(180000);
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/"); await enterLobby(page, "car", "bride");
  await clickGame(page, 130, 590); await scene(page, "PhotoBoothScene"); await clickGame(page, 360, 860);
  await expect(canvas(page)).toHaveAttribute("data-photo-booth-stage", "posing");
  await resume(page); expect((await saved(page)).photos).toHaveLength(0);
  await expect(canvas(page)).toHaveAttribute("data-lobby-progress", "0/4");
  const original: Record<string, string> = {}; const observations: unknown[] = [];
  for (const [index, kind] of ["booth", "bridal"].entries()) {
    await clickGame(page, kind === "booth" ? 130 : 590, kind === "booth" ? 590 : 990);
    await scene(page, kind === "booth" ? "PhotoBoothScene" : "BridalRoomScene");
    if (kind === "bridal") await page.locator(".story-narration").click();
    await expect(canvas(page)).toHaveAttribute(kind === "booth" ? "data-photo-booth-stage" : "data-bridal-visit-stage", "ready");
    await clickGame(page, 360, 860); await expect(page.locator(".story-info-photo-result")).toBeVisible({ timeout: 15000 });
    original[kind!] = await page.locator(".keepsake canvas").evaluate(n => (n as HTMLCanvasElement).toDataURL());
    await page.waitForTimeout(5500); await expect(page.locator(".story-info-photo-result")).toBeVisible();
    await page.getByRole("button", { name: "로비로 돌아가기", exact: true }).click(); await scene(page, "VenueLobbyScene");
    const before = await saved(page); expect(before.photos).toHaveLength(index + 1);
    expect(JSON.stringify(before).length).toBeLessThan(5000); expect(JSON.stringify(before)).not.toContain("base64");
    await page.reload(); await scene(page, "IntroScene");
    for (const [width, height] of [[320, 568], [393, 852], [430, 932]] as const) {
      await page.setViewportSize({ width, height }); await page.waitForTimeout(200);
      const continueBox = (await page.getByRole("button", { name: "이어하기", exact: true }).boundingBox())!;
      const restartBox = (await page.getByRole("button", { name: "처음부터", exact: true }).boundingBox())!;
      expect(continueBox.height).toBeGreaterThanOrEqual(44); expect(restartBox.height).toBeGreaterThanOrEqual(44);
      expect(restartBox.y - continueBox.y - continueBox.height).toBeGreaterThanOrEqual(4);
      expect(restartBox.y + restartBox.height).toBeLessThanOrEqual(height);
      await page.screenshot({ path: `${evidence}/f18-continue-${index + 1}-photos-${width}.png` });
    }
    await page.setViewportSize({ width: 393, height: 852 });
    await page.screenshot({ path: `${evidence}/f18-continue-${index + 1}-photos.png` });
    await clickGame(page, 360, 1120); await scene(page, "VenueLobbyScene");
    await expect(canvas(page)).toHaveAttribute("data-lobby-progress", `${index + 1}/4`);
    await clickGame(page, 128, 60); await expect(page.locator(".notebook-keepsakes .keepsake")).toHaveCount(index + 1);
    for (const memory of before.photos) {
      const figure = page.locator(`.notebook-keepsakes [data-keepsake="${memory.kind}"]`);
      expect(await figure.locator("canvas").evaluate(n => (n as HTMLCanvasElement).toDataURL())).toBe(original[memory.kind]);
      await expect(figure).toHaveAttribute("data-profile", JSON.stringify(memory.profile));
    }
    await page.screenshot({ path: `${evidence}/f18-restored-notebook-${index + 1}.png` });
    observations.push({ checkpoint: before, after: await saved(page), bytes: await canvas(page).getAttribute("data-checkpoint-bytes"), restoreMs: await canvas(page).getAttribute("data-notebook-restore-ms") });
    await page.keyboard.press("Escape");
  }
  await page.getByRole("button", { name: "청첩장", exact: true }).click(); await expect(page.locator(".invitation-page")).toBeVisible();
  await resume(page); await expect(canvas(page)).toHaveAttribute("data-lobby-progress", "2/4");
  await page.reload(); await scene(page, "IntroScene"); await clickGame(page, 360, 1216); await scene(page, "HomeSelectScene");
  await page.reload(); await scene(page, "IntroScene");
  await expect(page.getByRole("button", { name: "이어하기", exact: true })).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), CHECKPOINT_KEY)).toBeNull();
  expect(errors).toEqual([]);
  await writeFile(`${evidence}/checkpoint-photo-observations.json`, JSON.stringify({ observations, errors, video: await page.video()?.path() }, null, 2));
  await info.attach("photo-restoration", { body: JSON.stringify(observations), contentType: "application/json" });
});

for (const order of ["first", "after"] as const) test(`F18 ${order}: actual meal/reaction/ending reload and one saved or skipped message`, async ({ page }) => {
  test.setTimeout(240000);
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/"); await enterLobby(page, order === "first" ? "car" : "subway", "groom");
  await clickGame(page, 360, 420); await receiveEnvelope(page); await completeLobbyTours(page);
  if (order === "first") {
    await clickGame(page, 360, 150); await chooseStory(page, "1시반부터 밥먹기"); await scene(page, "DinnerJourneyScene");
    await resume(page, "DinnerJourneyScene"); expect((await saved(page)).mealOrder).toBe("first");
    await expect(canvas(page)).toHaveAttribute("data-dinner-stage", "buffet-route", { timeout: 35000 });
    await finishMealByTap(page);
    await scene(page, "VenueHallScene"); await resume(page, "VenueHallScene");
    expect((await saved(page)).progression.mealComplete).toBe(true);
  } else { await clickGame(page, 590, 150); await scene(page, "VenueHallScene"); }
  await chooseStory(page, order === "first" ? "박수를 친다" : "환호를 한다");
  await expect(canvas(page)).toHaveAttribute("data-ceremony-stage", "reaction");
  await resume(page, "VenueHallScene"); await expect(canvas(page)).toHaveAttribute("data-ceremony-stage", "choice");
  await chooseStory(page, "박수를 친다"); await takeGroupPhoto(page);
  await resume(page, "DinnerJourneyScene");
  expect((await saved(page)).progression.banquetGuideComplete).toBe(true);
  if (order === "after") {
    expect((await saved(page)).mealOrder).toBe("after");
    await expect(canvas(page)).toHaveAttribute("data-dinner-stage", "buffet-route", { timeout: 35000 });
    await finishMealByTap(page);
  } else await expect(page.locator(".story-narration")).toHaveAttribute("aria-label", /밥은 아까 먹었으니/);
  await scene(page, "EndingScene");
  if (order === "first") {
    await page.getByRole("textbox", { name: "축하 메시지" }).fill("이어온 추억도 행복하게!");
    await page.getByRole("button", { name: "메시지 남기기", exact: true }).click();
  } else await page.getByRole("button", { name: "나중에 남기기", exact: true }).click();
  await resume(page, "EndingScene"); await expect(page.getByRole("textbox", { name: "축하 메시지" })).toHaveCount(0);
  const count = () => page.evaluate(() => JSON.parse(localStorage.getItem("wedding.guestMessages") ?? "[]").length);
  expect(await count()).toBe(order === "first" ? 1 : 0);
  await chooseStory(page, "처음부터 다시"); await scene(page, "IntroScene"); await page.reload(); await scene(page, "IntroScene");
  await expect(page.getByRole("button", { name: "이어하기", exact: true })).toHaveCount(0);
  expect(await count()).toBe(order === "first" ? 1 : 0); expect(errors).toEqual([]);
});

for (const failure of ["corrupt", "unknown-version", "denied", "quota"] as const) test(`F18 ${failure}: real browser storage failure stays playable`, async ({ page }) => {
  test.setTimeout(60000);
  await page.addInitScript(({ key, failure }) => {
    if (failure === "corrupt" || failure === "unknown-version") localStorage.setItem(key, failure === "corrupt" ? "{bad" : JSON.stringify({ version: 999 }));
    else {
      const original = failure === "denied" ? Storage.prototype.getItem : Storage.prototype.setItem;
      const method = failure === "denied" ? "getItem" : "setItem";
      Object.defineProperty(Storage.prototype, method, { value: function(k: string, ...args: string[]) {
        if (k === key) throw new DOMException("Injected checkpoint storage denial", failure === "denied" ? "SecurityError" : "QuotaExceededError");
        return Reflect.apply(original, this, [k, ...args]);
      } });
    }
  }, { key: CHECKPOINT_KEY, failure });
  await page.goto("/"); await scene(page, "IntroScene");
  if (failure !== "quota") {
    await expect(page.locator(".story-info-compact .story-narration")).toBeVisible();
    await expect(page.getByRole("button", { name: "확인", exact: true })).toHaveCount(0);
    await page.screenshot({ path: `${evidence}/f18-${failure}.png` });
    await page.locator(".story-info-compact .story-narration").click();
  }
  await enterLobby(page, "subway", "groom"); await clickGame(page, 128, 60);
  await expect(page.locator(".story-info-notebook")).toBeVisible();
  await expect(page.locator(".story-copy")).toContainText("포토부스에서 사진 찍기");
  if (failure === "quota") await page.screenshot({ path: `${evidence}/f18-quota-playable.png` });
});
