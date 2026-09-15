import { REVIEW_EVIDENCE } from "./review-evidence";
import { expect, test, type Page } from "@playwright/test";
import { writeFile, mkdir } from "node:fs/promises";
import { clickGame, fillProfile, chooseStory } from "./story-helpers";

const evidence = `${REVIEW_EVIDENCE}/regressions`;
type Transfer = { url: string; type: string; bytes: number; finished: boolean; status: number; cached: boolean };

async function coldTraffic(page: Page) {
  const requests = new Map<string, Transfer>();
  const failures: string[] = [];
  const errors: string[] = [];
  const client = await page.context().newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.setCacheDisabled", { cacheDisabled: true });
  client.on("Network.requestWillBeSent", event => {
    if (event.request.url.startsWith("http")) requests.set(event.requestId, { url: event.request.url, type: event.type ?? "", bytes: 0, finished: false, status: 0, cached: false });
  });
  client.on("Network.responseReceived", event => {
    const request = requests.get(event.requestId);
    if (request) { request.status = event.response.status; request.cached = Boolean(event.response.fromDiskCache || event.response.fromServiceWorker); }
  });
  client.on("Network.dataReceived", event => { const request = requests.get(event.requestId); if (request) request.bytes += event.encodedDataLength; });
  client.on("Network.loadingFinished", event => {
    const request = requests.get(event.requestId);
    if (request) { request.bytes = event.encodedDataLength; request.finished = true; }
  });
  client.on("Network.loadingFailed", event => { failures.push(`${requests.get(event.requestId)?.url}: ${event.errorText}`); });
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", entry => {
    if (entry.type() === "error" || /(?:Texture|Frame|Animation).*(?:missing|not found|has no frame|does not exist)/i.test(entry.text())) errors.push(entry.text());
  });
  return {
    failures, errors,
    snapshot: () => {
      const resources = [...requests.values()].map(request => ({ ...request }));
      const assets = resources.filter(request => /\/assets\/(?:lacitta|optimized|invitation|photo-table)\//.test(request.url));
      return { totalResponseBytes: resources.reduce((sum, request) => sum + request.bytes, 0),
        gameAssetBytes: assets.reduce((sum, request) => sum + request.bytes, 0), gameAssetRequests: assets.length,
        pendingRequests: resources.filter(request => !request.finished).map(request => request.url), resources };
    },
  };
}

for (const route of ["car", "subway"] as const) {
  test(`F09 production cold cache: opening and first ${route} lobby transfer`, async ({ page, baseURL }) => {
    test.skip(!baseURL?.includes(":5199"), "Transfer evidence requires the production preview config.");
    test.setTimeout(60000);
    const traffic = await coldTraffic(page);
    await page.setViewportSize({ width: 393, height: 852 });
    const startedAt = Date.now();
    await page.goto("/");
    const canvas = page.locator("#app canvas");
    await expect(canvas).toHaveAttribute("data-active-scene", "IntroScene");
    await expect(page.getByRole("button", { name: "출발", exact: true })).toBeAttached();
    const opening = { ...traffic.snapshot(), elapsedMs: Date.now() - startedAt };
    expect(opening.totalResponseBytes).toBeLessThanOrEqual(5_000_000);
    expect(opening.pendingRequests).toEqual([]);
    expect(opening.resources.every(request => !request.cached && request.status === 200)).toBe(true);
    expect(opening.resources.some(request => /\/src\/|@vite/.test(request.url))).toBe(false);
    expect(opening.resources.some(request => /car-guidance|subway-background|buffet|group-photo|gallery[-/]|photo-table\/|outfits|minimi-hair/.test(request.url))).toBe(false);
    await clickGame(page, 360, 1180);
    await fillProfile(page, "Cold Cache", route === "car" ? "female" : "male");
    await chooseStory(page, route === "car" ? "신부측" : "신랑측");
    await chooseStory(page, route === "car" ? "자차로 간다" : "지하철을 탄다");
    await chooseStory(page, route === "car" ? "파란색" : "5번 출구");
    await expect(canvas).toHaveAttribute("data-lobby-ready", "true", { timeout: 20000 });
    const firstLobby = traffic.snapshot();
    expect(firstLobby.resources.some(request => route === "car" ? /subway-background|pixel-venue-shuttle/.test(request.url) : /car-guidance|white-car/.test(request.url))).toBe(false);
    expect(firstLobby.resources.some(request => /buffet|group-photo|banquet|\/invitation\/gallery[-/]/.test(request.url))).toBe(false);
    expect(traffic.failures).toEqual([]);
    expect(traffic.errors).toEqual([]);
    await mkdir(evidence, { recursive: true });
    await writeFile(`${evidence}/performance-${route}.json`, JSON.stringify({
      measuredAt: new Date().toISOString(), throttling: "none; local Chromium cold cache", baselineBatch: "C", baselineTotalResponseBytes: 3509311, baselineAssetBytes: 3094744, deltaTotalResponseBytes: opening.totalResponseBytes - 3509311, deltaAssetBytes: opening.gameAssetBytes - 3094744,
      production: true, coldCache: true, measurement: "CDP Network.loadingFinished encodedDataLength; includes response headers, production JS/CSS and HTML in totalResponseBytes",
      viewport: { width: 393, height: 852, deviceScaleFactor: 1 }, route, opening, firstLobby,
      lateAssetsBeforeOpening: [], unselectedRouteAssetsByFirstLobby: [], failures: traffic.failures, errors: traffic.errors,
    }, null, 2) + "\n");
  });
}

test("F09 production: branded opening and retry after one deliberately failed later asset", async ({ page, baseURL }) => {
  test.skip(!baseURL?.includes(":5199"), "Recovery evidence uses the production build.");
  test.setTimeout(60000);
  const traffic = await coldTraffic(page);
  await page.setViewportSize({ width: 393, height: 852 });
  let releaseOpening!: () => void;
  const openingGate = new Promise<void>(resolve => { releaseOpening = resolve; });
  await page.route("**/optimized/lacitta-pixel-venue-hall.webp", async route => { await openingGate; await route.continue(); });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("dialog", { name: "추억을 준비하는 중" })).toBeVisible();
  await page.screenshot({ path: `${evidence}/f09-opening-loading-state-393.png` });
  releaseOpening();
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  let injected = false;
  await page.route("**/optimized/lacitta-characters-white-car.webp", async route => {
    if (!injected) { injected = true; await route.abort("failed"); }
    else await route.continue();
  });
  await clickGame(page, 360, 1180);
  await fillProfile(page);
  await chooseStory(page, "신랑측");
  await chooseStory(page, "자차로 간다");
  const retry = page.getByRole("button", { name: "다시 불러오기", exact: true });
  await expect(retry).toBeVisible();
  await expect(retry).toBeFocused();
  await expect(page.locator("#app canvas")).toHaveAttribute("data-asset-load-state", "error");
  await page.screenshot({ path: `${evidence}/f09-later-load-retry-393.png` });
  await page.keyboard.press("Enter");
  await chooseStory(page, "파란색");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-ready", "true", { timeout: 20000 });
  expect(traffic.failures).toHaveLength(1);
  expect(traffic.failures[0]).toContain("white-car.webp");
  expect(traffic.errors.filter(error => !error.includes("net::ERR_FAILED"))).toEqual([]);
  await writeFile(`${evidence}/load-recovery.json`, JSON.stringify({ injectedFailure: "white-car.webp, first request aborted", recovered: true,
    console: traffic.errors, failedRequests: traffic.failures, result: "Keyboard Enter retries; selected car route reaches lobby without resetting progression." }, null, 2) + "\n");
});
