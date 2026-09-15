"""Package existing evidence without modifying originals or old archives."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parents[2]
folders = [root / "car-guidance-correction", root / "lobby-return-tap-fix"]
output = root / "route-lobby-tap-review.zip"
assert not output.exists(), f"Preserving existing archive: {output}"
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
excluded = []
included = []
for folder in folders:
    for p in sorted(folder.rglob("*")):
        if not p.is_file():
            continue
        reason = None
        if p.name == "trace.zip":
            reason = "Large trace resource bundle; original preserved. Extracted trace/network/stacks, reporter errors, failure video and error-context included."
        elif any(part.startswith(".playwright-artifacts") for part in p.parts):
            reason = "Temporary Playwright artifact; original preserved. Final per-test evidence included."
        if reason:
            excluded.append({"path": str(p.relative_to(root)), "bytes": p.stat().st_size, "sha256": sha(p), "reason": reason})
        else:
            included.append(p)
notes = folders[1] / "EXCLUDED_FILES.json"
notes.write_text(json.dumps({"originalsPreserved": True, "files": excluded}, ensure_ascii=False, indent=2) + "\n")
if notes not in included:
    included.append(notes)
manifest_path = folders[1] / "PACKAGE_MANIFEST.json"
included = sorted(p for p in included if p != manifest_path)
manifest = [{"path": str(p.relative_to(root)), "bytes": p.stat().st_size, "sha256": sha(p)} for p in included]
manifest_path.write_text(json.dumps({"files": manifest, "manifestExcludesItself": True}, ensure_ascii=False, indent=2) + "\n")
included.append(manifest_path)
with zipfile.ZipFile(output, "x", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    for p in included:
        archive.write(p, p.relative_to(root))
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
    for entry in manifest:
        assert hashlib.sha256(archive.read(entry["path"])).hexdigest() == entry["sha256"]
for entry in excluded:
    assert sha(root / entry["path"]) == entry["sha256"]
result = {"path": str(output), "bytes": output.stat().st_size, "MiB": round(output.stat().st_size / 1048576, 2), "sha256": sha(output), "includedFiles": len(included), "excludedFiles": len(excluded), "crcAndHashesPassed": True, "excludedOriginalsPreserved": True}
(root / "route-lobby-tap-review.package.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result, indent=2))
