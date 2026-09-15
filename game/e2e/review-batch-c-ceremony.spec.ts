import { REVIEW_EVIDENCE } from "./review-evidence";
import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { chooseStory, clickGame, completeLobbyTours, enterLobby, receiveEnvelope, takeBridalPhoto, takeGroupPhoto } from "./story-helpers";
import { CEREMONY_SEED, ceremonyCandidates, selectCeremonyGuests } from "../src/ui/ceremonyGuests";
const evidence = REVIEW_EVIDENCE;

test("F14: deterministic full candidate cycle, player exclusion and short-list reuse", () => {
  const candidates = ceremonyCandidates();
  const player = { gender: "male" as const, outfit: 0, hair: 0, face: 0 };
  const selection = selectCeremonyGuests(candidates, 29, player);
  expect(selection).toEqual(selectCeremonyGuests(candidates, 29, player, CEREMONY_SEED));
  expect(new Set(selection).size).toBe(29);
  expect(selection.map(i => candidates[i]!.key)).not.toContain("male-0-0-0");
  const short = selectCeremonyGuests(candidates.slice(0, 4), 11, player);
  expect(new Set(short.slice(0, 4)).size).toBe(4);
  expect(new Set(short.slice(4, 8)).size).toBe(4);
  expect(short.every((value, i) => !i || value !== short[i - 1])).toBe(true);
});

for (const mode of ["applause", "cheer", "reduced", "compact"] as const) {
  test(`F11/F14: ${mode} visible response, invitation pause, one group entry and diverse guests`, async ({ browser }, info) => {
    test.setTimeout(120000);
    const viewport = mode === "compact" ? { width: 320, height: 568 } : { width: 393, height: 852 };
    const context = await browser.newContext({ viewport, deviceScaleFactor: mode === "reduced" ? 3 : 1, reducedMotion: mode === "reduced" ? "reduce" : "no-preference", recordVideo: { dir: info.outputPath("video"), size: { width: 393, height: 852 } } });
    const page = await context.newPage(); const start = Date.now();
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", e => { if (e.type() === "error" || /(?:Texture|Frame).*(?:missing|not found|has no frame)/i.test(e.text())) errors.push(e.text()); });
    page.on("requestfailed", r => errors.push(r.url()));
    await page.goto("/");
    const side = mode === "applause" ? "bride" : "groom";
    await enterLobby(page, side === "bride" ? "car" : "subway", side);
    const canvas = page.locator("#app canvas");
    await clickGame(page, 360, 420); await receiveEnvelope(page);
    await completeLobbyTours(page);
    if (side === "bride") { await clickGame(page, 590, 990); await takeBridalPhoto(page); }
    await clickGame(page, 590, 150);
    await expect(canvas).toHaveAttribute("data-active-scene", "VenueHallScene");
    const clipStart = Date.now() - start;
    await chooseStory(page, mode === "cheer" ? "환호를 한다" : "박수를 친다");
    await expect(canvas).toHaveAttribute("data-ceremony-stage", "reaction");
    for (let i = 0; i < 8; i++) await page.keyboard.press("Enter");
    await page.screenshot({ path: `${evidence}/${mode === "reduced" ? "reduced-motion-response" : `f11-${mode}-response`}-${viewport.width}.png` });
    const pauseStartedAt = Date.now();
    await page.getByRole("button", { name: "청첩장", exact: true }).click();
    await expect(page.locator(".invitation-page")).toBeVisible();
    await page.waitForTimeout(1600);
    await expect(canvas).toHaveAttribute("data-ceremony-stage", "reaction");
    await page.keyboard.press("Escape");
    await expect(page.locator(".invitation-page")).toHaveCount(0);
    const pauseEndedAt = Date.now();
    await clickGame(page, 360, 1100);
    for (let i = 0; i < 8; i++) await clickGame(page, 360, 1100);
    await expect(canvas).toHaveAttribute("data-ceremony-stage", "group-photo");
    await expect(canvas).toHaveAttribute("data-ceremony-reaction-count", "1");
    await expect(canvas).toHaveAttribute("data-group-photo-entry-count", "1");
    const data = await canvas.evaluate(el => ({ ...el.dataset }));
    expect(Number(data.ceremonyReactionEndedAt) - Number(data.ceremonyReactionStartedAt)).toBeGreaterThanOrEqual(2700);
    expect(JSON.parse(data.groupSelectedIndices!)).toHaveLength(29);
    expect(data.groupUniqueCount).toBe("29");
    expect(data.hallCharacterTextureCountAfter).toBe(data.hallCharacterTextureCountBefore);
    // The player remains in the correct row; the visible "나" tag was explicitly removed.
    expect(data.groupPlayerMarker).toBe("false");
    await page.locator(".story-narration").click();
    await expect(page.getByRole("button", { name: "사진 찍기", exact: true })).toBeVisible();
    if (mode !== "reduced" && mode !== "compact") await page.screenshot({ path: `${evidence}/f14-group-${side}-393.png` });
    if (mode === "reduced") { await page.setViewportSize({ width: 320, height: 568 }); await page.screenshot({ path: `${evidence}/f14-group-reduced-320.png` }); }
    const clipEnd = Date.now() - start;
    await takeGroupPhoto(page);
    await expect(canvas).toHaveAttribute("data-group-player-marker", "false");
    await expect(canvas).toHaveAttribute("data-hall-transition-count", "1");
    expect(errors).toEqual([]);
    const video = await page.video()!.path();
    await context.close();
    await writeFile(`${evidence}/ceremony-${mode}-events.json`, JSON.stringify({ start, clipStart, clipEnd, video, mode, side, viewport, pauseStartedAt, pauseEndedAt, dpr: mode === "reduced" ? 3 : 1, data, errors }, null, 2));
  });
}
