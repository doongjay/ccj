import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import ts from "typescript";
import { chromium } from "@playwright/test";

const gameRoot = fileURLToPath(new URL("../", import.meta.url));
const { values } = parseArgs({ options: {
  manifest: { type: "string" }, provenance: { type: "string" },
  "public-root": { type: "string" }, "base-url": { type: "string" },
  "contract-only": { type: "boolean", default: false }, help: { type: "boolean" },
} });
if (values.help) {
  console.log("verify-assets [--manifest fixture.json] [--provenance ledger.md] [--public-root public] [--base-url http://127.0.0.1:5173] [--contract-only]");
  process.exit(0);
}
const source = await readFile(resolve(gameRoot, "src/data/assetManifest.ts"), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { ASSET_MANIFEST, ASSET_BUDGETS } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const manifest = values.manifest ? JSON.parse(await readFile(values.manifest, "utf8")) : ASSET_MANIFEST;
const provenanceText = await readFile(values.provenance ?? resolve(gameRoot, "../docs/asset-provenance.md"), "utf8");
const ledgerBlock = provenanceText.match(/```json\s*([\s\S]*?)```/u);
if (!ledgerBlock) throw new Error("Missing JSON provenance ledger");
const ledger = JSON.parse(ledgerBlock[1]);
if (!Array.isArray(manifest) || !Array.isArray(ledger)) throw new Error("Manifest and ledger must be arrays");
const publicRoot = resolve(values["public-root"] ?? resolve(gameRoot, "public"));
const errors = [];
const keys = new Set();
let initialBytes = 0;
let fontBytes = 0;
const images = [];
for (const asset of manifest) {
  if (!asset || typeof asset !== "object") { errors.push("Invalid entry"); continue; }
  const fail = (message) => errors.push(`${asset.key}: ${message}`);
  if (typeof asset.key !== "string" || keys.has(asset.key)) fail("invalid/duplicate key");
  keys.add(asset.key);
  if (typeof asset.url !== "string" || !/^\/assets\/lacitta\/[a-z]+\/[A-Za-z0-9-]+\.(png|webp|woff2)$/u.test(asset.url)) {
    fail("URL must be a local asset path without traversal"); continue;
  }
  if (!["image", "spritesheet", "font"].includes(asset.kind)) fail("invalid kind");
  if (!["initial", "share"].includes(asset.preloadGroup)) fail("invalid preload group");
  if (!Array.isArray(asset.sceneConsumers) || asset.sceneConsumers.length === 0) fail("missing consumers");
  if (!Number.isInteger(asset.byteLimit) || asset.byteLimit <= 0) fail("invalid byte limit");
  if (!Number.isInteger(asset.width) || !Number.isInteger(asset.height) || asset.width < 0 || asset.height < 0) fail("invalid dimensions");
  if (asset.kind !== "font" && (asset.width === 0 || asset.height === 0)) fail("empty image dimensions");
  const records = ledger.filter((record) => record.id === asset.provenanceId);
  if (records.length !== 1) { fail("missing/duplicate provenance"); continue; }
  const record = records[0];
  let completeRecord = true;
  for (const field of ["sourceUrl", "license", "mode", "transformationNotes", "rejectionStatus"]) {
    if (typeof record[field] !== "string" || record[field].trim().length === 0) {
      fail(`missing provenance ${field}`);
      completeRecord = false;
    }
  }
  if (!completeRecord) continue;
  if (!Object.hasOwn(record, "licenseFile")) fail("missing licenseFile field");
  if (asset.kind === "spritesheet" && (asset.width !== 128 || asset.height !== 192 || asset.frameWidth !== 32 || asset.frameHeight !== 48 || asset.columns !== 4 || asset.margin !== 0 || asset.spacing !== 0 || JSON.stringify(asset.rows) !== '["down","left","right","up"]')) fail("invalid character frame contract");
  if (values["contract-only"]) continue;
  if (record.rejectionStatus !== "accepted" || record.mode === "reference-only") fail("provenance not accepted for shipping");
  if (record.license === "pending" || record.sourceUrl.startsWith("pending:")) fail("unfinished provenance");
  if (!["generated", "reused"].includes(record.mode)) fail("invalid shipping origin");
  if (record.mode === "reused") {
    if (typeof record.licenseFile !== "string" || !record.licenseFile.startsWith("game/public/assets/lacitta/licenses/")) fail("reused asset needs local license");
    else {
      const licensePath = resolve(gameRoot, "..", record.licenseFile);
      const licenseRoot = resolve(gameRoot, "public/assets/lacitta/licenses");
      if (relative(licenseRoot, licensePath).startsWith(`..${sep}`)) fail("license path escapes root");
      else try { if ((await stat(licensePath)).size === 0) fail("empty license"); } catch { fail("missing license file"); }
    }
  }
  try {
    const bytes = await readFile(resolve(publicRoot, `.${asset.url}`));
    const limit = asset.kind === "font" ? ASSET_BUDGETS.fonts : asset.preloadGroup === "share" ? ASSET_BUDGETS.share : ASSET_BUDGETS.png;
    if (bytes.length === 0 || bytes.length > Math.min(asset.byteLimit, limit)) fail(`byte budget exceeded/empty (${bytes.length})`);
    if (asset.preloadGroup === "initial") initialBytes += bytes.length;
    if (asset.kind === "font") {
      fontBytes += bytes.length;
      if (bytes.subarray(0, 4).toString() !== "wOF2") fail("invalid WOFF2 signature");
    } else images.push({ asset, data: bytes.toString("base64") });
    if (values["base-url"]) {
      const response = await fetch(new URL(asset.url, values["base-url"]), { signal: AbortSignal.timeout(10000) });
      const payload = Buffer.from(await response.arrayBuffer());
      if (response.status !== 200 || !payload.equals(bytes)) fail(`HTTP asset differs or status ${response.status}`);
    }
    console.log(`${asset.key}: ${bytes.length} bytes`);
  } catch (error) { fail(error instanceof Error ? error.message : String(error)); }
}
if (!values["contract-only"]) {
  if (!values.manifest) {
    const shippedFiles = await readdir(resolve(publicRoot, "assets/lacitta"), { recursive: true });
    const urls = new Set(manifest.map((asset) => asset.url));
    for (const path of shippedFiles) {
      if (/\.(png|webp|woff2)$/u.test(path) && !urls.has(`/assets/lacitta/${path.split(sep).join("/")}`)) errors.push(`Unlisted shipping asset: ${path}`);
    }
  }
  if (initialBytes > ASSET_BUDGETS.preload) errors.push(`Initial preload ${initialBytes} > ${ASSET_BUDGETS.preload}`);
  if (fontBytes > ASSET_BUDGETS.fonts) errors.push(`Font total ${fontBytes} > ${ASSET_BUDGETS.fonts}`);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const { asset, data } of images) {
      const problems = await page.evaluate(async ({ asset, data }) => {
        const failures = [];
        const image = new Image();
        image.src = `data:image/${asset.url.endsWith(".webp") ? "webp" : "png"};base64,${data}`;
        try { await image.decode(); } catch { return ["image decode failed"]; }
        if (image.width !== asset.width || image.height !== asset.height) return [`dimensions ${image.width}x${image.height} do not match ${asset.width}x${asset.height}`];
        const canvas = document.createElement("canvas");
        canvas.width = image.width; canvas.height = image.height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return ["2D context unavailable"];
        context.drawImage(image, 0, 0);
        const frameWidth = asset.frameWidth ?? asset.width;
        const frameHeight = asset.frameHeight ?? asset.height;
        for (let y = 0; y < image.height; y += frameHeight) {
          for (let x = 0; x < image.width; x += frameWidth) {
            const pixels = context.getImageData(x, y, frameWidth, frameHeight).data;
            let visible = 0; let transparent = 0; let opaque = 0;
            const colors = new Set();
            for (let i = 0; i < pixels.length; i += 4) {
              const alpha = pixels[i + 3];
              if (alpha === 0) transparent += 1;
              if (alpha === 255) opaque += 1;
              if (alpha > 0) { visible += 1; colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]},${alpha}`); }
            }
            if (visible === 0 || colors.size < 2) failures.push(`blank/flat frame at ${x},${y}`);
            if (asset.alpha === "mixed" && transparent === 0) failures.push(`no transparent padding at ${x},${y}`);
            if (asset.alpha === "opaque" && opaque !== pixels.length / 4) failures.push("background must be opaque");
          }
        }
        return failures;
      }, { asset, data });
      errors.push(...problems.map((problem) => `${asset.key}: ${problem}`));
    }
  } finally { await browser.close(); }
}
console.log(`Checked ${manifest.length} entries; initial=${initialBytes}; fonts=${fontBytes}; mode=${values["contract-only"] ? "contract-only (not shipping approval)" : "shipping"}`);
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log("PASS");
