from pathlib import Path
import difflib
import hashlib
import json
import shutil
import subprocess

root = Path(__file__).resolve().parents[4]
out = root / "docs/game-review/hall-overlay-refinement"
previous = json.loads((root / "docs/game-review/story-choice-layout-fix/source-fingerprint.json").read_text())
changed = [
    "game/src/style.css",
    "game/src/ui/speechBubble.ts",
    "game/src/scenes/VenueHallScene.ts",
    "game/src/scenes/GreeneryCorridorScene.ts",
    "game/e2e/review-batch-c-ceremony.spec.ts",
    "game/e2e/hall-overlay-layout.spec.ts",
    "game/e2e/hall-greeting-lifecycle.spec.ts",
]
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
previous_changes = [entry["path"] for entry in previous["files"] if digest(root / entry["path"]) != entry["sha256"]]
assert set(previous_changes) == set(changed[:5]), previous_changes
for entry in previous["approvedFaceAndPickerUnchanged"]:
    assert digest(root / entry["path"]) == entry["sha256"]

files = [{"path": name, "sha256": digest(root / name)} for name in sorted({entry["path"] for entry in previous["files"]} | set(changed))]
fingerprint = {
    "HEAD": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip(),
    "dirtyWorkingTree": True,
    "scope": "Previous review's 247 source/config/asset files plus the two new tests; evidence and generated dist excluded.",
    "workingTreeSHA256": hashlib.sha256("\n".join(f'{f["path"]} {f["sha256"]}' for f in files).encode()).hexdigest(),
    "changedSincePreviousReview": previous_changes,
    "approvedFaceAndPickerUnchanged": previous["approvedFaceAndPickerUnchanged"],
    "files": files,
}
(out / "source-fingerprint.json").write_text(json.dumps(fingerprint, indent=2) + "\n")

diff = []
for name in changed:
    before = out / "source-before" / name
    current = root / name
    diff.extend(difflib.unified_diff(before.read_text().splitlines(True) if before.exists() else [],
                                    current.read_text().splitlines(True), fromfile=f"before/{name}", tofile=f"after/{name}"))
    copy = out / "source-after" / name
    copy.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(current, copy)
(out / "this-change.diff").write_text("".join(diff))

reports = {name: json.loads((out / "logs" / f"{name}.json").read_text())["stats"]
           for name in ["before", "after", "after-final", "after-final-02", "regression"]}
assert reports["after-final-02"]["unexpected"] == reports["regression"]["unexpected"] == 0
assets = json.loads((out / "assets-final.json").read_text())
assert not assets["errors"] and assets["exitCode"] == 0
measurements = [json.loads(p.read_text()) for p in sorted((out / "runs/after-final-02").glob("*/geometry.json"))]
(out / "verification.json").write_text(json.dumps({"runs": reports, "finalTestPasses": reports["after-final-02"]["expected"] + reports["regression"]["expected"],
    "assets": {key: assets[key] for key in ["registered", "checked", "decoded", "errors", "exitCode"]}, "measurements": measurements}, indent=2, ensure_ascii=False) + "\n")
(out / "logs/commands.json").write_text(json.dumps({"workdir": str(root / "game"), "commands": [
    {"command": "npm run build", "exitCode": 0, "note": "Includes source and E2E TypeScript checks. Vite retains its existing >500 kB chunk warning; no threshold changed."},
    {"command": "npm run typecheck:e2e", "exitCode": 0, "note": "Rerun after adding the greeting lifecycle test."},
    {"command": "npm run verify:assets -- --report ../docs/game-review/hall-overlay-refinement/assets-final.json", "exitCode": 0,
     "nativeScriptOutput": "assets-final.json", "execution": "Standalone command, explicit game workdir; no shell redirection or command chaining."},
    *[{"command": f"npm run test:e2e -- --config=../docs/game-review/hall-overlay-refinement/scripts/{name}.config.ts", "exitCode": 1 if stats["unexpected"] else 0,
       "individualResults": f"logs/{name}.json"} for name, stats in reports.items()],
]}, indent=2, ensure_ascii=False) + "\n")
print(json.dumps({"finalPasses": reports["after-final-02"]["expected"] + reports["regression"]["expected"], "filesChanged": changed,
    "sourceFingerprint": fingerprint["workingTreeSHA256"]}, indent=2))
