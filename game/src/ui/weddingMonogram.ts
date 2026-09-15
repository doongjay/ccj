import type Phaser from "phaser";

const HEART_ROWS = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];
const HEART_COLOR = "#e9a0a7";

/** Draw the heart ourselves so Apple Color Emoji cannot replace its shape or colour. */
export function weddingMonogramElement(tag: "span" | "p"): HTMLElement {
  const monogram = document.createElement(tag);
  monogram.className = "invitation-monogram";
  monogram.setAttribute("aria-label", "JJ ♥ HS");
  const heart = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  heart.setAttribute("viewBox", "0 0 7 6");
  heart.setAttribute("class", "monogram-heart");
  heart.setAttribute("fill", HEART_COLOR);
  heart.setAttribute("shape-rendering", "crispEdges");
  heart.setAttribute("aria-hidden", "true");
  for (const [y, row] of HEART_ROWS.entries()) for (const [x, pixel] of Array.from(row).entries()) {
    if (pixel !== "1") continue;
    const square = document.createElementNS(heart.namespaceURI, "rect");
    for (const [key, value] of Object.entries({ x, y, width: 1, height: 1 })) square.setAttribute(key, String(value));
    heart.append(square);
  }
  monogram.append("JJ ", heart, " HS");
  return monogram;
}

export function weddingMonogram(scene: Phaser.Scene, x: number, y: number, size: number): Phaser.GameObjects.Container {
  const style = { fontFamily: "Galmuri11, monospace", fontSize: `${size}px`, color: "#8a6e53", resolution: 3 };
  const left = scene.add.text(0, 0, "JJ", style).setOrigin(0, .5);
  const right = scene.add.text(0, 0, "HS", style).setOrigin(0, .5);
  const cell = Math.max(1, Math.round(size / 10)), gap = Math.round(size / 3);
  const width = left.width + right.width + cell * 7 + gap * 2;
  const start = Math.round(-width / 2), heartX = start + left.width + gap;
  left.setX(start);
  right.setX(heartX + cell * 7 + gap);
  const parts: Phaser.GameObjects.GameObject[] = [left, right];
  for (const [rowY, row] of HEART_ROWS.entries()) for (const [rowX, pixel] of Array.from(row).entries()) {
    if (pixel !== "1") continue;
    parts.push(scene.add.rectangle(heartX + rowX * cell, rowY * cell - 3 * cell, cell, cell, 0xe9a0a7).setOrigin(0));
  }
  return scene.add.container(Math.round(x), Math.round(y), parts)
    .setName("wedding-screen-monogram").setData("screenBranding", true).setData("screenBrandingCopy", "JJ ♥ HS");
}
