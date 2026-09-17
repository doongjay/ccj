import { expect, test } from "@playwright/test";
import { installPlayerObservation } from "./corridor-observables";
import { startPreparedScene } from "./stage-fixtures";
import { clickGame, fillProfile, chooseStory } from "./story-helpers";

test.skip(process.env.VITE_SUPABASE_URL !== "http://127.0.0.1:54321", "Run npm run test:cloud to use the isolated cloud fixture.");

for (const [scene, kind] of [["PhotoBoothScene", "booth"], ["BridalRoomScene", "bridal"], ["VenueHallScene", "group"]] as const) {
  test(`${kind} photo retries a failed database write without duplicating its storage path`, async ({ page }) => {
    const browserLog: { type: string; text: string }[] = [];
    page.on("console", message => browserLog.push({ type: message.type(), text: message.text() }));
    page.on("pageerror", error => browserLog.push({ type: "pageerror", text: error.message }));
    // Given an authenticated guest and a successful upload followed by a failed database write.
    const userId = "11111111-1111-4111-8111-111111111111";
    const token = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: userId, role: "authenticated", exp: 4102444800 })).toString("base64url")}.test`;
    await page.route("**/auth/v1/**", route => route.fulfill({ json: {
      access_token: token, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600,
      user: { id: userId, aud: "authenticated", role: "authenticated", is_anonymous: true, app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() },
    } }));
    const paths: string[] = [];
    let writes = 0;
    await page.route("**/storage/v1/**", async route => {
      if (route.request().method() === "GET") { await route.fulfill({ json: { size: 1000, mimetype: "image/png" } }); return; }
      paths.push(route.request().url());
      const bytes = route.request().postDataBuffer();
      expect(bytes?.length).toBeGreaterThan(1000);
      await route.fulfill(paths.length === 1 ? { json: { Key: "guest-photos/test.png" } } : { status: 409, json: { statusCode: "409", error: "Duplicate", message: "Already exists" } });
    });
    await page.route("**/rest/v1/guest_photos**", async route => {
      const row = route.request().postDataJSON();
      expect(row.kind).toBe(kind);
      expect(row.name).toBe("연동 확인");
      expect(row.user_id).toBe(userId);
      expect(row.storage_path).toBe(`${userId}/${row.id}.png`);
      await expect(page.locator(".photo-upload-status")).toHaveAttribute("data-upload-state", "saving");
      await expect(page.locator(".photo-upload-status")).toBeHidden();
      await expect(page.locator(".photo-upload-status")).toHaveText("");
      writes++;
      await route.fulfill(writes === 1 ? { status: 503, json: { message: "Unavailable" } } : { status: 201, body: "" });
    });
    await page.setViewportSize({ width: 393, height: 852 });
    await installPlayerObservation(page);
    await page.goto("/");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    await clickGame(page, 360, 1180);
    await fillProfile(page, "연동 확인");
    await chooseStory(page, kind === "group" ? "신랑측" : "신부측");
    await startPreparedScene(page, scene);
    if (kind === "bridal") await page.locator(".story-narration").click();
    if (kind === "group") {
      await chooseStory(page, "박수를 친다");
      await expect(page.locator("#app canvas")).toHaveAttribute("data-ceremony-stage", "group-photo");
      await chooseStory(page, "사진 찍기");
    } else {
      await expect(page.locator("#app canvas")).toHaveAttribute(kind === "booth" ? "data-photo-booth-stage" : "data-bridal-visit-stage", "ready");
      await clickGame(page, 360, 860);
    }
    const retry = page.getByRole("button", { name: "사진 다시 보내기", exact: true });
    await expect(retry).toBeVisible({ timeout: 15000 });
    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 852 });
      await retry.scrollIntoViewIfNeeded();
      await page.screenshot({ path: test.info().outputPath(`${kind}-retry-${width}.png`) });
    }
    await retry.click();
    // Then storage still succeeds silently and both records point to the same image.
    const uploadStatus = page.locator(".photo-upload-status");
    await expect(uploadStatus).toHaveAttribute("data-upload-state", "saved");
    await expect(uploadStatus).toBeHidden();
    await expect(uploadStatus).toHaveText("");
    await expect(retry).toHaveCount(0);
    expect(writes).toBe(2);
    expect(paths).toHaveLength(2);
    expect(paths[0]).toBe(paths[1]);
    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 852 });
      await page.locator(".keepsake").scrollIntoViewIfNeeded();
      await page.screenshot({ path: test.info().outputPath(`${kind}-saved-${width}.png`) });
    }
    await test.info().attach("browser-log", { body: JSON.stringify(browserLog, null, 2), contentType: "application/json" });
    // The fixture deliberately returns 503 on the first record write and 409 on the reused upload path.
    expect(browserLog.filter(entry => entry.type === "pageerror" ||
      (entry.type === "error" && !/Failed to load resource: the server responded with a status of (409|503)\b/.test(entry.text)))).toEqual([]);
  });
}
