# LACITTA asset provenance

Canonical runtime inventory: game/src/data/assetManifest.ts. Root: game/public/assets/lacitta/.
Reference-only venue photos, map screenshots, social/blog images and platform galleries must never be shipped.
Research references are documented in asset-reference-research.md and lacitta-theater-research.md; they are not shipping licenses.
Generated artwork is pending until its producer records the actual origin and transformations. Do not label pending work accepted without evidence.
Reused assets require a copied license file under assets/lacitta/licenses. Galmuri11 is pinned to upstream commit 71e1cacf1437a11220307120e63e30bc275312d4; copyright Lee Minseo 2019-2025; original license copied unchanged.

Galmuri11 original was 505,400 bytes. The shipped subset is 155,300 bytes, SHA-256 `51a59c70b4b0ac05c6f6a8a53181e0d1b1f2ccd227ebfb829500670a2e2b45e3`.
The license SHA-256 is `86a3ee9495f942f0243f18c103da9faca27adb88142613edb8bb852e56c892c1`.
Subset command (input downloaded from the pinned commit's dist/Galmuri11.woff2):

```sh
uvx --from fonttools --with brotli pyftsubset /tmp/lacitta-Galmuri11-full.woff2 --output-file=game/public/assets/lacitta/fonts/Galmuri11.woff2 --flavor=woff2 --unicodes=U+0000-00FF,U+1100-11FF,U+2000-206F,U+3000-303F,U+3130-318F,U+AC00-D7A3,U+FF00-FFEF --layout-features='*' --name-IDs='*' --name-languages='*'
```

This retains all available Hangul syllables, jamo, Latin and punctuation glyphs in those ranges. Hanja outside these ranges intentionally uses system fallback. Upstream license declares no Reserved Font Name.

## Verification

Final frozen-source measurement: 30 entries; initial preload 1,337,759 bytes; font 155,300 bytes; OG 542,783 bytes; drinks-station 13,600 bytes. Final task19 transcript and exact tested source/asset inventory are in `.omo/evidence/lacitta-asset-production/task-19-final-transcript.log` and `task-19-final-inventory.md`.

Run from game: npm run verify:assets. Requires installed Playwright Chromium (same browser as test:e2e).
Use --base-url http://127.0.0.1:5173 to additionally check live HTTP status and payloads.
Use --manifest /absolute/fixture.json --provenance /absolute/fixture.md --public-root /absolute/public for isolated rejection fixtures.
Use --contract-only while artwork is pending: checks manifest/provenance linkage without claiming ready assets.
Run `node --test scripts/verify-assets.test.mjs` for isolated rejection cases. Run `LACITTA_QA_URL=http://127.0.0.1:5197 node scripts/qa-asset-loading.mjs` for real-browser ready, missing-image, and font-fallback checks.
Strict verification rejects pending/rejected/reference-only provenance, missing licenses/files, wrong dimensions, flat/transparent images, invalid frames and exceeded budgets.
Budget uses on-disk asset bytes before HTTP gzip/brotli, not expanded GPU RGBA memory. All initial images plus font <=2,500,000; non-OG PNG <=512,000; font sum <=500,000; OG <=1,000,000 bytes.

## Machine-readable ledger

Producer handoffs are merged from `.omo/evidence/lacitta-asset-production/artwork-provenance.md`, `character-ui-provenance.md`, and `artwork/drinks-station-production.md`. All 30 inventory entries have accepted provenance. This does not substitute for final responsive visual QA.
Rejected intermediates include the initial generic/blush hall, shaded character backgrounds, opaque checkerboard transparency attempts and unsuccessful background edits. They remain evidence only. Venue reference photos and unverified font/stock candidates are not shipping assets.

Each record has source URL (or original producer evidence location), license, license file path, generated/reused/reference-only mode, transformation notes and rejection status.

```json
[
  {
    "id": "home-background",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/prompts.json",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-c10c1169-a345-4077-bbc3-a3905a0c5fa3.png; nearest-neighbor resize to 360x640; 256-color indexed PNG encoding without dithering; metadata and SHA-256 in .omo/evidence/lacitta-asset-production/artwork/final-metadata.json. ",
    "rejectionStatus": "accepted"
  },
  {
    "id": "car-background",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/prompts.json",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-fe0a95d4-4df3-473d-9c76-7ca5e016c746.png; nearest-neighbor resize to 360x640; 256-color indexed PNG encoding without dithering; metadata and SHA-256 in .omo/evidence/lacitta-asset-production/artwork/final-metadata.json. ",
    "rejectionStatus": "accepted"
  },
  {
    "id": "subway-background",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/prompts.json",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-ef8336ba-0ff9-4775-842d-57d8307774d2.png; nearest-neighbor resize to 360x640; 256-color indexed PNG encoding without dithering; metadata and SHA-256 in .omo/evidence/lacitta-asset-production/artwork/final-metadata.json. ",
    "rejectionStatus": "accepted"
  },
  {
    "id": "lobby-background",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/lobby-layout-prompts.md",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-17d5845b-b38f-4917-ab43-0392984d9c06.png; nearest-neighbor resize to 360x640; 256-color indexed PNG without dithering; 193257 disk bytes. Imagegen edit removes all baked desks/photo tables/drinks and replaces old symmetrical layout with central escalator and lower side doors; live fixtures and people supplied by scene. Source/final hashes: .omo/evidence/lacitta-asset-production/artwork/lobby-layout-metadata.json.",
    "rejectionStatus": "accepted",
    "sha256": "5b54ff149737876b3da66a332de768bf2b6eb397837147af1e99a1bf3c08341f"
  },
  {
    "id": "hall-background",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/separate-room-prompts.md",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-54c7a827-5ab2-4946-a486-b351357e7715.png; nearest-neighbor resize to 360x640; indexed PNG 256 colors without dithering; 203661 disk bytes. Built-in edit removes buffet, photo booth, bar and dining tables; ceremony-only chairs/aisle remain. Metadata: .omo/evidence/lacitta-asset-production/artwork/separate-room-metadata.json.",
    "rejectionStatus": "accepted",
    "sha256": "07a8fb4fa49b69e7795e2fbe089f7693733e45c6f7b5117f82b6b670972bf1d6"
  },
  {
    "id": "ending-background",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/prompts.json",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-676f8f69-55f7-4b16-8950-4ce310c3f11d.png; nearest-neighbor resize to 360x640; 256-color indexed PNG encoding without dithering; metadata and SHA-256 in .omo/evidence/lacitta-asset-production/artwork/final-metadata.json. ",
    "rejectionStatus": "accepted"
  },
  {
    "id": "player-guest",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/character-sources/exec-ac8551c7-019b-4e41-9e8b-c281e88a9831.png",
    "license": "Original AI-generated artwork; no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Edge-connected checkerboard alpha removal, nearest resize, quantize. Producer evidence: .omo/evidence/lacitta-asset-production/character-ui-provenance.md; frame/alpha validation: character-ui-packaging.json. Selected artwork accepted; runtime visual QA is separate.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "npc-bride",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/character-sources/exec-6414c028-5a10-4b25-b657-27c669d55c24.png",
    "license": "Original AI-generated artwork; no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Chroma-key alpha removal, nearest resize, quantize. Producer evidence: .omo/evidence/lacitta-asset-production/character-ui-provenance.md; frame/alpha validation: character-ui-packaging.json. Selected artwork accepted; runtime visual QA is separate.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "npc-groom",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/character-sources/exec-174a379a-797f-4502-bf79-3ee28c511dde.png",
    "license": "Original AI-generated artwork; no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Chroma-key alpha removal, nearest resize, quantize. Producer evidence: .omo/evidence/lacitta-asset-production/character-ui-provenance.md; frame/alpha validation: character-ui-packaging.json. Selected artwork accepted; runtime visual QA is separate.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "npc-reception",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/character-sources/exec-955087fe-035c-4919-95ab-821125cff009.png",
    "license": "Original AI-generated artwork; no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Chroma-key alpha removal, nearest resize, quantize. Producer evidence: .omo/evidence/lacitta-asset-production/character-ui-provenance.md; frame/alpha validation: character-ui-packaging.json. Selected artwork accepted; runtime visual QA is separate.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "npc-guide",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/character-sources/exec-37864d65-029a-4208-9507-9b2a64d545af.png",
    "license": "Original AI-generated artwork; no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Chroma-key alpha removal, nearest resize, quantize. Producer evidence: .omo/evidence/lacitta-asset-production/character-ui-provenance.md; frame/alpha validation: character-ui-packaging.json. Selected artwork accepted; runtime visual QA is separate.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "car-choice",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/prompts.json",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-859b221d-9790-44ec-90b5-f1555f4cd152.png; nearest-neighbor resize to 96x64; generated RGBA alpha preserved; metadata and SHA-256 in .omo/evidence/lacitta-asset-production/artwork/final-metadata.json. ",
    "rejectionStatus": "accepted"
  },
  {
    "id": "subway-choice",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/prompts.json",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-929b55d5-cb57-4d83-9ab8-c706458e1458.png; nearest-neighbor resize to 96x64; generated RGBA alpha preserved; metadata and SHA-256 in .omo/evidence/lacitta-asset-production/artwork/final-metadata.json. ",
    "rejectionStatus": "accepted"
  },
  {
    "id": "shuttle-bus",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/prompts.json",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-2e353284-983d-4f41-8b4b-b7c3775c4b4e.png; nearest-neighbor resize to 128x80; generated RGBA alpha preserved; metadata and SHA-256 in .omo/evidence/lacitta-asset-production/artwork/final-metadata.json. ",
    "rejectionStatus": "accepted"
  },
  {
    "id": "exit-sign",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/prompts.json",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-47259657-305a-447a-90d6-bdb6d2744b47.png; nearest-neighbor resize to 64x64; generated RGBA alpha preserved; metadata and SHA-256 in .omo/evidence/lacitta-asset-production/artwork/final-metadata.json. ",
    "rejectionStatus": "accepted"
  },
  {
    "id": "reception-desk",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/prompts.json",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-7f9ec1f4-ee6c-46ff-8dfd-6b806617014a.png; nearest-neighbor resize to 96x64; generated RGBA alpha preserved; metadata and SHA-256 in .omo/evidence/lacitta-asset-production/artwork/final-metadata.json. ",
    "rejectionStatus": "accepted"
  },
  {
    "id": "photo-table",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/prompts.json",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-b4cd9e09-0caf-4f5a-bcd3-fd5406cc3175.png; nearest-neighbor resize to 112x64; generated RGBA alpha preserved; metadata and SHA-256 in .omo/evidence/lacitta-asset-production/artwork/final-metadata.json. ",
    "rejectionStatus": "accepted"
  },
  {
    "id": "buffet-island",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/prompts.json",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-b6a5e6ec-7f06-498a-9539-834a0e002132.png; nearest-neighbor resize to 128x80; generated RGBA alpha preserved; metadata and SHA-256 in .omo/evidence/lacitta-asset-production/artwork/final-metadata.json. ",
    "rejectionStatus": "accepted"
  },
  {
    "id": "photo-booth",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/prompts.json",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-761ef38d-9c30-49a8-89a4-113306f0383d.png; nearest-neighbor resize to 96x96; generated RGBA alpha preserved; metadata and SHA-256 in .omo/evidence/lacitta-asset-production/artwork/final-metadata.json. ",
    "rejectionStatus": "accepted"
  },
  {
    "id": "dialog-panel",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/package-character-ui.mjs",
    "license": "Original code-native artwork; no third-party art reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "SVG native geometry rasterized to 64x64 PNG. Producer evidence: .omo/evidence/lacitta-asset-production/character-ui-provenance.md; frame/alpha validation: character-ui-packaging.json. Selected artwork accepted; runtime visual QA is separate.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "quiz-frame",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/package-character-ui.mjs",
    "license": "Original code-native artwork; no third-party art reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "SVG native geometry rasterized to 64x64 PNG. Producer evidence: .omo/evidence/lacitta-asset-production/character-ui-provenance.md; frame/alpha validation: character-ui-packaging.json. Selected artwork accepted; runtime visual QA is separate.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "touch-button",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/package-character-ui.mjs",
    "license": "Original code-native artwork; no third-party art reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "SVG native geometry rasterized to 96x32 PNG. Producer evidence: .omo/evidence/lacitta-asset-production/character-ui-provenance.md; frame/alpha validation: character-ui-packaging.json. Selected artwork accepted; runtime visual QA is separate.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "hint-button",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/package-character-ui.mjs",
    "license": "Original code-native artwork; no third-party art reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Original lamp icon rasterized to 32x32 PNG. Producer evidence: .omo/evidence/lacitta-asset-production/character-ui-provenance.md; frame/alpha validation: character-ui-packaging.json. Selected artwork accepted; runtime visual QA is separate.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "arrow-marker",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/package-character-ui.mjs",
    "license": "Original code-native artwork; no third-party art reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Original right-pointing arrow rasterized to 32x32 PNG. Producer evidence: .omo/evidence/lacitta-asset-production/character-ui-provenance.md; frame/alpha validation: character-ui-packaging.json. Selected artwork accepted; runtime visual QA is separate.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "guide-marker",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/package-character-ui.mjs",
    "license": "Original code-native artwork; no third-party art reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Original route diamond rasterized to 32x32 PNG. Producer evidence: .omo/evidence/lacitta-asset-production/character-ui-provenance.md; frame/alpha validation: character-ui-packaging.json. Selected artwork accepted; runtime visual QA is separate.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "loading-accent",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/package-character-ui.mjs",
    "license": "Original code-native artwork; no third-party art reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Original interlocking wedding diamonds rasterized to 64x32 PNG. Producer evidence: .omo/evidence/lacitta-asset-production/character-ui-provenance.md; frame/alpha validation: character-ui-packaging.json. Selected artwork accepted; runtime visual QA is separate.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "route-sign",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/package-character-ui.mjs",
    "license": "Original code-native artwork; no third-party art reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Original directional sign blank rasterized to 64x32 PNG. Producer evidence: .omo/evidence/lacitta-asset-production/character-ui-provenance.md; frame/alpha validation: character-ui-packaging.json. Selected artwork accepted; runtime visual QA is separate.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "og-lacitta-wedding",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/og-korean-refinement.md",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-507d1c05-b572-4cb6-b55e-8d4ac5fc92c2.png; nearest-neighbor resize to 1200x630; 256-color indexed PNG encoding without dithering; metadata and SHA-256 in .omo/evidence/lacitta-asset-production/artwork/final-metadata.json. ",
    "rejectionStatus": "accepted",
    "sha256": "1e18dd59da0e7829c119fe25b1c1ba7672e45164a576f39787bce13c41176a07"
  },
  {
    "id": "drinks-station",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/drinks-station-production.md",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Generated source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-bf94ff99-f3f8-4b72-91e9-8b98111eee21.png; nearest-neighbor resize from 1536x1024 to 96x64; generated RGBA alpha preserved; no creative postprocessing. SHA-256 11001eeaed8517ed871d7e5737d347ef789edb696dde91eabe954f15a05d1ee9. Metadata: .omo/evidence/lacitta-asset-production/artwork/drinks-station-metadata.json.",
    "rejectionStatus": "accepted",
    "sha256": "11001eeaed8517ed871d7e5737d347ef789edb696dde91eabe954f15a05d1ee9"
  },
  {
    "id": "galmuri11",
    "sourceUrl": "https://github.com/quiple/galmuri/tree/71e1cacf1437a11220307120e63e30bc275312d4",
    "license": "SIL-OFL-1.1",
    "licenseFile": "game/public/assets/lacitta/licenses/Galmuri-OFL.txt",
    "mode": "reused",
    "transformationNotes": "Subset retains Latin, Hangul syllables/jamo and punctuation. No reserved font name declared in upstream license.",
    "rejectionStatus": "accepted"
  },
  {
    "id": "banquet-background",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/separate-room-prompts.md",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-6edb6313-7323-437d-a5f9-566c956849dd.png; nearest-neighbor resize to 360x640; indexed PNG 256 colors without dithering; 184598 disk bytes. Separate banquet room; additional imagegen spacing edit recorded in artwork/banquet-spacing-prompt.md clears live fixtures and queue area. Metadata: .omo/evidence/lacitta-asset-production/artwork/separate-room-metadata.json.",
    "rejectionStatus": "accepted",
    "sha256": "227044c5955040e77b50b18357136adf83185728f5b1bd75ef799e2ea010ba82"
  },
  {
    "id": "photo-room-background",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/separate-room-prompts.md",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-aeff1ea5-d4a8-43b7-a29e-32b5f45ecdd3.png; nearest-neighbor resize to 360x640; indexed PNG 256 colors without dithering; 164962 disk bytes. Original dedicated room, no people or baked live fixtures. Metadata: .omo/evidence/lacitta-asset-production/artwork/separate-room-metadata.json.",
    "rejectionStatus": "accepted",
    "sha256": "5901ba24e9ecbea19ad53771eafa896175a6c4899c841475b24c45a619b0cdcb"
  },
  {
    "id": "bridal-room-background",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/separate-room-prompts.md",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-f9b9ae9d-e546-412b-b72d-96365d88183e.png; nearest-neighbor resize to 360x640; indexed PNG 256 colors without dithering; 159952 disk bytes. Original dedicated room, no people or baked live fixtures. Metadata: .omo/evidence/lacitta-asset-production/artwork/separate-room-metadata.json.",
    "rejectionStatus": "accepted",
    "sha256": "3ef5b0969acafa41fd91767d58ebe1bd84a256137788c1029bbd4c1b9b0013d6"
  },
  {
    "id": "waiting-room-background",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/lobby-layout-prompts.md",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-bb35b1b5-0e3f-4573-822c-d3ee2874da5e.png; nearest-neighbor resize to 360x640; 256-color indexed PNG without dithering; 182357 disk bytes. Original dedicated guest waiting lounge with sofas and clear central floor; no bride or people. Source/final hashes: .omo/evidence/lacitta-asset-production/artwork/lobby-layout-metadata.json.",
    "rejectionStatus": "accepted",
    "sha256": "d8054aa3cbf879f59941b1eb14d99b39e8e375d6a6b7fc98ab37f6781dcd1e9e"
  },
  {
    "id": "greenery-corridor-background",
    "sourceUrl": ".omo/evidence/lacitta-asset-production/artwork/corridor-prompt.md",
    "license": "Original AI-generated artwork (built-in OpenAI image_gen); no third-party source pixels reused",
    "licenseFile": null,
    "mode": "generated",
    "transformationNotes": "Source /Users/user/.codex/generated_images/01a07c0d-3e58-7180-8d26-09f8da483bf6/exec-fbf322f3-36a6-406e-b913-cd56ef96096e.png; nearest-neighbor resize to 360x640; indexed PNG 256 colors without dithering; 164839 disk bytes. Left lush greenery/right full-height glass, no people, text, camera marker or photography set. Metadata: .omo/evidence/lacitta-asset-production/artwork/corridor-metadata.json.",
    "rejectionStatus": "accepted",
    "sha256": "7c88a0c62b23485ff5214b28502cdd5e1178d28f00c2dc82ca481ed501ae631c"
  }
]
```
