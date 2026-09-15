import { readFile } from "node:fs/promises";
import catalog from "../src/data/shippingAssets.json" with { type: "json" };
import { expect, test } from "@playwright/test";

for (const asset of ["outfits-male", "outfits-female", "white-car", "minimi-hair", "formal-guests", "npc-bride-white"]) {
  test(`${asset} has a transparent background`, async ({ page }) => {
    await page.goto("/");
    const runtime = catalog.assets.find(entry => entry.runtimeKey === asset);
    const archived = catalog.preservedSources.find(entry => entry.previousPath.endsWith(`/characters/${asset}.png`));
    const src = runtime?.url ?? `data:image/png;base64,${(await readFile(`../${archived!.preservedPath}`)).toString("base64")}`;
    const alpha = await page.evaluate(async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      return context.getImageData(8, 8, 1, 1).data[3];
    }, src);
    expect(alpha).toBe(0);
  });
}
