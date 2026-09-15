"""Create stage-loading variants without modifying the authored masters (requires Pillow)."""
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "game/public/assets"
OUTPUT = ASSETS / "optimized"
OUTPUT.mkdir(exist_ok=True)
CATALOG = json.loads((ROOT / "game/src/data/shippingAssets.json").read_text())
SOURCES = [entry for entry in CATALOG["assets"] if entry.get("derivation") == "lossless-webp"]
records = []
for entry in SOURCES:
    relative = entry["source"]
    original = ROOT / relative
    target = ROOT / "game/public" / entry["url"].lstrip("/")
    with Image.open(original) as image:
        rgba = image.convert("RGBA")
        rgba.save(target, "WEBP", lossless=True, exact=True, method=6, icc_profile=image.info.get("icc_profile", b""))
        with Image.open(target) as decoded:
            assert decoded.convert("RGBA").tobytes() == rgba.tobytes(), relative
        records.append({"source": str(original.relative_to(ROOT)), "variant": str(target.relative_to(ROOT)),
                        "dimensions": image.size, "sourceBytes": original.stat().st_size,
                        "variantBytes": target.stat().st_size, "decodedPixelsIdentical": True})
    print(target.name, target.stat().st_size, flush=True)

# These are real photographs. The game's gallery displays at most 544×656 world
# units; 1200×1600 retains detail at the required mobile viewports/DPRs. The
# invitation's original full photographs remain untouched.
for index in range(1, 4):
    original = ASSETS / f"invitation/gallery-{index:02}.jpg"
    target = OUTPUT / f"gallery-{index:02}-game.jpg"
    with Image.open(original) as image:
        photo = image.convert("RGB")
        photo.thumbnail((1200, 1600), Image.Resampling.LANCZOS)
        photo.save(target, "JPEG", quality=92, subsampling=0, optimize=True, icc_profile=image.info.get("icc_profile", b""))
        records.append({"source": str(original.relative_to(ROOT)), "variant": str(target.relative_to(ROOT)),
                        "sourceDimensions": image.size, "dimensions": photo.size,
                        "sourceBytes": original.stat().st_size, "variantBytes": target.stat().st_size,
                        "photographic": True, "quality": 92})
    print(target.name, target.stat().st_size, flush=True)

report = ROOT / "docs/game-review/after-batch-d/asset-optimization.json"
report.parent.mkdir(parents=True, exist_ok=True)
report.write_text(json.dumps(records, indent=2) + "\n")
