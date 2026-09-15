import { transparentAtlas } from "./minimiArt";

/** Render the generated sprite's green matte as alpha, trimming empty atlas margins. */
export function shuttleDecoration(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.className = "invitation-shuttle-sprite";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "5번 출구 팻말과 노란 셔틀버스");
  const source = new Image();
  source.onload = () => {
    const clean = transparentAtlas(source);
    const data = clean.getContext("2d")!.getImageData(0, 0, clean.width, clean.height).data;
    let left = clean.width, top = clean.height, right = 0, bottom = 0;
    for (let y = 0; y < clean.height; y++) for (let x = 0; x < clean.width; x++) {
      if (data[(y * clean.width + x) * 4 + 3] < 128) continue;
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
    canvas.width = 112; canvas.height = Math.round(112 * (bottom - top + 1) / (right - left + 1));
    const context = canvas.getContext("2d")!;
    context.imageSmoothingEnabled = false;
    context.drawImage(clean, left, top, right - left + 1, bottom - top + 1, 0, 0, canvas.width, canvas.height);
    canvas.dataset.ready = "true";
  };
  source.src = "/assets/invitation/shuttle-pixel-matte.png";
  return canvas;
}
