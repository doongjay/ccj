import { partCanvas } from "./minimiParts";

type Bounds = { x: number; y: number; width: number; height: number };

/** The generated atlases use a green matte; each sprite keeps its own silhouette. */
export function transparentAtlas(source: HTMLImageElement): HTMLCanvasElement {
  const canvas = partCanvas(source.width, source.height);
  const context = canvas.getContext("2d")!;
  context.drawImage(source, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let offset = 0; offset < pixels.data.length; offset += 4) {
    const [r, g, b] = pixels.data.subarray(offset, offset + 3);
    // These atlases contain only brown/black hair and warm skin. Remove the
    // darker green edge pixels as well as the bright matte between strands.
    if (g - r > 12 && g - b > 12) pixels.data.fill(0, offset, offset + 4);
  }
  context.putImageData(pixels, 0, 0);
  return canvas;
}

function visibleBounds(source: HTMLCanvasElement, cell: Bounds): Bounds {
  const pixels = source.getContext("2d")!.getImageData(cell.x, cell.y, cell.width, cell.height).data;
  let left = cell.width, right = -1, top = cell.height, bottom = -1;
  for (let y = 0; y < cell.height; y++) for (let x = 0; x < cell.width; x++) {
    if (pixels[(y * cell.width + x) * 4 + 3] < 128) continue;
    left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  if (right < left) throw new Error("Missing minimi sprite");
  return { x: cell.x + left, y: cell.y + top, width: right - left + 1, height: bottom - top + 1 };
}

/** Complete face artwork, including the expression and its matching blink. */
export function illustratedFace(source: HTMLCanvasElement, face: number, row: number): HTMLCanvasElement {
  const edges = [0, 0.275, 0.505, 0.735, 1];
  const x = Math.floor(face * source.width / 3), y = Math.floor(edges[row] * source.height);
  const bounds = visibleBounds(source, { x, y, width: Math.floor(source.width / 3), height: Math.floor(edges[row + 1] * source.height) - y });
  const canvas = partCanvas();
  const width = row === 1 || row === 2 ? 52 : 60;
  canvas.getContext("2d")!.drawImage(source, bounds.x, bounds.y, bounds.width, bounds.height, (128 - width) / 2, 21, width, 58);
  return canvas;
}

/** Wigs register to the same skull. Ponytails never change the face's scale. */
export function illustratedHair(source: HTMLCanvasElement, gender: "male" | "female", hair: number, row: number): HTMLCanvasElement {
  const column = hair + (gender === "female" ? 3 : 0);
  const edges = [0, 0.285, 0.515, 0.745, 1];
  const cellWidth = Math.floor(source.width / 6);
  const y = Math.floor(edges[row] * source.height);
  const height = Math.floor(edges[row + 1] * source.height) - y;
  const canvas = partCanvas();
  const scale = 0.42 * 256 / cellWidth;
  const anchorX = row === 0 ? [126, 126, 128, 128, 130, 117][column] : 128;
  const anchorY = row === 0 ? 246 : row === 3 ? 190 : 204;
  canvas.getContext("2d")!.drawImage(source, column * cellWidth, y, cellWidth, height,
    Math.round(64 - anchorX * 0.42), Math.round(79 - anchorY * 0.42), Math.round(cellWidth * scale), Math.round(height * scale));
  return canvas;
}

export function composeHead(hair: HTMLCanvasElement, face?: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = partCanvas();
  const context = canvas.getContext("2d")!;
  if (face) context.drawImage(face, 0, 0);
  context.drawImage(hair, 0, 0);
  return canvas;
}
