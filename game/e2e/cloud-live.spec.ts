import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "vite";
import { z } from "zod";

test.skip(process.env.CCJ_LIVE_QA !== "1", "Explicitly opt in: this creates labelled records in the real project.");

test("real guest message persists while another guest cannot read or impersonate the author", async ({ page }, info) => {
  test.setTimeout(90000);
  const env = loadEnv("development", process.cwd(), "VITE_");
  const url = z.url().parse(env.VITE_SUPABASE_URL);
  const key = z.string().min(1).parse(env.VITE_SUPABASE_PUBLISHABLE_KEY);
  const name = "연동 검증";
  const message = `Supabase 저장 확인 ${new Date().toISOString()}`;
  await page.setViewportSize({ width: 393, height: 852 });
  // Given a guest on the live Supabase project.
  await page.goto("/#invitation");
  await page.getByRole("textbox", { name: "이름", exact: true }).fill(name);
  await page.getByRole("button", { name: "여자", exact: true }).click();
  await page.locator(".outfit-card").first().click();
  await page.getByRole("textbox", { name: "축하 메시지", exact: true }).fill(message);
  const savedMessage = page.waitForResponse(response => response.url().includes("/rest/v1/guest_messages") && response.request().method() === "POST");
  // When they submit a real message.
  await page.getByRole("button", { name: "미니미와 메시지 남기기" }).click();
  const response = await savedMessage;
  expect(response.status()).toBe(201);
  const row = z.object({ id: z.uuid(), user_id: z.uuid() }).parse(await response.json());
  await expect(page.locator(`.invitation-message[data-guest-id="${row.id}"]`)).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".invitation-messages")).toContainText(message);
  await page.locator(".invitation-guest-form").scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath("live-message.png") });
  // Public entries are readable; original message records remain private.
  const peer = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const signIn = await peer.auth.signInAnonymously();
  expect(signIn.error).toBeNull();
  const publicEntries = await peer.from("guestbook_entries").select("id,name,message,avatar").eq("id", row.id);
  expect(publicEntries.error).toBeNull();
  expect(publicEntries.data).toHaveLength(1);
  const messages = await peer.from("guest_messages").select("id").eq("id", row.id);
  expect(messages.error).toBeNull();
  expect(messages.data).toEqual([]);
  const forbidden = await peer.from("guest_messages").insert({ id: crypto.randomUUID(), user_id: row.user_id, name, side: "groom", message: "must not save", avatar: {} });
  expect(forbidden.error?.code).toBe("42501");
  const update = await peer.from("guest_messages").update({ message: "must not overwrite" }).eq("id", row.id);
  expect(update.error?.code).toBe("42501");
  const anonymous = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  for (const reader of [peer, anonymous]) {
    const publicRead = await reader.from("guestbook_entries").select("id").eq("id", row.id);
    expect(publicRead.error).toBeNull();
    expect(publicRead.data).toHaveLength(1);
    const absentId = crypto.randomUUID();
    const viewUpdate = await reader.from("guestbook_entries").update({ message: "must not overwrite" }).eq("id", absentId);
    expect(viewUpdate.error?.code).toBe("42501");
    const viewDelete = await reader.from("guestbook_entries").delete().eq("id", absentId);
    expect(viewDelete.error?.code).toBe("42501");
    const viewInsert = await reader.from("guestbook_entries").insert({ id: row.id, name, side: "groom", message, avatar: {} });
    expect(viewInsert.error?.code).toBe("42501");
  }
  const anonymousRead = await anonymous.from("guest_messages").select("id").limit(1);
  expect(anonymousRead.error?.code).toBe("42501");
  await info.attach("live-verification", { body: JSON.stringify({ messageId: row.id, ownerId: row.user_id, rls: "passed" }), contentType: "application/json" });
});
