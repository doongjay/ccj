import { prepareMinimiAudit } from "./stage-fixtures";
import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";
import { clickGame } from "./story-helpers";

test("original minimi artwork and six outfits preserve a shared head and continuous neck", async ({ page }, testInfo) => {
  await installPlayerObservation(page);
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await prepareMinimiAudit(page);
  const audit = await page.evaluate(() => {
    const game = window.__venueQaGame as Phaser.Game;
    const original = performance.getEntriesByType("resource").find(entry => entry.name.endsWith("/optimized/lacitta-characters-minimi-hair.webp"));
    const shifted: string[] = [], gaps: string[] = [], dirtyHair: string[] = [];
    for (const gender of ["male", "female"]) for (let face = 0; face < 3; face++) {
      const source = game.textures.get(`minimi-${gender}${face ? `-face-${face}` : ""}`).getSourceImage() as HTMLCanvasElement;
      const wigs = game.textures.get(`hairstyles-${gender}`).getSourceImage() as HTMLCanvasElement;
      for (let hair = 0; hair < 3; hair++) {
        const first = source.getContext("2d")!.getImageData(hair * 128, 0, 128, 192).data;
        const wig = wigs.getContext("2d")!.getImageData(hair * 128, 0, 128, 192).data;
        if (!face) for (let offset = 0; offset < wig.length; offset += 4) {
          const [r,g,b,a] = wig.slice(offset, offset + 4);
          if (a > 127 && (g > r + 16 && g > b + 16 || r > 205 && g > 170 && b > 120)) dirtyHair.push(`${gender}/${hair}/${offset}`);
        }
        for (let outfit = 0; outfit < 6; outfit++) {
          const pixels = source.getContext("2d")!.getImageData((outfit * 3 + hair) * 128, 0, 128, 192).data;
          for (let pixel = 0; pixel < 128 * 79; pixel++) if ([0,1,2,3].some(c => pixels[pixel * 4 + c] !== first[pixel * 4 + c])) shifted.push(`${gender}/${face}/${hair}/${outfit}/${pixel}`);
          for (let y = 79; y < 94; y++) for (let x = 61; x <= 66; x++) if (pixels[(y * 128 + x) * 4 + 3] < 128) gaps.push(`${gender}/${face}/${hair}/${outfit}/${x},${y}`);
        }
      }
    }
    return { source: original?.name, shifted, gaps, dirtyHair };
  });
  await testInfo.attach("original-art-registration", { body: JSON.stringify(audit), contentType: "application/json" });
  expect(audit.source).toMatch(/optimized\/lacitta-characters-minimi-hair.webp$/);
  expect(audit.shifted).toEqual([]); expect(audit.gaps).toEqual([]); expect(audit.dirtyHair).toEqual([]);
});

for (const [width, height] of [[320, 568], [393, 852], [430, 932]]) {
  test(`direct thumbnails preserve independent selections and all six outfits at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: width!, height: height! });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    await clickGame(page, 360, 1180);
    await page.getByRole("textbox", { name: "내 이름은", exact: true }).fill("원래 미니미");
    await page.getByRole("button", { name: "여자", exact: true }).click();
    await expect(page.locator(".minimi-customizer-title, .minimi-preview-caption")).toHaveCount(0);
    await expect(page.locator(".face-card:visible")).toHaveCount(3);
    await expect(page.locator(".hair-card:visible")).toHaveCount(3);
    await expect(page.locator(".outfit-card:visible")).toHaveCount(3);
    const previous = page.getByRole("button", { name: "이전 의상 보기", exact: true });
    const next = page.getByRole("button", { name: "다음 의상 보기", exact: true });
    // The 44px controls straddle the first/third card borders, at their midline.
    const cards = page.locator(".outfit-card:visible");
    for (const [arrow, card, side] of [[previous, cards.first(), "left"], [next, cards.last(), "right"]] as const) {
      const a = (await arrow.boundingBox())!, c = (await card.boundingBox())!;
      expect(Math.abs(a.x + a.width / 2 - (side === "left" ? c.x : c.x + c.width))).toBeLessThanOrEqual(1);
      expect(Math.abs(a.y + a.height / 2 - c.y - c.height / 2)).toBeLessThanOrEqual(1);
      expect(a.x).toBeGreaterThanOrEqual(0); expect(a.x + a.width).toBeLessThanOrEqual(width!);
    }
    await expect(previous.locator(".arrow-fill")).toHaveCSS("fill", "rgb(238, 176, 195)");
    await previous.focus(); await page.keyboard.press("Tab");
    await expect(next).toBeFocused(); await expect(next).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Space");
    expect(await page.locator(".outfit-card:visible").evaluateAll(nodes => nodes.map(node => (node as HTMLElement).dataset.index))).toEqual(["3", "4", "5"]);
    await previous.click();
    const hair = page.locator('[data-part="hair"] canvas').first();
    const hairBefore = await hair.evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL());
    const faceBefore = await page.locator(".face-card canvas").first().evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL());
    await page.locator(".hair-card").nth(2).click();
    expect(await page.locator(".face-card canvas").first().evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL())).toBe(faceBefore);
    await page.locator(".face-card").nth(1).click();
    expect(await hair.evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL())).toBe(hairBefore);
    await page.getByRole("button", { name: "다음 의상 보기", exact: true }).click();
    expect(await page.locator(".outfit-card:visible").evaluateAll(nodes => nodes.map(node => (node as HTMLElement).dataset.index))).toEqual(["3", "4", "5"]);
    await page.locator('.outfit-card[data-index="4"]').click();
    expect(await hair.evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL())).toBe(hairBefore);
    await expect(page.locator(".hair-card").nth(2)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('.outfit-card[data-index="4"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('.outfit-card[data-index="4"]')).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath("original-panel-independent-parts.png") });
    await page.getByRole("button", { name: "다음 의상 보기", exact: true }).click();
    expect(await page.locator(".outfit-card:visible").evaluateAll(nodes => nodes.map(node => (node as HTMLElement).dataset.index))).toEqual(["0", "1", "2"]);
    await page.getByRole("button", { name: "이전 의상 보기", exact: true }).click();
    await expect(page.locator('.outfit-card[data-index="4"]')).toHaveAttribute("aria-pressed", "true");
    for (const option of await page.locator(".minimi-part-option:visible, .minimi-outfit-arrow").all()) {
      const bounds = await option.boundingBox();
      expect(bounds!.width).toBeGreaterThanOrEqual(44); expect(bounds!.height).toBeGreaterThanOrEqual(44);
    }
    const offCenter = await page.locator(".minimi-parts canvas").evaluateAll(canvases => canvases.flatMap(node => {
      const canvas = node as HTMLCanvasElement;
      const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
      let left = canvas.width, right = 0, top = canvas.height, bottom = 0;
      for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
        if (pixels[(y * canvas.width + x) * 4 + 3] < 128) continue;
        left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      return Math.abs(left + right + 1 - canvas.width) > 2 || Math.abs(top + bottom + 1 - canvas.height) > 2 ? [canvas.closest("[data-part]")!.getAttribute("data-part")] : [];
    }));
    expect(offCenter).toEqual([]);
    expect(await page.locator(".text-entry-overlay").evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    await expect(page.locator(".text-entry-panel button[type=submit]")).toHaveCount(0);
    await expect(page.locator(".text-entry-actions button[type=submit]")).toBeVisible();
    await expect(page.getByRole("button", { name: "남자", exact: true })).toHaveCSS("height", "78px");
    await expect(page.getByRole("button", { name: "여자", exact: true })).toHaveCSS("height", "78px");
    const submit = await page.getByRole("button", { name: "시작하기", exact: true }).boundingBox();
    const game = await page.locator("#app canvas").boundingBox();
    expect(submit!.y + submit!.height).toBeLessThanOrEqual(game!.y + game!.height);
    await page.getByRole("button", { name: "남자", exact: true }).click();
    await expect(page.locator(".minimi-picker")).toHaveAttribute("data-gender", "male");
    await expect(previous.locator(".arrow-fill")).toHaveCSS("fill", "rgb(142, 203, 232)");
    await page.screenshot({ path: testInfo.outputPath("male-outfit-arrows.png") });
    await next.click();
    expect(await page.locator(".outfit-card:visible").evaluateAll(nodes => nodes.map(node => (node as HTMLElement).dataset.index))).toEqual(["3", "4", "5"]);
    await page.locator('.outfit-card[data-index="5"]').click();
    await page.screenshot({ path: testInfo.outputPath("male-outfit-six.png") });
    await page.getByRole("button", { name: "여자", exact: true }).click();
    await next.click(); await page.locator('.outfit-card[data-index="5"]').click();
    await page.screenshot({ path: testInfo.outputPath("female-camisole-outlined.png") });
    await page.locator('.outfit-card[data-index="4"]').click();
    await page.getByRole("button", { name: "시작하기", exact: true }).click();
    await expect(page.locator("#app canvas")).toHaveAttribute("data-guest-face", "1");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-guest-outfit", "4");
  });
}
