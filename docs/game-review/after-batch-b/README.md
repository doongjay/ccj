# Batch B implementation and verification

Scope: **F02 / F07 / F08 / F09 / F10 only**, following the complete `BATCH_B_IMPLEMENTATION.md`. Approved Batch A/A.1 behavior and art are preserved. Original review findings remain in place; completion is recorded beside the relevant findings.

## Acceptance results

### F02 — Lobby floor: all criteria passed

- [x] Rejected the reported logical `(30, 250)` wall tap and six additional wall/glass/corner taps: `(45,180)`, `(35,420)`, `(20,1040)`, `(160,1190)`, `(620,1190)`, `(700,1260)`. The avatar remained at its valid starting position.
- [x] Defined the floor in feet coordinates, retaining the existing 48-pixel ground offset and existing furniture/escalator obstacle envelopes. Every sampled movement frame stayed inside the floor polygon.
- [x] Walked from the entrance to `(455,410)`, around the escalator to `(230,1000)`, through the entrance at `(360,1180)`, and back to `(360,1060)`. The concave entrance path cannot cut across the glass. Existing obstacle path tests also passed.
- [x] Normal pointer journeys and facility-return tests reached photo booth, photo table, reception, ATM, drinks, bridal corridor, hall and entrance. Bride/groom progressions completed. No new jitter or large detours were observed. Coordinate assertions allow less than 3 logical pixels for browser click rounding.
- [x] Invalid movement gives only a small, short-lived gold cue; no new movement system or effects were added.

### F07 — Arrival guidance: all criteria passed

- [x] Before the first car choice, visible copy explains the blue line / recommended B3, pink line / tower parking, and yellow line / no parking support.
- [x] Before the first subway choice, visible copy explains Yangjae Citizen’s Forest Station exit 5 and the shuttle starting one hour before the ceremony, every ten minutes.
- [x] Facts were checked against `game/src/data/invitationSource.json`. Both blue and pink parking branches still work. Yellow and wrong-exit branches recover, and the tried option visibly reads `확인함`.
- [x] Road split, car, station exit numbers and ceremony couple remain exposed. Car/ceremony safe-area checks passed at widths 320, 393 and 430. No background was redesigned.

### F08 — Invitation and optional message: all criteria passed

- [x] A secondary `청첩장` button opens the invitation in one activation from travel, lobby, ceremony, meal and ending. It uses free screen margins where available and a small reserved corner otherwise.
- [x] Mid-game access pauses the live scene and its timers, hides/blocks its controls, and restores the same scene and progress with `게임으로 돌아가기` or Escape. Opening from the notebook returns to that same notebook. No replay or progression event is duplicated.
- [x] `나중에 남기기` creates no entry, leaves the saved flag false, and reveals invitation/replay choices. Saving preserves name, side, selected gender/outfit/hair/face and message.
- [x] Intro skip, invitation replay and ending replay work. A stable lobby refresh returns safely to the intro without inventing a saved message; persistent resume remains deferred.

### F09 — Staged loading: all criteria passed

- [x] Production cold-cache response bytes are measured below the 5 MB opening target; see the table and per-request JSON below.
- [x] Startup loads only the hall/couple needed by the intro, two small common UI textures and the font. Setup, selected avatar resources, chosen travel route, lobby/nearby rooms, ceremony/group, food and invitation content load at their respective stages.
- [x] Neither unselected travel assets nor buffet/late group-photo/full invitation-gallery images enter the critical opening path. The unselected route and those late assets are also absent at first lobby arrival in the measured runs.
- [x] Twenty-four full-resolution lossless WebP variants decode to exactly the same RGBA pixels as their originals. Three game-gallery JPEG variants retain photographic rendering at 1044×1600 / 1200×800; full invitation photographs are unchanged. `asset-optimization.json` lists all sources, dimensions, bytes and equality results.
- [x] Minimi parts are prepared for the selected gender and complete pose combinations are generated on demand. The opening builds no minimi combinations. Ceremony guest combinations are prepared only on ceremony entry. Existing art/neck/jaw/transparency/blink tests passed.
- [x] Both full production routes complete without missing textures or missing-frame flashes. Warmed stages enter without a loading-panel flash; uncached stages retain the current scene until assets are ready, with the branded progress panel when loading is required.
- [x] One deliberately aborted later car image produced readable failure copy and a focused `다시 불러오기` button. Enter retried successfully and reached the lobby without resetting progress. No blank/missing-texture scene was shown.
- [x] TypeScript, E2E type checking and the Vite production build passed.

### F10 — Keyboard route: all criteria passed

- [x] Full bride route: keyboard start, typed name, gender, face/hair/outfit customization, car/pink parking, notebook and information panels, photo booth return/revisit/action, gallery navigation/Escape, reception, bridal photo, meal before ceremony, cheer, group photo, saved message and invitation/replay.
- [x] Full groom route: keyboard setup, subway/exit 5, all required lobby visits, ceremony before meal, applause, group photo, meal, skipped message and invitation/replay.
- [x] Tests navigate with actual Tab/Shift+Tab/Enter/Space/Escape and typed text, without programmatic focus or canvas clicks. A document-level pointer-event counter remains zero.
- [x] Canvas actions share their existing callbacks with semantic controls. The lobby destination list appears only while keyboard focus is inside it; the A1 notebook remains informational and the normal pointer exploration loop is unchanged.
- [x] Custom focus is visible, dialogs receive focus, Escape restores it, destroyed/hidden controls stop receiving focus, and scene transitions provide a usable next action. There is no required keyboard trap.

## Production cold-cache measurements

**Method:** `npm run build`, then Vite production preview on `127.0.0.1:5199`; a fresh Chromium context per route, CDP cache disabled, viewport 393×852, DPR 1. Capture immediately after Intro is interactive and immediately at the first lobby-ready state, before the deferred room warm-up. Each recorded response is HTTP 200 and not served from cache. Byte counts use CDP `Network.loadingFinished.encodedDataLength`, including response headers. Total bytes include compressed production JavaScript/CSS and HTML; game-asset bytes are also reported separately to compare with the earlier asset-only audit. No development module traffic is included.

| Milestone | Total response bytes | Game-asset bytes | Game-asset requests |
| --- | ---: | ---: | ---: |
| car — Interactive intro | 3,507,312 | 3,094,744 | 5 |
| car — First lobby arrival | 12,666,892 | 12,254,324 | 18 |
| subway — Interactive intro | 3,507,312 | 3,094,744 | 5 |
| subway — First lobby arrival | 12,380,727 | 11,968,159 | 18 |

**Opening total: 3.507 MB. Opening game assets: 3.095 MB, approximately 94.5% below the earlier 56.2 MB asset baseline.** Both runs have zero pending requests at the two measured milestones. Late/unselected assets and unexpected failed requests: **0**.

The original approximately 56.2 MB baseline was asset-only. Compare it with the opening game-asset column, not the combined HTML/JS/CSS total. This is a transfer measurement from a local production preview, not a claim about real mobile-network latency or physical iOS/Android testing.

- `performance-car.json`, `performance-subway.json`: complete request URLs, types, statuses, cache flags, byte counts and both milestones.
- `load-recovery.json`: the single deliberately injected failed request and successful recovery.
- `asset-optimization.json`: all 27 optimized variants, including pixel equality for the 24 lossless variants.

## Browser and test verification

Run commands from `game/` unless otherwise stated.

```sh
npm run build
npm run test:e2e -- --config=playwright.production.config.ts --reporter=list,json
npm run test:e2e -- e2e/review-batch-a.spec.ts e2e/review-batch-a1.spec.ts e2e/current-journey.spec.ts e2e/review-batch-b-floor.spec.ts e2e/walk-path.spec.ts e2e/story-routes.spec.ts e2e/dinner-pacing.spec.ts e2e/tap-pacing.spec.ts e2e/photo-gallery.spec.ts e2e/minimi-customization.spec.ts e2e/minimi-neck.spec.ts e2e/minimi-jaw.spec.ts e2e/minimi-visual.spec.ts e2e/invitation.spec.ts e2e/wedding-group.spec.ts --workers=2 --reporter=list,json
npm run test:e2e -- e2e/minimi-visual.spec.ts e2e/lobby-info.spec.ts e2e/lobby-required.spec.ts e2e/lobby-return.spec.ts --workers=2 --reporter=list --output=/private/tmp/ccj-batch-b-final-regressions
```

**Final results:** production **8/8 passed** (3.9 minutes, 2026-09-13 UTC), broad browser/art regression **40/40 passed** (4.6 minutes), targeted final lobby/minimi regression **5/5 passed** (1.7 minutes). The final build and E2E type check passed; `git diff --check` passed.

Records: `production-tests.log`, `production-results.json`, `regression-results.json`, `final-regression-results.json`. The broad JSON record omits embedded image data and retains assertion results and artifact references; the selected visual artifacts are copied into this package.

Earlier issue-by-issue runs also passed the F02 floor checks, F07 wrong-route recoveries and F08/F10 journeys. All three existing smoke tests passed, including both wrong-route journeys and replay. The broad regression run above exercises the final application code; the final production run also checks custom hair/outfit selection and retains the updated CSS clearance at 320 px.

During development, two pointer journeys were interrupted by a Vite reload while source was being edited; both passed again after source edits stopped. Isolated scene and exhaustive minimi tests previously assumed every texture was built at boot. Their fixtures now load the specific scene or explicitly prepare audit profiles. An old raw-outfit probe also requested removed, unused frame aliases; it now uses the authored frame bounds and its corrected run has no missing-frame warning. These test changes do not restore eager loading in the product. A 320 px setup/title overlap with the new invitation button was found visually and corrected with reserved top space, without reducing any text or touch targets.

**Runtime:** acceptance tests and full production journeys assert zero page exceptions, console errors, failed requests and missing-texture/frame warnings. The only allowed runtime failure is the one explicitly injected F09 request. The existing Vite bundle-size warning and Node FORCE_COLOR/NO_COLOR runner notices are build/test-runner messages, not browser errors. Sandbox port-binding denial was resolved by running the approved local browser tests outside that restriction.

**Viewport coverage:** 320×568, 393×852, 430×932, 852×393 landscape, 1440×900 DPR 1. Additional gallery/avatar tests cover 320×852, 390×844, 720×1280 and 1440×1000; travel/exit-number tests also run at DPR 3. These are real Chromium renders with viewport emulation, not physical-device Safari tests.

## AFTER screenshots and visual review

The requested images are in this directory. All requested states were opened and visually inspected, not accepted from compilation alone. Arrival/notebook/gate/info-panel captures were compared with the approved A1 images; car/ceremony/mobile/validation captures were compared with the prior A evidence. The original images and evidence were not overwritten.

- [f02-invalid-wall-tap-393.png](f02-invalid-wall-tap-393.png)
- [f02-valid-edge-route-393.png](f02-valid-edge-route-393.png)
- [f07-car-guidance-393.png](f07-car-guidance-393.png)
- [f07-car-wrong-retry-393.png](f07-car-wrong-retry-393.png)
- [f07-subway-guidance-393.png](f07-subway-guidance-393.png)
- [f07-subway-wrong-retry-393.png](f07-subway-wrong-retry-393.png)
- [f08-ending-skip-message-393.png](f08-ending-skip-message-393.png)
- [f08-invitation-access-lobby-393.png](f08-invitation-access-lobby-393.png)
- [f09-later-load-retry-393.png](f09-later-load-retry-393.png)
- [f09-opening-loading-state-393.png](f09-opening-loading-state-393.png)
- [f10-intro-keyboard-focus-desktop.png](f10-intro-keyboard-focus-desktop.png)
- [f10-lobby-keyboard-destinations-desktop.png](f10-lobby-keyboard-destinations-desktop.png)

`regressions/` contains additional A/A1 preservation captures, mobile/desktop lobby sizes, avatar/validation, car/ceremony safe areas, landscape fallback, photo gallery and photo sequences. The 320 px setup screenshot confirms that the new invitation action no longer covers its title. The gallery image remains photographic; source pixel images have no introduced smoothing or fractional scaling changes.

## Exact files changed in Batch B

This list is relative to the working-tree snapshot taken before Batch B, so earlier uncommitted work is excluded. `files-changed.json` is the complete path inventory. No package/dependency file was changed.

| File | Purpose |
| --- | --- |
| `GAME_REVIEW.md` | Mark G02/G03/G06/G07/G08 fixed with evidence links; retain original findings. |
| `GAME_REVIEW_FINAL.md` | Mark F02/F07/F08/F09/F10 fixed with evidence links; retain original findings. |
| `game/e2e/current-journey.spec.ts` | Observe console/request/texture failures during existing complete pointer journeys. |
| `game/e2e/dinner-pacing.spec.ts` | Prepare dinner assets before the existing isolated pacing fixture. |
| `game/e2e/minimi-customization.spec.ts` | Explicit exhaustive avatar-art preparation and optimized source-path expectation. |
| `game/e2e/minimi-jaw.spec.ts` | Explicitly prepare all avatar profiles for the existing jaw/outline assertions. |
| `game/e2e/minimi-neck.spec.ts` | Explicitly prepare all avatar profiles for the existing pose connectivity assertions. |
| `game/e2e/minimi-visual.spec.ts` | Explicit art fixture; source crops use authored bounds; assert no missing-frame warnings. |
| `game/e2e/photo-gallery.spec.ts` | Use the staged scene fixture, registered optimized URLs and unchanged photo replacement behavior. |
| `game/e2e/review-batch-a.spec.ts` | Retain A acceptance checks; assert no new invitation/title overlap and catch texture warnings. |
| `game/e2e/review-batch-a1.spec.ts` | Keep original A1 screenshots immutable on reruns and catch texture warnings. |
| `game/e2e/review-batch-b-access.spec.ts` | F08/F10 full keyboard bride/groom routes, mid-game returns, save/skip/replay/refresh and screenshots. |
| `game/e2e/review-batch-b-floor.spec.ts` | F02 invalid points, complete movement-frame sampling, escalator/entrance boundary checks and screenshots. |
| `game/e2e/review-batch-b-guidance.spec.ts` | F07 pre-choice facts, wrong-choice recovery/tried states and screenshots. |
| `game/e2e/review-batch-b-performance.spec.ts` | F09 production cold-cache transfer, request exclusions, injected failure/retry and screenshots. |
| `game/e2e/smoke.spec.ts` | Match useful revised F07 wrong-car guidance. |
| `game/e2e/stage-fixtures.ts` | Prepare only the assets/profile combinations needed by isolated scene/art tests. |
| `game/e2e/story-routes.spec.ts` | Stage assets for the isolated 320 px station fixture; retain both travel tests. |
| `game/e2e/tap-pacing.spec.ts` | Prepare scene assets before existing isolated tap/timer fixtures. |
| `game/e2e/wedding-group.spec.ts` | Prepare ceremony assets for the isolated group-photo fixture. |
| `game/playwright.production.config.ts` | Run acceptance and transfer checks against the actual production preview. |
| `game/scripts/optimize-stage-assets.py` | Reproducible lossless pixel variants and photographic game-gallery variants, with pixel-equality report. |
| `game/src/data/lobbyFloor.ts` | F02: authored floor polygon in feet coordinates and ground offset. |
| `game/src/data/photoGallery.ts` | F09 register three optimized game-gallery photo variants; captions retained. |
| `game/src/invitation.css` | F09 reference the pixel-identical lossless group-background variant. |
| `game/src/objects/Player.ts` | F09 ensure selected avatar texture and eliminate obsolete placeholder preload dependency. |
| `game/src/scenes/BootScene.ts` | F09 opening-only boot and staged direct invitation entry. |
| `game/src/scenes/CarRouteScene.ts` | F07 parking facts and tried-state feedback; F09 chosen-route/lobby warm-up. |
| `game/src/scenes/EndingScene.ts` | F08 save/skip paths share invitation/replay choices without fake saves. |
| `game/src/scenes/HomeSelectScene.ts` | F09 create the player after avatar selection rather than during empty setup. |
| `game/src/scenes/SubwayRouteScene.ts` | F07 shuttle facts and tried wrong exits; F09 lobby warm-up. |
| `game/src/scenes/VenueLobbyScene.ts` | F02 floor integration; F09 delayed warm-up for nearby required rooms. |
| `game/src/style.css` | Scoped pixel styles for tried choices, invitation access, keyboard focus and loading; 320 px title clearance. |
| `game/src/systems/PhotoGalleryModal.ts` | F10 labeled keyboard gallery controls and focus restoration. |
| `game/src/systems/TapToMove.ts` | F02: floor validity and restrained invalid-tap callback using the ground anchor. |
| `game/src/systems/stageAssets.ts` | F09 stage catalog, deduplicated image decoding, warm-up, loading/retry and delayed texture preparation. |
| `game/src/systems/walkPath.ts` | F02: constrain existing obstacle paths to the floor, including concave boundary crossings. |
| `game/src/ui/GameAccess.ts` | F08 secondary invitation control, live scene pause/return, Escape and replay. |
| `game/src/ui/InvitationView.ts` | F08 optional in-game return action; existing invitation content retained. |
| `game/src/ui/MinimiPicker.ts` | F09 load the selected gender resources before rendering customization. |
| `game/src/ui/PortraitNotice.ts` | F08 returnable invitation from the unchanged F06 landscape alternative. |
| `game/src/ui/StoryDialog.ts` | F07 shared tried-option semantics while retaining A/A1 dialog behavior. |
| `game/src/ui/TextEntryDialog.ts` | F08 optional message skip; F10 initial field focus; F09 avatar-loading submit gate. |
| `game/src/ui/keyboardAccess.ts` | F10 semantic canvas counterparts and focus-only lobby destination list. |
| `game/src/ui/minimi.ts` | F09 cache shared parts and draw only requested avatar combinations, retaining art math and frame API. |
| `game/src/ui/sceneUi.ts` | Shared F08 access, F09 asset gate and F10 action counterparts. |
| `game/src/ui/waitForTap.ts` | F10 semantic continue action sharing the original tap/timer behavior. |
| `game/tsconfig.e2e.json` | Include both development and production Playwright configs in type checking. |

New optimized assets (original files remain untouched; exact dimensions and byte comparisons are in `asset-optimization.json`):

- `game/public/assets/optimized/gallery-01-game.jpg`
- `game/public/assets/optimized/gallery-02-game.jpg`
- `game/public/assets/optimized/gallery-03-game.jpg`
- `game/public/assets/optimized/lacitta-characters-extra-outfits-female.webp`
- `game/public/assets/optimized/lacitta-characters-extra-outfits-male.webp`
- `game/public/assets/optimized/lacitta-characters-formal-guests.webp`
- `game/public/assets/optimized/lacitta-characters-minimi-hair.webp`
- `game/public/assets/optimized/lacitta-characters-outfits-female.webp`
- `game/public/assets/optimized/lacitta-characters-outfits-male.webp`
- `game/public/assets/optimized/lacitta-characters-parents.webp`
- `game/public/assets/optimized/lacitta-characters-wedding-couple.webp`
- `game/public/assets/optimized/lacitta-characters-white-car.webp`
- `game/public/assets/optimized/lacitta-food-buffet-left.webp`
- `game/public/assets/optimized/lacitta-food-buffet-right.webp`
- `game/public/assets/optimized/lacitta-pixel-venue-banquet-corridor.webp`
- `game/public/assets/optimized/lacitta-pixel-venue-banquet.webp`
- `game/public/assets/optimized/lacitta-pixel-venue-bridal-room-white.webp`
- `game/public/assets/optimized/lacitta-pixel-venue-garden.webp`
- `game/public/assets/optimized/lacitta-pixel-venue-group-photo-portrait-v3.webp`
- `game/public/assets/optimized/lacitta-pixel-venue-group-photo-stage-v4.webp`
- `game/public/assets/optimized/lacitta-pixel-venue-hall.webp`
- `game/public/assets/optimized/lacitta-pixel-venue-lobby.webp`
- `game/public/assets/optimized/lacitta-pixel-venue-photo-booth.webp`
- `game/public/assets/optimized/lacitta-pixel-venue-reception-family.webp`
- `game/public/assets/optimized/lacitta-pixel-venue-shuttle.webp`
- `game/public/assets/optimized/lacitta-routes-car-guidance-v2.webp`
- `game/public/assets/optimized/lacitta-routes-home-ground-v2.webp`

Evidence: this README, the PNGs listed above and under `regressions/`, production request/recovery JSON, test-result records/log, optimized-asset report, file inventory and `preservation.json`. Build output and temporary Playwright output are generated artifacts; previous A/A1 evidence is unchanged.

## Preserved and deferred

`preservation.json` verifies identical SHA-256 hashes for all **162** pre-existing original asset and Batch A/A1 evidence files. Dedicated lobby art/layout, progression definitions, meal-order logic, original minimi drawing primitives and invitation factual content were not changed.

Shared helpers necessarily gained keyboard counterparts, paused invitation access and loading gates. F03 validation messages/ARIA/focus behavior, F04 composition, A1 close/tutorial/notebook/reminder behavior and F06 font/touch sizes and landscape alternative passed browser and visual regression checks. The only F06-related adjustment reserves space for the new invitation control on the smallest setup view; it does not shrink existing controls.

No new gameplay system, persistent quest marker, background redesign, extra particles, screen shake, gradient, shadow or pixel smoothing was added. Photographic resizing applies only to three game-gallery variants; source photographs and the full invitation gallery remain intact. Lossless full-size venue variants deliberately preserve art quality instead of pursuing smaller lossy backgrounds.

**Batch C, Batch D, F24 and F25 were not implemented.** Resume persistence, ceremony reaction polish and other later-batch work remain deferred. Implementation stops after this verified Batch B package.
