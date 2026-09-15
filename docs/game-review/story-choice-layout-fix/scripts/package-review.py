from pathlib import Path
import base64
import difflib
import hashlib
import json
import shutil
import zipfile

root = Path(__file__).resolve().parents[1]
repo = root.parents[2]
archive_path = root.parent / "story-choice-layout-review.zip"
assert not archive_path.exists(), "An existing review ZIP must not be overwritten"
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

reports = {}
for name in ["final-03", "regression-01", "regression-02", "production-01"]:
    report = json.loads((root / "logs" / f"{name}.json").read_text())
    assert report["stats"]["unexpected"] == 0 and report["stats"]["skipped"] == 0, name
    reports[name] = report["stats"]
assets = json.loads((root / "assets-final-02.json").read_text())
assert assets["exitCode"] == 0 and not assets["errors"]

# Refresh copied source evidence after the final test compatibility edits.
for copied in (root / "sources/after/game").rglob("*"):
    if copied.is_file():
        source = repo / copied.relative_to(root / "sources/after")
        shutil.copy2(source, copied)
new_tests = {"game/e2e/story-choice-layout.spec.ts", "game/e2e/hall-go-guidance.spec.ts", "game/e2e/car-guidance-reference.spec.ts"}
patch = []
for current in sorted((root / "sources/after/game").rglob("*")):
    if not current.is_file() or current.suffix not in {".ts", ".css", ".json"}:
        continue
    relative = current.relative_to(root / "sources/after")
    old = root / "before" / relative
    before = old.read_text().splitlines(True) if str(relative) not in new_tests and old.exists() else []
    patch.extend(difflib.unified_diff(before, current.read_text().splitlines(True), fromfile="a/" + str(relative) if before else "/dev/null", tofile="b/" + str(relative)))
(root / "source-diff.patch").write_text("".join(patch))
fingerprint = json.loads((root / "source-fingerprint.json").read_text())
for item in fingerprint["files"]:
    item["sha256"] = sha(repo / item["path"])
fingerprint["workingTreeSHA256"] = hashlib.sha256("\n".join(item["path"] + " " + item["sha256"] for item in fingerprint["files"]).encode()).hexdigest()
for item in fingerprint["approvedFaceAndPickerUnchanged"]:
    assert item["sha256"] == sha(repo / item["path"])
(root / "source-fingerprint.json").write_text(json.dumps(fingerprint, ensure_ascii=False, indent=2) + "\n")
(root / "VERIFICATION.json").write_text(json.dumps({"finalReports": reports, "hallGoTestsFromFinal01": 3, "distinctRelevantTestsPassed": sum(item["expected"] for item in reports.values()) + 3, "fullRepositorySuite": False, "shipping": {key: assets[key] for key in ["registered", "checked", "decoded", "exitCode", "errors"]}, "openingNetworkBytes": 3516691, "faceAndPickerUnchanged": True}, ensure_ascii=False, indent=2) + "\n")

excluded = []
included = []
for path in sorted(root.rglob("*")):
    if not path.is_file() or path.name in {"PACKAGE_MANIFEST.json", "EXCLUDED_FILES.json"}:
        continue
    relative = path.relative_to(root)
    parts = relative.parts
    reason = None
    if parts[0] == "runs" and len(parts) > 2:
        run, case = parts[1:3]
        if run == "after-02":
            reason = "Superseded passing layout run; full JSON retained, final screenshots/videos supplied."
        elif run == "after-01" and case.startswith("story-choice-layout-real"):
            reason = "Duplicate passing scene evidence; final scene evidence supplied. Failure cases remain included."
        elif run == "final-01" and not case.startswith("hall-go-guidance"):
            reason = "Intermediate car composition or duplicate layouts; reporter retained, final-03 replaces these captures."
        elif run == "final-02" and "노란색" not in case:
            reason = "Superseded passing capture; final-03 provided. The failed 320 case remains included."
    if parts[0] in {"final-evidence", "final-02-evidence"}:
        reason = "Intermediate duplicate car screenshots; final-03 evidence supplied."
    if reason:
        excluded.append({"path": str(relative), "bytes": path.stat().st_size, "sha256": sha(path), "reason": reason, "originalPreserved": True})
    else:
        included.append(path)
(root / "EXCLUDED_FILES.json").write_text(json.dumps(excluded, ensure_ascii=False, indent=2) + "\n")
included.append(root / "EXCLUDED_FILES.json")
manifest = [{"path": str(p.relative_to(root)), "bytes": p.stat().st_size, "sha256": sha(p)} for p in included]
(root / "PACKAGE_MANIFEST.json").write_text(json.dumps({"files": manifest, "manifestExcludesItself": True}, ensure_ascii=False, indent=2) + "\n")
included.append(root / "PACKAGE_MANIFEST.json")
with zipfile.ZipFile(archive_path, "x", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    for p in included:
        archive.write(p, Path(root.name) / p.relative_to(root))
with zipfile.ZipFile(archive_path) as archive:
    assert archive.testzip() is None
    for entry in manifest:
        assert hashlib.sha256(archive.read(str(Path(root.name) / entry["path"]))).hexdigest() == entry["sha256"]
for entry in excluded:
    assert sha(root / entry["path"]) == entry["sha256"]
result = {"path": str(archive_path), "bytes": archive_path.stat().st_size, "MiB": round(archive_path.stat().st_size / 1048576, 2), "sha256": sha(archive_path), "files": len(included), "excludedOriginalsPreserved": len(excluded), "crcAndHashesPassed": True}
(root.parent / "story-choice-layout-review.package.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result, indent=2))
