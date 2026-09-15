import { REVIEW_EVIDENCE } from "./review-evidence";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { clickGame, enterLobby, receiveEnvelope } from "./story-helpers";
import { installPlayerObservation } from "./corridor-observables";
const evidence = REVIEW_EVIDENCE;
declare global { interface Window { __receptionNotices: string[] } }

async function watchNotices(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__receptionNotices = [];
    new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.matches(".reception-notice") || node.querySelector(".reception-notice")) window.__receptionNotices.push(node.textContent ?? "");
      }
    }).observe(document, { childList: true, subtree: true });
  });
}

test("reception completes without a notice; walking, notebook, invitation and room revisits remain available", async ({ page }, info) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 393, height: 852 });
  await installPlayerObservation(page);
  await watchNotices(page);
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
  page.on("requestfailed", r => errors.push(r.url()));
  const start = Date.now();
  await page.goto("/"); await enterLobby(page);
  const clipStart = Date.now() - start;
  await clickGame(page, 360, 420); await receiveEnvelope(page);
  const notice = page.locator(".reception-notice"); const canvas = page.locator("#app canvas");
  await expect(notice).toHaveCount(0);
  await page.screenshot({ path: `${evidence}/reception-complete-no-banner-393.png` });
  const before = await page.evaluate(() => window.__venuePlayerSnapshot());
  await clickGame(page, 350, 760);
  await expect.poll(() => page.evaluate(() => window.__venuePlayerSnapshot())).not.toEqual(before);
  await expect(notice).toHaveCount(0, { timeout: 4000 });
  await expect(canvas).toHaveAttribute("data-lobby-progress", "1/3");
  const clipEnd = Date.now() - start;
  const first = await canvas.evaluate(el => ({ ...el.dataset }));
  await page.getByRole("button", { name: "청첩장", exact: true }).click(); await page.keyboard.press("Escape");
  await expect(notice).toHaveCount(0);
  await clickGame(page, 130, 590); await expect(canvas).toHaveAttribute("data-active-scene", "PhotoBoothScene");
  await clickGame(page, 360, 1180); await expect(canvas).toHaveAttribute("data-lobby-ready", "true");
  await expect(canvas).toHaveAttribute("data-active-scene", "VenueLobbyScene");
  await page.waitForTimeout(2600); await expect(notice).toHaveCount(0);
  await page.screenshot({ path: `${evidence}/f15-lobby-revisit-no-banner-393.png` });
  await clickGame(page, 128, 60); await expect(page.locator(".story-copy")).toContainText("♥  축의대"); await page.keyboard.press("Escape");
  const notices = await page.evaluate(() => window.__receptionNotices);
  expect(notices).toEqual([]);
  expect(errors).toEqual([]);
  await writeFile(`${evidence}/reception-events.json`, JSON.stringify({ start, clipStart, clipEnd, notices, first, errors, video: await page.video()!.path() }, null, 2));
  await info.attach("reception-observations", { body: JSON.stringify({ notices, first }), contentType: "application/json" });
});
test.use({ video: { mode: "on", size: { width: 393, height: 852 } } });

test("opening the invitation after reception preserves progress without introducing a notice", async ({ page }) => {
  test.setTimeout(45000);
  await page.setViewportSize({ width: 393, height: 852 });
  await watchNotices(page);
  await page.goto("/"); await enterLobby(page); await clickGame(page, 360, 420); await receiveEnvelope(page);
  const notice = page.locator(".reception-notice");
  await expect(notice).toHaveCount(0);
  await page.getByRole("button", { name: "청첩장", exact: true }).click();
  await expect(page.locator(".invitation-page")).toBeVisible();
  await page.waitForTimeout(2600); await expect(notice).toHaveCount(0);
  await page.keyboard.press("Escape"); await expect(notice).toHaveCount(0);
  await expect(notice).toHaveCount(0, { timeout: 3500 });
  const data = await page.locator("#app canvas").evaluate(el => ({ ...el.dataset }));
  expect(data.lobbyProgress).toBe("1/3");
  expect(await page.evaluate(() => window.__receptionNotices)).toEqual([]);
  await writeFile(`${evidence}/reception-pause-events.json`, JSON.stringify(data, null, 2));
});
