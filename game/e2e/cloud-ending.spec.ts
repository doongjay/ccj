import { expect, test } from "@playwright/test";
import { installPlayerObservation } from "./corridor-observables";
import { startPreparedScene } from "./stage-fixtures";
import { chooseStory, clickGame, fillProfile } from "./story-helpers";

test.skip(process.env.VITE_SUPABASE_URL !== "http://127.0.0.1:54321", "Run npm run test:cloud.");
test("ending keeps the message form open on server failure and advances only after saving", async ({ page }) => {
  // Given an anonymous guest and a failing server.
  const id = "11111111-1111-4111-8111-111111111111";
  const token = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: id, role: "authenticated", exp: 4102444800 })).toString("base64url")}.test`;
  await page.route("**/auth/v1/**", route => route.fulfill({ json: {
    access_token: token, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600,
    user: { id, aud: "authenticated", role: "authenticated", is_anonymous: true, app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() },
  } }));
  let fail = true;
  await page.route("**/rest/v1/guest_messages**", route => route.fulfill(fail
    ? { status: 503, json: { message: "Unavailable" } }
    : { json: { ...route.request().postDataJSON(), created_at: new Date().toISOString() } }));
  await page.setViewportSize({ width: 375, height: 852 });
  await installPlayerObservation(page);
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await clickGame(page, 360, 1180);
  await fillProfile(page, "연동 확인");
  await chooseStory(page, "신랑측");
  await startPreparedScene(page, "EndingScene");
  const field = page.getByRole("textbox", { name: "축하 메시지" });
  await field.fill("결혼 축하해요");
  // When the server rejects delivery, then the draft and form remain.
  await page.getByRole("button", { name: "메시지 남기기", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("다시");
  await expect(field).toHaveValue("결혼 축하해요");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-message-saved", "false");
  await page.screenshot({ path: test.info().outputPath("ending-error-375.png") });
  fail = false;
  await page.getByRole("button", { name: "메시지 남기기", exact: true }).click();
  await expect(field).toHaveCount(0);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-message-saved", "true");
});
