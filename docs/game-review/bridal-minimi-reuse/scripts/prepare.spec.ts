import { expect, test } from "../../../../game/node_modules/@playwright/test/index.mjs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

test("apply only the imagegen bride-removal patch and preserve all other background pixels", async ({ page }) => {
  const root = resolve(process.cwd(), "..");
  const source = "game/artwork/sources/assets/lacitta/pixel-venue/bridal-room-white.png";
  const generated = "docs/game-review/bridal-minimi-reuse/artwork/generated-empty-room.png";
  const output = "game/artwork/sources/assets/lacitta/pixel-venue/bridal-room-empty-v2.png";
  const inputs = await Promise.all([source, generated].map(p => readFile(resolve(root, p)).then(b => b.toString("base64"))));
  const patch = { x: 648, y: 498, width: 128, height: 126 };
  const result = await page.evaluate(async ({ inputs, patch }) => {
    const images = await Promise.all(inputs.map(async data => { const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode(); return image; }));
    const [original, generated] = images;
    if (original!.width !== generated!.width || original!.height !== generated!.height) throw new Error("Generated framing changed");
    const canvas = document.createElement("canvas"); canvas.width = original!.width; canvas.height = original!.height;
    const context = canvas.getContext("2d")!; context.imageSmoothingEnabled = false;
    context.drawImage(original!, 0, 0);
    const before = context.getImageData(0, 0, canvas.width, canvas.height).data;
    context.drawImage(generated!, patch.x, patch.y, patch.width, patch.height, patch.x, patch.y, patch.width, patch.height);
    const after = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let changedInside = 0, changedOutside = 0;
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      if (before[i] === after[i] && before[i + 1] === after[i + 1] && before[i + 2] === after[i + 2] && before[i + 3] === after[i + 3]) continue;
      if (x >= patch.x && x < patch.x + patch.width && y >= patch.y && y < patch.y + patch.height) changedInside++;
      else changedOutside++;
    }
    return { width: canvas.width, height: canvas.height, changedInside, changedOutside, data: canvas.toDataURL("image/png").split(",")[1]! };
  }, { inputs, patch });
  expect(result.changedOutside).toBe(0); expect(result.changedInside).toBeGreaterThan(0);
  await mkdir(resolve(root, output, ".."), { recursive: true });
  await writeFile(resolve(root, output), Buffer.from(result.data, "base64"));
  const { data: _, ...stats } = result;
  await writeFile(resolve(root, "docs/game-review/bridal-minimi-reuse/artwork/patch-proof.json"), JSON.stringify({ source, generated, output, patch, ...stats }, null, 2) + "\n");
});
