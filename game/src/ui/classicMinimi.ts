import { partCanvas, MINIMI_SKIN } from "./minimiParts";

type Eye = { x: number; top: number; clear: readonly (readonly [number, number, number, number])[] };
// Native feature bounds measured from each authored side-facing head, in source
// column order. Eye height/position varies; a front-face mask clips the fringe
// and leaves the bottom of the old iris. Split bounds follow overlapping hair.
const SIDE_EYES: readonly (readonly Eye[])[] = [
  [
    { x:54, top:55, clear:[[49,54,13,12]] },
    { x:52, top:55, clear:[[49,54,9,2],[47,56,13,3],[48,59,11,7]] },
    { x:50, top:55, clear:[[45,54,14,12]] },
    { x:46, top:55, clear:[[44,54,8,2],[42,56,13,4],[44,60,10,6]] },
    { x:51, top:55, clear:[[48,54,10,2],[47,56,13,7],[48,63,9,3]] },
    { x:40, top:55, clear:[[36,54,13,12]] },
  ],
  [
    { x:82, top:54, clear:[[74,53,13,13]] },
    { x:80, top:55, clear:[[78,54,5,2],[74,56,12,4],[76,60,9,6]] },
    { x:86, top:57, clear:[[82,56,7,2],[80,58,11,4],[82,62,7,6]] },
    { x:82, top:59, clear:[[78,58,9,2],[75,60,12,3],[77,63,9,6]] },
    { x:82, top:59, clear:[[78,58,10,5],[78,63,9,6]] },
    { x:82, top:59, clear:[[77,58,10,2],[75,60,11,3],[77,63,8,6]] },
  ],
];
const sideEye = new WeakMap<HTMLCanvasElement, Eye>();
const headGender = new WeakMap<HTMLCanvasElement, "male" | "female">();

/** Register the original illustrated heads to one chin and neck anchor. */
export function classicHead(source: HTMLCanvasElement, gender: "male" | "female", hair: number, row: number): HTMLCanvasElement {
  const column = hair + (gender === "female" ? 3 : 0);
  const edges = [0, .285, .515, .745, 1];
  const cell = partCanvas(256, 292);
  const cx = cell.getContext("2d")!;
  const top = Math.round(edges[row] * source.height);
  const height = Math.round((edges[row + 1] - edges[row]) * source.height);
  cx.drawImage(source, column * source.width / 6, top, source.width / 6, height, 0, 0, 256, height * 1536 / source.width);
  // Source neck junctions, not the silhouette centers (the wave/ponytail are asymmetric).
  const anchorX = row === 0 ? [128, 128, 128, 124, 125, 112][column] : row === 1 ? [123, 123, 124, 126, 116, 125][column] : row === 2 ? [124, 128, 121, 124, 126, 135][column] : 125;
  const chin = row === 0 ? 245 : row === 1 ? 181 : row === 2 ? 171 : 179;
  const data = cx.getImageData(0, 0, 256, 292);
  for (let y = 0; y < 292; y++) for (let x = 0; x < 256; x++) {
    const i = (y * 256 + x) * 4;
    const [r, g, b] = data.data.subarray(i, i + 3);
    const skin = r > 175 && r - g > 20 && g - b > 12;
    if (y > chin && (skin || Math.abs(x - anchorX) < 26)) data.data[i + 3] = 0;
    else if (skin && r > 225 && g > 155) data.data.set([255, 206, 162], i);
  }
  cx.putImageData(data, 0, 0);
  const head = partCanvas();
  headGender.set(head, gender);
  if (row === 1 || row === 2) sideEye.set(head, SIDE_EYES[row - 1][column]);
  head.getContext("2d")!.drawImage(cell, Math.round(64 - anchorX * .42), Math.round(79 - chin * .42), 108, 123);
  if (gender === "male") head.getContext("2d")!.clearRect(0, 80, 128, 112);
  else if (row === 0) {
    // The female source's dark neck edges sit just outside the skin crop.
    // Remove that old central neck, including the detached 1px strokes, while
    // preserving the hair down either side. The compositor owns this junction.
    head.getContext("2d")!.clearRect(52, 80, 24, 112);
  }
  // The small opening under the chin joins the shared neck without a dark stripe.
  const context = head.getContext("2d")!;
  if (row !== 3) { context.fillStyle = MINIMI_SKIN; context.fillRect(59, 77, 10, 3); }
  return head;
}

/** Expressions alter only the original face; hair, head size and body never move. */
export function classicExpression(head: HTMLCanvasElement, face: number, row: number, blink = false, gender = headGender.get(head)): HTMLCanvasElement {
  const canvas = partCanvas();
  const context = canvas.getContext("2d")!;
  context.drawImage(head, 0, 0);
  const feminine = gender === "female" && face < 2;
  if (row === 3 || (!face && !blink && !feminine)) return canvas;
  const feature = sideEye.get(head);
  // Bring the third expression's front eyes inward by one native pixel each.
  const eyes = row === 0 ? (face === 2 ? [51, 77] : [50, 78]) : [feature!.x];
  for (const x of eyes) {
    const top = row === 0 ? 54 : feature!.top;
    if (face === 2 || blink) {
      context.fillStyle = MINIMI_SKIN;
      // The authored eye includes sclera beyond the old 12px replacement box.
      // Clear its complete feature footprint before either a new eye or a blink.
      if (row === 0) {
        const left = x < 64 ? 44 : 70;
        context.fillRect(left, 55, 16, 10);
        // Keep the inward fringe above the right eye, outside its old sclera.
        context.fillRect(x < 64 ? left : left + 2, 52, x < 64 ? 16 : 14, 3);
      } else for (const bounds of feature!.clear) context.fillRect(...bounds);
      context.fillStyle = "#302820";
      if (blink) { context.fillRect(x - 4, top + 4, 8, 2); context.fillRect(x - 5, top + 3, 2, 2); }
      else { context.fillRect(x - 3, top, 6, 10); context.fillRect(x - 4, top + 2, 8, 6); context.fillStyle = "#fff9ef"; context.fillRect(x - 2, top + 1, 2, 3); }
    }
    if (feminine) softenOriginalEye(context, x, top, blink, row === 1 ? -1 : row === 2 ? 1 : x < 64 ? -1 : 1);
    if (face === 1) drawRoundRim(context, x, top);
  }
  if (face === 1 && row === 0) { context.fillStyle = "#51443c"; context.fillRect(58, 55, 12, 2); }
  return canvas;
}

function drawRoundRim(context: CanvasRenderingContext2D, x: number, top: number): void {
  context.fillStyle = "#51443c";
  const rings = [[-4,-3,8,2],[-7,-1,3,2],[4,-1,3,2],[-9,1,2,9],[7,1,2,9],[-7,10,3,2],[4,10,3,2],[-4,12,8,2]];
  for (const [dx,dy,w,h] of rings) context.fillRect(x+dx!, top+dy!, w!, h!);
}

function softenOriginalEye(context: CanvasRenderingContext2D, x: number, top: number, blink: boolean, outward: number): void {
  if (blink) {
    context.fillStyle = "#302820";
    context.fillRect(x + outward * 4, top + 5, 1, 2);
    context.fillRect(x + outward * 3, top + 6, 1, 2);
    return;
  }
  // Keep the authored iris, sclera and eye shape. Lower only the outer lid's
  // skin-facing edge by one native pixel; never replace the eye with face 3.
  const pixels = context.getImageData(0, 0, 128, 192).data;
  const skin = (i: number) => pixels[i] > 175 && pixels[i] - pixels[i + 1] > 20 && pixels[i + 1] - pixels[i + 2] > 12;
  for (const distance of [2, 3, 4]) {
    const px = x + outward * distance;
    for (let py = top - 2; py <= top + 2; py++) {
      const i = (py * 128 + px) * 4;
      if (pixels[i + 3] > 127 && Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) < 100 && skin(i - 128 * 4)) {
        context.fillStyle = `rgb(${pixels[i - 512]}, ${pixels[i - 511]}, ${pixels[i - 510]})`;
        context.fillRect(px, py, 1, 1);
        break;
      }
    }
  }
  // Two short lashes connected to the original outer corner, not a new rim.
  context.fillStyle = "#302820";
  context.fillRect(x + outward * 5, top + 2, 1, 2);
  context.fillRect(x + outward * 6, top + 3, 1, 2);
  context.fillRect(x + outward * 5, top + 5, 1, 2);
  context.fillRect(x + outward * 6, top + 6, 1, 2);
}

/** Hair-only thumbnail: discard skin and isolated facial pixels, keeping the crown. */
export function classicHairThumbnail(head: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = partCanvas(); const context = canvas.getContext("2d")!;
  context.drawImage(head, 0, 0);
  const pixels = context.getImageData(0, 0, 128, 192);
  for (let y = 0; y < 192; y++) for (let x = 0; x < 128; x++) {
    const i = (y * 128 + x) * 4;
    const [r, g, b] = pixels.data.subarray(i, i + 3);
    if (r > 175 && g > 100 && r - b > 40 || r > 185 && g > 170 && b > 150 || y > 45 && x > 42 && x < 85) pixels.data[i + 3] = 0;
  }
  const visited = new Uint8Array(128 * 192);
  const queue: number[] = [];
  for (let p = 0; p < 128 * 35; p++) if (pixels.data[p * 4 + 3] > 127) { queue.push(p); visited[p] = 1; }
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const p = queue[cursor];
    for (const delta of [-128, 128, -1, 1]) {
      const next = p + delta;
      if (next >= 0 && next < visited.length && !visited[next] && pixels.data[next * 4 + 3] > 127) { visited[next] = 1; queue.push(next); }
    }
  }
  for (let p = 0; p < visited.length; p++) if (!visited[p]) pixels.data[p * 4 + 3] = 0;
  context.putImageData(pixels, 0, 0); return canvas;
}

export function classicFaceThumbnail(head: HTMLCanvasElement, face: number, gender = headGender.get(head)): HTMLCanvasElement {
  const canvas = partCanvas(); const context = canvas.getContext("2d")!;
  context.beginPath(); context.ellipse(64, 51, 30, 28, 0, 0, Math.PI * 2); context.clip();
  context.fillStyle = MINIMI_SKIN; context.fillRect(34, 23, 60, 56);
  const expression = classicExpression(head, face, 0, false, gender);
  // Copy facial features only. The finished head keeps its outline, while this
  // standalone face thumbnail has neither a second jaw contour nor a neck.
  context.drawImage(expression, 44, 47, 16, 18, 44, 47, 16, 18);
  context.drawImage(expression, 70, 47, 15, 18, 70, 47, 15, 18);
  if (face === 1) {
    // Rims extend outside the eye crop. Draw the shared spectacles there,
    // rather than copying the head's sideburn/jaw edges as bracket-like lines.
    for (const x of [50, 78]) drawRoundRim(context, x, 54);
    context.fillStyle = "#51443c"; context.fillRect(58, 55, 12, 2);
  }
  context.drawImage(expression, 54, 68, 20, 6, 54, 68, 20, 6);
  return canvas;
}
