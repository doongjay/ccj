import { test, expect } from "../../../../game/node_modules/@playwright/test/index.mjs";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

test("decode supplied photographs in Chromium and prepare colour-managed game copies", async ({ page }) => {
  test.setTimeout(60000);
  const root = resolve(process.cwd(), "..");
  const evidence = resolve(root, "docs/game-review/photo-table-personalized");
  const originals = JSON.parse(await readFile(resolve(evidence, "asset-import.json"), "utf8"));
  const prepared = [];
  await mkdir(resolve(evidence, "first-conversion"), { recursive: true });
  for (const original of originals) {
    const input = await readFile(resolve(root, original.source));
    const result = await page.evaluate(async data => {
      const photo = new Image();
      photo.src = `data:image/jpeg;base64,${data}`;
      await photo.decode();
      const factor = Math.min(1, 1600 / Math.max(photo.naturalWidth, photo.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(photo.naturalWidth * factor);
      canvas.height = Math.round(photo.naturalHeight * factor);
      const ctx = canvas.getContext("2d", { colorSpace: "srgb" })!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);
      const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colors = new Set<number>();
      for (let i = 0; i < rgba.length; i += 400) colors.add((rgba[i]! << 16) | (rgba[i + 1]! << 8) | rgba[i + 2]!);
      return { sourceWidth: photo.naturalWidth, sourceHeight: photo.naturalHeight,
        width: canvas.width, height: canvas.height, sampledColors: colors.size,
        data: canvas.toDataURL("image/jpeg", .92).split(",")[1]! };
    }, input.toString("base64"));
    expect(result.sampledColors).toBeGreaterThan(100);
    const bytes = Buffer.from(result.data, "base64");
    expect(bytes.length).toBeLessThan(3_000_000);
    await rename(resolve(root, original.variant), resolve(evidence, "first-conversion", `${original.side}-${original.index}.jpg`));
    await writeFile(resolve(root, original.variant), bytes);
    const { data: _data, ...dimensions } = result;
    const { stdout: _stdout, stderr: _stderr, exitCode: _exitCode, command: _command, ...sourceRecord } = original;
    prepared.push({ ...sourceRecord, ...dimensions, bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      derivation: "Chromium image decode; sRGB Canvas; max edge 1600; JPEG quality 0.92; no crop or retouch",
      originalConversion: "asset-import.json; first-conversion/", preparationResult: "logs/prepare.json",
      command: "npm run test:e2e -- --config=../docs/game-review/photo-table-personalized/scripts/prepare.config.ts" });
  }
  await writeFile(resolve(evidence, "asset-import-final.json"), JSON.stringify(prepared, null, 2) + "\n");
});
