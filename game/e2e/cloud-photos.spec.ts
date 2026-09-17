import { expect, test } from "@playwright/test";
import { installPlayerObservation } from "./corridor-observables";
import { startPreparedScene } from "./stage-fixtures";
import { clickGame, fillProfile, chooseStory, dismissLobbyArrival } from "./story-helpers";

for (const [scene, kind] of [["PhotoBoothScene", "booth"], ["BridalRoomScene", "bridal"], ["VenueHallScene", "group"]] as const) {
  test(`${kind} photo remains viewable and returns normally without cloud requests`, async ({ page }, info) => {
    const cloudRequests: string[] = [], errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", entry => { if (entry.type() === "error") errors.push(entry.text()); });
    // Any cloud request during photography is a regression; never contact a real server.
    for (const endpoint of ["auth", "storage", "rest"]) await page.route(`**/${endpoint}/v1/**`, route => {
      cloudRequests.push(`${route.request().method()} ${route.request().url()}`);
      return route.fulfill({ status: 503, json: { message: "Photo capture must not call the cloud" } });
    });
    await page.setViewportSize({ width: 393, height: 852 });
    await installPlayerObservation(page);
    await page.goto("/");
    const canvas = page.locator("#app canvas");
    await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
    await clickGame(page, 360, 1180);
    await fillProfile(page, "사진 감상");
    await chooseStory(page, kind === "group" ? "신랑측" : "신부측");
    await startPreparedScene(page, scene);
    if (kind === "bridal") await page.locator(".story-narration").click();
    if (kind === "group") {
      await chooseStory(page, "박수를 친다");
      await expect(canvas).toHaveAttribute("data-ceremony-stage", "group-photo");
      await chooseStory(page, "사진 찍기");
    } else {
      await expect(canvas).toHaveAttribute(kind === "booth" ? "data-photo-booth-stage" : "data-bridal-visit-stage", "ready");
      await clickGame(page, 360, 860);
    }
    const result = page.locator(".story-info-photo-result");
    await expect(result).toBeVisible({ timeout: 15000 });
    const photo = result.locator(".keepsake canvas");
    await expect(photo).toBeVisible();
    const pixels = await photo.evaluate(node => (node as HTMLCanvasElement).toDataURL());
    expect(pixels.length).toBeGreaterThan(10000);
    await expect(page.locator(".photo-upload-status")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "사진 다시 보내기" })).toHaveCount(0);
    await page.waitForTimeout(5500);
    await expect(result).toBeVisible();
    await expect(canvas).toHaveAttribute("data-active-scene", scene);
    for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }]) {
      await page.setViewportSize(viewport);
      await page.screenshot({ path: info.outputPath(`${kind}-local-${viewport.width}.png`) });
    }
    await page.setViewportSize({ width: 393, height: 852 });
    await page.getByRole("button", { name: kind === "group" ? "다음으로" : "로비로 돌아가기", exact: true }).click();
    await expect(canvas).toHaveAttribute("data-active-scene", kind === "group" ? "DinnerJourneyScene" : "VenueLobbyScene");
    if (kind !== "group") {
      await expect(canvas).toHaveAttribute("data-lobby-ready", "true");
      await expect(canvas).toHaveAttribute(kind === "booth" ? "data-photo-booth-visited" : "data-bridal-room-visited", "true");
      await dismissLobbyArrival(page);
      await clickGame(page, 128, 60);
      const memory = page.locator(`.notebook-keepsakes [data-keepsake="${kind}"] canvas`);
      await expect(memory).toBeVisible();
      expect(await memory.evaluate(node => (node as HTMLCanvasElement).toDataURL())).toBe(pixels);
    }
    await info.attach("network-and-console", { body: JSON.stringify({ cloudConfigured: Boolean(process.env.VITE_SUPABASE_URL), cloudRequests, errors }), contentType: "application/json" });
    expect(cloudRequests).toEqual([]);
    expect(errors).toEqual([]);
  });
}
