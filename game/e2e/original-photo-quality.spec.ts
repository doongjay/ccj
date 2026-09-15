import { test, expect } from "@playwright/test";
import type Phaser from "phaser";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { installPlayerObservation } from "./corridor-observables";
import { enterLobby, clickGame } from "./story-helpers";

const evidence = process.env.REVIEW_EVIDENCE!;
test("capture current photo display and frame interiors", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await installPlayerObservation(page);
  await page.goto("/");
  await enterLobby(page);
  const crop = await page.evaluate(() => {
    const game = window.__venueQaGame as Phaser.Game;
    const bg = game.textures.get("venue-lobby").getSourceImage() as HTMLImageElement;
    const wall = (game.textures.get("lobby-photo-wall") as Phaser.Textures.CanvasTexture).canvas;
    const canvas = document.createElement("canvas"); canvas.width = 640; canvas.height = 768;
    const ctx = canvas.getContext("2d")!; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bg, 640, 300, 160, 192, 0, 0, 640, 768);
    const background = canvas.toDataURL();
    ctx.drawImage(wall, 640, 300, 160, 192, 0, 0, 640, 768);
    return { background, composite: canvas.toDataURL() };
  });
  for (const [name, image] of Object.entries(crop)) await writeFile(`${evidence}/frames-${name}-4x.png`, Buffer.from(image.split(",")[1]!, "base64"));
  await page.screenshot({ path: `${evidence}/lobby-groom-393.png` });
  await clickGame(page, 550, 450);
  await expect(page.locator("canvas")).toHaveAttribute("data-photo-gallery-open", "true");
  if (await page.locator(".photo-table-original").count()) await page.locator(".photo-table-original").evaluate(image => (image as HTMLImageElement).decode());
  await page.screenshot({ path: `${evidence}/photo-table-groom-1-393.png` });
});

type Original = { source: string; url: string; bytes: number; sha256: string; width: number; height: number; fileName?: string };
const importRecord = async (): Promise<{ invitation: Original[]; photoTable: Original[] }> => JSON.parse(await readFile(resolve(process.cwd(), "../docs/game-review/original-photo-quality/original-import.json"), "utf8"));
const numbers = [1, 2, 3, 4, 5, 6, 11, 12, 13, 21, 22, 23, 24, 25, 26, 31, 32, 33, 41, 42, 43, 44, 45];

test("all 29 shipping photos are byte-identical originals and decode at original dimensions", async ({ page, request }, info) => {
  test.setTimeout(180000);
  const source = await importRecord();
  await page.goto("/");
  const records = [];
  for (const photo of [...source.invitation, ...source.photoTable]) {
    const response = await request.get(photo.url);
    expect(response.ok()).toBe(true);
    const bytes = await response.body();
    const original = await readFile(resolve(process.cwd(), "..", photo.source));
    expect(bytes.equals(original), photo.url).toBe(true);
    expect(createHash("sha256").update(bytes).digest("hex"), photo.url).toBe(photo.sha256);
    const dimensions = await page.evaluate(async url => {
      const image = new Image(); image.src = url; await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0, 128, 128);
      const rgba = ctx.getImageData(0, 0, 128, 128).data;
      const colors = new Set(); for (let i = 0; i < rgba.length; i += 4) colors.add(`${rgba[i]},${rgba[i + 1]},${rgba[i + 2]}`);
      return { width: image.naturalWidth, height: image.naturalHeight, colors: colors.size };
    }, photo.url);
    expect(dimensions.width).toBe(photo.width);
    expect(dimensions.height).toBe(photo.height);
    expect(dimensions.colors).toBeGreaterThan(100);
    records.push({ ...photo, responseBytes: bytes.length, originalIdentical: true, decoded: dimensions });
  }
  await writeFile(`${evidence}/original-integrity.json`, JSON.stringify(records, null, 2) + "\n");
  await info.attach("original-integrity", { body: JSON.stringify(records), contentType: "application/json" });
  const sheets = await page.evaluate(async groups => {
    const sheets = [];
    for (const [name, photos] of Object.entries(groups)) {
      const cols = name === "invitation" ? 6 : 3, cellWidth = 240, cellHeight = 330;
      const sheet = document.createElement("canvas"); sheet.width = cols * cellWidth; sheet.height = Math.ceil(photos.length / cols) * cellHeight;
      const ctx = sheet.getContext("2d")!; ctx.fillStyle = "#faf4e9"; ctx.fillRect(0, 0, sheet.width, sheet.height);
      for (const [i, photo] of photos.entries()) {
        const img = new Image(); img.src = photo.url; await img.decode();
        const factor = Math.min(220 / img.naturalWidth, 292 / img.naturalHeight), w = img.naturalWidth * factor, h = img.naturalHeight * factor;
        const x = i % cols * cellWidth, y = Math.floor(i / cols) * cellHeight;
        ctx.drawImage(img, x + (cellWidth - w) / 2, y + (300 - h) / 2, w, h);
        ctx.fillStyle = "#28392f"; ctx.font = "16px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(photo.fileName ?? photo.url.split("/").at(-1)!, x + cellWidth / 2, y + 318);
      }
      sheets.push({ name, image: sheet.toDataURL("image/png") });
    }
    return sheets;
  }, { invitation: source.invitation, photoTable: source.photoTable });
  for (const sheet of sheets) await writeFile(`${evidence}/${sheet.name}-originals-contact.png`, Buffer.from(sheet.image.split(",")[1]!, "base64"));
});

for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }]) {
  test(`invitation original gallery uses numeric order, full photos and wrapping navigation at ${viewport.width}`, async ({ page }, info) => {
    test.setTimeout(180000);
    await page.setViewportSize(viewport);
    const errors: string[] = [], requested: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
    page.on("request", r => requested.push(new URL(r.url()).pathname));
    await page.goto("/");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    expect(requested.filter(p => /\/photo-table\/|\/invitation\/gallery\//.test(p))).toEqual([]);
    await clickGame(page, 604, 78);
    const paths = numbers.map(n => `/assets/invitation/gallery/${n}.${n === 41 ? "png" : "jpg"}`);
    await expect(page.locator(".invitation-gallery img")).toHaveCount(23);
    expect(await page.locator(".invitation-gallery img").evaluateAll(imgs => imgs.map(i => i.getAttribute("src")))).toEqual(paths);
    await page.getByRole("button", { name: "1번째 사진 크게 보기", exact: true }).click();
    const dialog = page.locator(".invitation-lightbox");
    const records = [];
    for (let i = 0; i < paths.length; i++) {
      const current = dialog.locator(".is-current img");
      await expect(current).toHaveAttribute("src", paths[i]!);
      await current.evaluate(image => (image as HTMLImageElement).decode());
      await expect(current).toHaveCSS("image-rendering", "auto");
      await expect(dialog.locator(".invitation-gallery-count")).toHaveText(`${i + 1} / 23`);
      const dimensions = await current.evaluate(img => ({ width: (img as HTMLImageElement).naturalWidth, height: (img as HTMLImageElement).naturalHeight }));
      records.push({ index: i + 1, file: paths[i], ...dimensions });
      if (viewport.width === 393 || i === 0 || i === 18 || i === 22) await page.screenshot({ path: `${evidence}/invitation-${numbers[i]}-${viewport.width}.png` });
      if (i % 2) await dialog.getByRole("button", { name: "다음 사진", exact: true }).click();
      else await page.keyboard.press("ArrowRight");
    }
    await expect(dialog.locator(".is-current img")).toHaveAttribute("src", paths[0]!);
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.locator(".is-current img")).toHaveAttribute("src", paths.at(-1)!);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await page.locator("#invitation-gallery").screenshot({ path: `${evidence}/invitation-grid-${viewport.width}.png` });
    expect(errors).toEqual([]);
    await info.attach("numeric-original-gallery", { body: JSON.stringify({ viewport, records, errors }), contentType: "application/json" });
  });
}

test("original photo stays sharp on a DPR 3 screen and follows resized canvas without input leaks", async ({ browser, baseURL }, info) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
  const page = await context.newPage();
  try {
    await installPlayerObservation(page);
    await page.goto("/");
    await enterLobby(page);
    await clickGame(page, 550, 450);
    const image = page.locator(".photo-table-original");
    await image.evaluate(img => (img as HTMLImageElement).decode());
    expect(await image.evaluate(img => ({ width: (img as HTMLImageElement).naturalWidth, height: (img as HTMLImageElement).naturalHeight }))).toEqual({ width: 2852, height: 3803 });
    await image.screenshot({ path: `${evidence}/photo-table-groom-original-dpr3.png` });
    for (const viewport of [{ width: 430, height: 932 }, { width: 320, height: 568 }]) {
      await page.setViewportSize(viewport);
      await expect.poll(async () => page.evaluate(() => {
        const photo = document.querySelector(".photo-table-original")!.getBoundingClientRect();
        const canvas = document.querySelector("#app canvas")!.getBoundingClientRect();
        return { x: Math.round((photo.x + photo.width / 2 - canvas.x) * 720 / canvas.width), y: Math.round((photo.y + photo.height / 2 - canvas.y) * 1280 / canvas.height) };
      })).toEqual({ x: 360, y: 616 });
    }
    await page.getByRole("button", { name: "청첩장", exact: true }).click();
    await expect(page.locator(".invitation-page")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".invitation-page")).toHaveCount(0);
    await expect(image).toBeVisible();
    await expect(page.locator("#app canvas")).toHaveAttribute("data-photo-gallery-index", "0");
    await page.keyboard.press("Escape");
    await expect(image).toHaveCount(0);
    await info.attach("retina-and-resize", { body: "Original 2852×3803 image; DPR 3; 393→430→320; photo centre remains world 360,616; invitation return retains photo; Escape removes DOM photo.", contentType: "text/plain" });
  } finally { await context.close(); }
});
