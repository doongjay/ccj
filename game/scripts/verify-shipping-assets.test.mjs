import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

const game = resolve(import.meta.dirname, "..");
const original = JSON.parse(await readFile(resolve(game, "src/data/shippingAssets.json"), "utf8"));
for (const scenario of [
  { name: "omitted optimized URL is rejected against the unchanged stage registry and production", change: c => { c.assets = c.assets.filter(a => a.runtimeKey !== "venue-lobby"); }, expected: "runtime optimized URL missing/mismatched" },
  { name: "duplicate shipping keys are rejected", change: c => { c.assets[1].key = c.assets[0].key; }, expected: "invalid/duplicate key" },
  { name: "missing optimized file is rejected", change: c => { c.assets.find(a => a.runtimeKey === "venue-lobby").url = "/assets/optimized/missing.webp"; }, expected: "ENOENT" },
  { name: "unresolved provenance is rejected", change: c => { c.provenance.find(p => p.id === "food-art").rejectionStatus = "pending"; }, expected: "provenance not accepted" },
  { name: "image cannot be hidden as a non-media exception", change: c => { c.nonMediaFiles.push("assets/unknown.png"); }, expected: "unknown non-media shipping exception" },
]) {
  test(`D-A01 ${scenario.name}`, async () => {
    const directory = await mkdtemp(join(tmpdir(), "ccj-d-asset-negative-"));
    const catalog = structuredClone(original); scenario.change(catalog);
    const input = join(directory, "catalog.json"), report = join(directory, "result.json");
    await writeFile(input, JSON.stringify(catalog));
    const result = spawnSync(process.execPath, ["scripts/verify-assets.mjs", "--catalog", input, "--report", report], { cwd: game, encoding: "utf8" });
    assert.equal(result.status, 1, result.stdout + result.stderr);
    const data = JSON.parse(await readFile(report, "utf8"));
    assert.ok(data.errors.some(e => e.includes(scenario.expected)), JSON.stringify(data.errors));
    // Preserve raw fixture/result paths; do not replace the shipping catalog or public files.
    console.log(JSON.stringify({ fixture: input, report, exitCode: result.status, expected: scenario.expected, errors: data.errors }));
  });
}
