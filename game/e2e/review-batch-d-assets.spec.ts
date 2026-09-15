import { expect, test } from "@playwright/test";
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { REVIEW_EVIDENCE as evidence } from "./review-evidence";

test("D-A01 full shipping inventory rejects corrupt image and bad sheet fixtures", async ({}, info) => {
  test.setTimeout(180000);
  const original = JSON.parse(await readFile("src/data/shippingAssets.json", "utf8"));
  const directory = await mkdtemp(join(tmpdir(), "ccj-d-shipping-fixtures-"));
  const publicRoot = join(directory, "public"), productionRoot = join(directory, "dist");
  await cp("public", publicRoot, { recursive: true }); await cp("dist", productionRoot, { recursive: true });
  const results: unknown[] = [];
  for (const scenario of ["decode", "sheet"] as const) {
    const catalog = structuredClone(original);
    const entry = catalog.assets.find((a: { contract: string }) => a.contract === "legacy-32x48");
    const file = join(publicRoot, entry.url), built = join(productionRoot, entry.url);
    const bytes = await readFile(file);
    if (scenario === "decode") {
      const invalid = Buffer.from("Deliberately corrupt PNG: full shipping decoder fixture.");
      await writeFile(file, invalid); await writeFile(built, invalid);
      entry.source = file; entry.sha256 = entry.sourceSHA256 = createHash("sha256").update(invalid).digest("hex");
    } else entry.frameWidth = 31;
    const path = join(directory, `${scenario}.json`), report = join(directory, `${scenario}-result.json`);
    await writeFile(path, JSON.stringify(catalog));
    const args = ["scripts/verify-assets.mjs", "--catalog", path, "--public-root", publicRoot, "--production-root", productionRoot, "--report", report];
    const run = spawnSync(process.execPath, args, { encoding: "utf8", maxBuffer: 10_000_000 });
    await writeFile(`${evidence}/logs/assets-${scenario}-fixture.log`, run.stdout + run.stderr);
    const data = JSON.parse(await readFile(report, "utf8"));
    await writeFile(`${evidence}/assets-${scenario}-fixture.json`, JSON.stringify(data, null, 2));
    results.push({ command: [process.execPath, ...args], fixture: path, exitCode: run.status, errors: data.errors, decoded: data.decoded });
    expect(run.status).toBe(1);
    expect(data.decoded).toBe(original.assets.filter((a: { kind: string }) => a.kind !== "font").length);
    expect(data.errors).toContain(`${entry.key}: ${scenario === "decode" ? "image decode failed" : "invalid legacy sheet contract"}`);
    await writeFile(file, bytes); await writeFile(built, bytes);
  }
  await info.attach("shipping-negative-fixtures", { body: JSON.stringify(results), contentType: "application/json" });
  await writeFile(resolve(evidence, "assets-negative-decoding.json"), JSON.stringify({ isolatedCopies: directory, results }, null, 2));
});
