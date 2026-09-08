import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./verify-assets.mjs", import.meta.url));
const asset = { key: "galmuri11", url: "/assets/lacitta/fonts/Galmuri11.woff2", kind: "font", family: "Galmuri11", width: 0, height: 0, byteLimit: 500000, preloadGroup: "initial", provenanceId: "galmuri11", sceneConsumers: ["BootScene"] };
const provenance = { id: "galmuri11", sourceUrl: "https://github.com/quiple/galmuri", license: "SIL-OFL-1.1", licenseFile: "game/public/assets/lacitta/licenses/Galmuri-OFL.txt", mode: "reused", transformationNotes: "Korean/Latin subset", rejectionStatus: "accepted" };

for (const scenario of [
  { name: "accepts licensed font within budget", patch: {}, records: [provenance], exit: 0, diagnostic: "PASS" },
  { name: "rejects external asset URLs", patch: { url: "https://example.com/font.woff2" }, records: [provenance], exit: 1, diagnostic: "local asset path" },
  { name: "rejects missing provenance", patch: {}, records: [], exit: 1, diagnostic: "missing/duplicate provenance" },
  { name: "rejects byte overflow", patch: { byteLimit: 1 }, records: [provenance], exit: 1, diagnostic: "byte budget" },
  { name: "rejects missing file", patch: { url: "/assets/lacitta/fonts/missing.woff2" }, records: [provenance], exit: 1, diagnostic: "ENOENT" },
  { name: "rejects reference-only origin", patch: {}, records: [{ ...provenance, mode: "reference-only" }], exit: 1, diagnostic: "not accepted" },
  { name: "rejects malformed provenance", patch: {}, records: [{ ...provenance, sourceUrl: null }], exit: 1, diagnostic: "missing provenance sourceUrl" },
  { name: "rejects incorrect decoded image dimensions", patch: { url: "/assets/lacitta/routes/home-background.png", kind: "image", width: 1, height: 1, alpha: "opaque" }, records: [{ ...provenance, mode: "generated", sourceUrl: "fixture:dimension-rejection", license: "fixture-only", licenseFile: null }], exit: 1, diagnostic: "do not match 1x1" },
]) {
  test(`Given an isolated manifest When verified Then ${scenario.name}`, async () => {
    const directory = await mkdtemp(join(tmpdir(), "lacitta-verifier-"));
    try {
      const manifest = join(directory, "manifest.json");
      const ledger = join(directory, "provenance.md");
      await writeFile(manifest, JSON.stringify([{ ...asset, ...scenario.patch }]));
      await writeFile(ledger, `\n\x60\x60\x60json\n${JSON.stringify(scenario.records)}\n\x60\x60\x60\n`);
      const result = spawnSync(process.execPath, [script, "--manifest", manifest, "--provenance", ledger], { encoding: "utf8" });
      assert.equal(result.status, scenario.exit, result.stdout + result.stderr);
      assert.ok((result.stdout + result.stderr).includes(scenario.diagnostic), result.stdout + result.stderr);
    } finally { await rm(directory, { recursive: true, force: true }); }
  });
}
