import { outfitFrameBounds, OUTFIT_POSES } from "../data/guestOutfits";

type Gender = "male" | "female";
type Point = Readonly<{ x: number; y: number }>;

export const MINIMI_NECK = { x: 64, top: 78, width: 12, bottom: 94, garmentTop: 82, headOffsetY: 3 } as const;
export const MINIMI_SKIN = "#ffcea2";

// These describe the source artwork only. Every garment is registered to MINIMI_NECK.
const COLLARS: Record<Gender, readonly (readonly Point[])[]> = {
  male: [
    [{ x: 67, y: 92 }, { x: 58, y: 81 }, { x: 70, y: 82 }, { x: 63, y: 78 }, { x: 67, y: 91 }, { x: 68, y: 98 }],
    [{ x: 63, y: 92 }, { x: 53, y: 81 }, { x: 69, y: 82 }, { x: 61, y: 78 }, { x: 61, y: 91 }, { x: 62, y: 98 }],
    [{ x: 62, y: 92 }, { x: 56, y: 81 }, { x: 66, y: 82 }, { x: 63, y: 78 }, { x: 63, y: 91 }, { x: 63, y: 98 }],
  ],
  female: [
    [{ x: 64, y: 82 }, { x: 55, y: 71 }, { x: 69, y: 71 }, { x: 64, y: 78 }, { x: 63, y: 79 }, { x: 64, y: 80 }],
    [{ x: 61, y: 82 }, { x: 53, y: 71 }, { x: 66, y: 69 }, { x: 61, y: 78 }, { x: 60, y: 77 }, { x: 60, y: 78 }],
    [{ x: 63, y: 82 }, { x: 55, y: 71 }, { x: 70, y: 71 }, { x: 63, y: 78 }, { x: 62, y: 79 }, { x: 64, y: 80 }],
  ],
};

export function partCanvas(width = 128, height = 192): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  canvas.getContext("2d")!.imageSmoothingEnabled = false;
  return canvas;
}

/** White camisole inside the black wrap dress, under its authored lapels. */
export function addWhiteCamisole(garment: HTMLCanvasElement): HTMLCanvasElement {
  const context = garment.getContext("2d")!;
  const opening = context.getImageData(51, 91, 27, 12);
  const fabric = new Uint8Array(27 * 12);
  for (let i = 0; i < opening.data.length; i += 4) {
    const [r, g, b, a] = opening.data.subarray(i, i + 4);
    // The bounded chest opening excludes neck, arms, skirt and boots. Only
    // exposed skin becomes fabric; the original black collar stays on top.
    if (a >= 128 && isSkin(r, g, b)) fabric[i / 4] = 1;
  }
  for (let y = 0; y < 12; y++) for (let x = 0; x < 27; x++) {
    const pixel = y * 27 + x;
    if (!fabric[pixel]) continue;
    // A one-pixel sewn edge belongs to the camisole inside the dress opening,
    // below the neck. The black lapels and the white fabric interior stay intact.
    const edge = x === 0 || x === 26 || y === 0 || y === 11 ||
      !fabric[pixel - 1] || !fabric[pixel + 1] || !fabric[pixel - 27] || !fabric[pixel + 27];
    opening.data.set(edge ? [97, 87, 78] : [255, 249, 239], pixel * 4);
  }
  context.putImageData(opening, 51, 91);
  return garment;
}

function isSkin(red: number, green: number, blue: number): boolean {
  return red > 205 && green > 120 && blue > 75 && red - green > 20 && red - green < 85 && green - blue > 10 && green - blue < 80;
}

function brightenSkin(context: CanvasRenderingContext2D, body = false): void {
  const pixels = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  for (let offset = 0; offset < pixels.data.length; offset += 4) {
    const [red, green, blue, alpha] = pixels.data.slice(offset, offset + 4);
    if (body && red === 255 && green === 206 && blue === 162) continue;
    if (alpha < 128 || !isSkin(red, green, blue) || (body && (red < 240 || green < 175 || blue < 125))) continue;
    pixels.data.set([Math.round(red + (255 - red) * 0.25), Math.round(green + (243 - green) * 0.25), Math.round(blue + (223 - blue) * 0.25)], offset);
  }
  context.putImageData(pixels, 0, 0);
}

function removeStrayPixels(context: CanvasRenderingContext2D): void {
  const { width, height } = context.canvas;
  const pixels = context.getImageData(0, 0, width, height);
  const visited = new Uint8Array(width * height);
  for (let start = 0; start < visited.length; start += 1) {
    if (visited[start] || pixels.data[start * 4 + 3] < 128) continue;
    const component = [start];
    visited[start] = 1;
    for (let cursor = 0; cursor < component.length; cursor += 1) {
      const current = component[cursor];
      for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
        const x = current % width + dx, y = Math.floor(current / width) + dy;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        const next = y * width + x;
        if (!visited[next] && pixels.data[next * 4 + 3] >= 128) { visited[next] = 1; component.push(next); }
      }
    }
    if (component.length < 12) for (const pixel of component) pixels.data[pixel * 4 + 3] = 0;
  }
  context.putImageData(pixels, 0, 0);
}

/** Strip the original head/neck, then fit the garment to the shared neck and foot line. */
export function clothingPart(source: HTMLImageElement, gender: Gender, outfit: number, row: number): HTMLCanvasElement {
  const raw = partCanvas();
  const context = raw.getContext("2d")!;
  const bounds = outfitFrameBounds(source.width, source.height, gender, outfit, row);
  context.drawImage(source, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, 128, 192);
  removeStrayPixels(context);
  const collar = COLLARS[gender][outfit][row];
  const data = context.getImageData(0, 0, 128, 192);
  const neckSkin = new Uint8Array(128 * 192);
  for (let y = collar.y; y < collar.y + 12; y += 1) for (let x = collar.x - 10; x <= collar.x + 10; x += 1) {
    const offset = (y * 128 + x) * 4;
    const [r,g,b,a] = data.data.subarray(offset,offset+4);
    const innerNeck = Math.abs(x - collar.x) <= 5 && y < collar.y + 5;
    // Authored peach edge pixels can have r-g >85 (notably the posing knit).
    // They are still skin. Keep the darker sewn rim and pale ivory fabric.
    const peach = r >= 235 && g >= 135 && b >= 75 && r-g > 32 && g-b > 10;
    const saturatedSkinEdge = innerNeck && r >= 205 && g >= 100 && b >= 45 && r-g > 80;
    if (a >= 128 && (peach || saturatedSkinEdge || (innerNeck && r-g > 32 && isSkin(r,g,b)))) neckSkin[y * 128 + x] = 1;
  }
  let bottom = collar.y + 1;
  for (let y = 0; y < 192; y += 1) for (let x = 0; x < 128; x += 1) {
    const offset = (y * 128 + x) * 4;
    const raisedHand = OUTFIT_POSES[row] === "posing" && y >= (gender === "male" ? 68 : 62)
      && (gender === "male" ? x < 39 : x > 90);
    const outsideShoulder = y < collar.y + 12 && Math.abs(x - collar.x) > 9 + Math.max(0, y - collar.y) * 2;
    if (!raisedHand && (y < collar.y || outsideShoulder)) data.data[offset + 3] = 0;
    else if (neckSkin[y * 128 + x]) {
      // Normalize actual skin only. Ivory collar stitches and the authored rim
      // are garment pixels, even when adjacent to warm skin; keep them intact.
      data.data.set([255, 206, 162, 255], offset);
    }
    if (data.data[offset + 3] >= 128) bottom = Math.max(bottom, y);
  }
  context.putImageData(data, 0, 0);
  brightenSkin(context, true);
  const fitted = partCanvas();
  const fittedContext = fitted.getContext("2d")!;
  const scaleY = (184 - MINIMI_NECK.garmentTop) / (bottom - collar.y);
  fittedContext.setTransform(1, 0, 0, scaleY, MINIMI_NECK.x - collar.x, MINIMI_NECK.garmentTop - collar.y * scaleY);
  fittedContext.drawImage(raw, 0, 0);
  fittedContext.resetTransform();
  restoreShoulderOutline(fitted);
  return fitted;
}

/** Give cropped garments a finished shoulder edge without drawing across the neck. */
function restoreShoulderOutline(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext("2d")!;
  const pixels = context.getImageData(0, 0, 128, 192);
  for (let x = 30; x < 98; x++) {
    if (x >= 56 && x < 73) continue;
    for (let y = MINIMI_NECK.garmentTop; y < 108; y++) {
      const i = (y * 128 + x) * 4;
      if (pixels.data[i + 3] < 128) continue;
      const [r, g, b] = pixels.data.subarray(i, i + 3);
      if (!isSkin(r, g, b) && Math.max(r, g, b) > 100) {
        pixels.data.set([53, 48, 42, 255], i);
        const inside = i + 128 * 4;
        if (pixels.data[inside + 3] > 127 && Math.min(...pixels.data.subarray(inside, inside + 3)) > 140) pixels.data.set([89, 81, 69, 255], inside);
      }
      break;
    }
  }
  context.putImageData(pixels, 0, 0);
}

/** Short neck recessed into the jaw, widening into the collar opening.
 * Garments own the neckline; there is no separate vertical post or bottom seam. */
export function neckPart(): HTMLCanvasElement {
  const canvas = partCanvas();
  const context = canvas.getContext("2d")!;
  const left = MINIMI_NECK.x - MINIMI_NECK.width / 2;
  context.fillStyle = MINIMI_SKIN;
  context.fillRect(left, MINIMI_NECK.top, MINIMI_NECK.width, 5);
  // Two-pixel stepped edges match the jaw/garment outline weight. The short
  // vertical section ends at the shoulders, then the skin broadens underneath
  // the authored collar instead of continuing as a rectangular neck column.
  for (let y = 82; y < MINIMI_NECK.bottom; y++) {
    const inset = Math.min(4, Math.max(0, y - 83));
    const x = 59 - inset, width = 10 + inset * 2;
    context.fillStyle = MINIMI_SKIN;
    context.fillRect(x, y, width, 1);
    if (y < 87) {
      context.fillStyle = "#352c24";
      context.fillRect(x - 2, y, 2, 1);
      context.fillRect(x + width, y, 2, 1);
    }
  }
  return canvas;
}

/** Two new headless garments share the same neck and foot anchors as the original three. */
export function extraClothingPart(source: HTMLCanvasElement, outfit: number, row: number, gender: Gender, posingAnchor?: number, neckCutDepth = gender === "female" ? 5 : 0): HTMLCanvasElement {
  const edges = [0, .1836, .3418, .5, .6634, .832, 1];
  const sy = Math.round(edges[row] * source.height);
  const cw = Math.floor(source.width / 2), ch = Math.round(edges[row + 1] * source.height) - sy;
  const cell = partCanvas(cw, ch); const context = cell.getContext("2d")!;
  context.drawImage(source, outfit * cw, sy, cw, ch, 0, 0, cw, ch);
  const pixels = context.getImageData(0, 0, cw, ch).data;
  let top = ch, bottom = -1, left = cw, right = -1;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    if (pixels[(y * cw + x) * 4 + 3] < 128) continue;
    top = Math.min(top, y); bottom = Math.max(bottom, y); left = Math.min(left, x); right = Math.max(right, x);
  }
  const canvas = partCanvas(); const target = canvas.getContext("2d")!;
  const scale = (184 - MINIMI_NECK.garmentTop) / Math.max(1, bottom - top);
  // The collar lies at the top of each sprite. Use its own center for side poses.
  let collarLeft = cw, collarRight = -1;
  for (let y = top; y < Math.min(ch, top + 8); y++) for (let x = left; x <= right; x++) {
    if (pixels[(y * cw + x) * 4 + 3] < 128) continue;
    collarLeft = Math.min(collarLeft, x); collarRight = Math.max(collarRight, x);
  }
  // In the raised-hand row the fingertips share the collar's top scanlines.
  // Register the authored neckline, not the span from hand to opposite collar.
  // Coordinates are in the original 512px source cell; other rows have no such overlap.
  const anchor = row === 4 ? (posingAnchor ?? (gender === "male" ? [302, 207] : [321, 189])[outfit]) * cw / 512 : (collarLeft + collarRight) / 2;
  target.setTransform(scale, 0, 0, scale, 64 - anchor * scale, 82 - top * scale);
  target.drawImage(cell, 0, 0);
  target.resetTransform();
  brightenSkin(target, true);
  // Replace source neck skin only; fabric, rim and sewing retain their pixels.
  const neck = target.getImageData(58, 82, 12, 12);
  for (let i = 0; i < neck.data.length; i += 4) {
    const [r,g,b,a] = neck.data.subarray(i,i+4);
    const exposedSkin = gender === "female" && r > 235 && g > 185 && b > 140 && r-g > 12 && g-b > 10;
    const chromaEdge = i < 12 * 5 * 4 && g > r && b < g * .4;
    if (a >= 128 && chromaEdge) neck.data[i+3] = 0;
    else if (a >= 128 && (exposedSkin || (r - g > 32 && isSkin(r,g,b)))) neck.data.set([255,206,162,255],i);
  }
  target.putImageData(neck,58,82);
  if (neckCutDepth && [0,4,5].includes(row)) {
    // The headless source has an orange/chroma edge across its cut skin opening.
    // Remove that source cut inside the shared neck only. The actual scoop/V
    // collar starts below this aperture and keeps its authored fabric and seams.
    target.clearRect(58,82,12,neckCutDepth);
  }
  if ([1,2].includes(row)) {
    // Side sources start with a two-row cut across the neck, above the sloping
    // collar. Register that opening to the shared skin; preserve the collar
    // below y=84, including its diagonal fabric edge.
    target.clearRect(58,82,12,2);
  }
  // The cut skin edge extends beyond the central 12px aperture in the source.
  // Within that cut's height, remove warm skin-border pixels only; pink/gray/
  // blue fabric and the actual collar below the opening keep their artwork.
  const junction = target.getImageData(54,82,20,12);
  for (let y=0;y<12;y++) for (let x=0;x<20;x++) {
    const i=(y*20+x)*4;
    const [r,g,b,a]=junction.data.subarray(i,i+4);
    const matte = (g>=r && g-b>24) || (y<neckCutDepth && g-b>30 && r-g<32);
    // The dark red fringe of the source skin cut has almost equal green/blue;
    // requiring an orange hue leaves isolated red pixels in side neck openings.
    const cutSkin = y<neckCutDepth && r-g>28 && r-b>28;
    if (a>=128 && (matte || cutSkin)) junction.data[i+3]=0;
  }
  target.putImageData(junction,54,82);
  restoreShoulderOutline(canvas);
  return canvas;
}
