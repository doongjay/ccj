import { expect, test } from "@playwright/test";

test.skip(process.env.VITE_SUPABASE_URL !== "http://127.0.0.1:54321", "Run npm run test:cloud to use the isolated cloud fixture.");

const userId = "11111111-1111-4111-8111-111111111111";
test("message waits for server acknowledgement and retains the draft on failure", async ({ page }) => {
  // Given an anonymous guest and an unavailable message service.
  const token = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: userId, role: "authenticated", exp: 4102444800 })).toString("base64url")}.test`;
  await page.route("**/auth/v1/**", route => route.fulfill({ json: {
    access_token: token, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600,
    user: { id: userId, aud: "authenticated", role: "authenticated", is_anonymous: true, app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() },
  } }));
  await page.route("**/rest/v1/guestbook_entries**", route => route.fulfill({ json: [] }));
  let fail = true;
  let writes = 0;
  const ids: string[] = [];
  await page.route("**/rest/v1/guest_messages**", async route => {
    if (route.request().method() === "GET") { await route.fulfill({ json: [] }); return; }
    writes++;
    const data = route.request().postDataJSON();
    ids.push(data.id);
    if (fail) await route.fulfill({ status: 503, json: { message: "Unavailable" } });
    else await route.fulfill({ json: { ...data, created_at: new Date().toISOString() } });
  });
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/#invitation");
  await page.getByRole("textbox", { name: "이름", exact: true }).fill("연동 확인");
  await page.getByRole("button", { name: "여자", exact: true }).click();
  await page.locator(".outfit-card").first().click();
  const field = page.getByRole("textbox", { name: "축하 메시지", exact: true });
  await field.fill("서버 저장 확인");
  // When the first send fails.
  await page.getByRole("button", { name: "미니미와 메시지 남기기" }).click();
  // Then the draft survives and retry uses the same submission ID.
  await expect(page.locator(".invitation-form-error")).toContainText("다시");
  await expect(field).toHaveValue("서버 저장 확인");
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 852 });
    await page.locator(".invitation-form-error").scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath(`message-error-${width}.png`) });
  }
  await expect(page.locator(".minimi-guest")).toHaveCount(0);
  fail = false;
  await page.getByRole("button", { name: "미니미와 메시지 남기기" }).click();
  await expect(page.locator(".minimi-guest")).toHaveCount(1);
  await expect(field).toHaveValue("");
  expect(writes).toBe(2);
  expect(ids[0]).toBe(ids[1]);
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 852 });
    await page.locator(".minimi-wall").scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath(`message-saved-${width}.png`) });
  }
});
