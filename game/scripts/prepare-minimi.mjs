import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const [sourcePath, targetPath, mode = "alpha"] = process.argv.slice(2);
if (!sourcePath || !targetPath) throw new Error("Usage: node scripts/prepare-minimi.mjs source.png target.png [alpha|checker]");
const source = resolve(sourcePath);
const target = resolve(targetPath);
const metadata = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", source], { encoding: "utf8" }));
const { width, height } = metadata.streams[0];
const pixels = execFileSync("ffmpeg", ["-v", "error", "-i", source, "-f", "rawvideo", "-pix_fmt", "rgba", "pipe:1"], { maxBuffer: width * height * 8 });

if (mode === "checker") {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let read = 0;
  let write = 0;
  const enqueue = (index) => {
    if (visited[index]) return;
    visited[index] = 1;
    const offset = index * 4;
    const channels = [pixels[offset], pixels[offset + 1], pixels[offset + 2]];
    if (Math.max(...channels) - Math.min(...channels) > 25 || Math.min(...channels) < 85) return;
    queue[write++] = index;
    pixels[offset + 3] = 0;
  };
  for (let column = 0; column < width; column += 1) {
    enqueue(column);
    enqueue((height - 1) * width + column);
  }
  for (let row = 0; row < height; row += 1) {
    enqueue(row * width);
    enqueue(row * width + width - 1);
  }
  while (read < write) {
    const index = queue[read++];
    const column = index % width;
    if (column > 0) enqueue(index - 1);
    if (column + 1 < width) enqueue(index + 1);
    if (index >= width) enqueue(index - width);
    if (index + width < width * height) enqueue(index + width);
  }
} else {
  for (let offset = 3; offset < pixels.length; offset += 4) pixels[offset] = pixels[offset] < 220 ? 0 : 255;
}

for (let offset = 0; offset < pixels.length; offset += 4) {
  if (pixels[offset + 3] === 0) pixels.fill(0, offset, offset + 4);
}
execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "rawvideo", "-pixel_format", "rgba", "-video_size", `${width}x${height}`, "-i", "pipe:0", "-frames:v", "1", target], { input: pixels });
console.log(`Prepared ${target} (${width} × ${height})`);
