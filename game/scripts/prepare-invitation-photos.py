"""1920px invitation display copies. Originals and photo-table files are never changed."""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
GAME = ROOT / "game"
PUBLIC = GAME / "public"
DATA = GAME / "src/data"
REPORT = ROOT / "docs/game-review/invitation-photo-loading"
source = json.loads((DATA / "invitationSource.json").read_text())
files = ["intro.jpg", "calendar.jpg", "timer.jpg"] + [item["localFile"] for item in source["galleryFiles"]]
catalog = json.loads((DATA / "shippingAssets.json").read_text())
records = []
display = {}
origin_id = "invitation-display-photos-20260916"
for file in files:
    original = PUBLIC / "assets/invitation" / file
    relative = f"assets/invitation/display/{Path(file).with_suffix('.webp')}"
    target = PUBLIC / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    original_hash = sha256(original.read_bytes()).hexdigest()
    with Image.open(original) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        source_size = image.size
        image.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=92, method=6, icc_profile=opened.info.get("icc_profile", b""))
        width, height = image.size
    assert sha256(original.read_bytes()).hexdigest() == original_hash
    display[file] = {"url": f"/{relative}", "width": width, "height": height}
    record = {"original": str(original.relative_to(ROOT)), "display": str(target.relative_to(ROOT)),
              "originalSHA256": original_hash, "displaySHA256": sha256(target.read_bytes()).hexdigest(),
              "sourceDimensions": source_size, "displayDimensions": [width, height],
              "originalBytes": original.stat().st_size, "displayBytes": target.stat().st_size}
    records.append(record)
    entry = {"key": f"file:{relative}", "url": f"/{relative}", "kind": "image", "width": width, "height": height,
             "alpha": "opaque", "stages": ["invitation"], "source": record["original"], "contract": "image",
             "byteLimit": 3000000, "budgetClass": "photograph", "provenanceId": origin_id, "runtimeKey": None,
             "sourceSHA256": original_hash, "sha256": record["displaySHA256"], "derivation": "photograph-webp-1920-q92"}
    catalog["assets"] = [item for item in catalog["assets"] if item["key"] != entry["key"]] + [entry]

provenance = {"id": origin_id, "mode": "provided", "sourceUrl": "User-supplied wedding originals; display quality reference https://www.heumcard.com/cards/now-2026-11-21",
              "license": "User authorized invitation display quality comparable to their original Heumcard invitation on 2026-09-16; original files remain unchanged.",
              "transformationNotes": "EXIF orientation applied, aspect ratio preserved, no upscaling; long edge at most 1920px, WebP quality 92. Embedded ICC profile retained. No retouch, crop, pixel-art or photo-table changes.",
              "rejectionStatus": "accepted", "evidence": ["docs/game-review/invitation-photo-loading/README.md", "docs/game-review/invitation-photo-loading/photo-variants.json"]}
catalog["provenance"] = [item for item in catalog["provenance"] if item["id"] != origin_id] + [provenance]
(DATA / "invitationPhotoDisplay.json").write_text(json.dumps(display, indent=2) + "\n")
(DATA / "shippingAssets.json").write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")
REPORT.mkdir(parents=True, exist_ok=True)
report = {"longEdge": 1920, "webpQuality": 92, "originalBytes": sum(r["originalBytes"] for r in records),
          "displayBytes": sum(r["displayBytes"] for r in records), "files": records}
(REPORT / "photo-variants.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps({k: v for k, v in report.items() if k != "files"}, indent=2))
