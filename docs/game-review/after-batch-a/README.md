# Batch A implementation and visual checks

2026-09-12. Specification: [GAME_REVIEW_FINAL.md](../../../GAME_REVIEW_FINAL.md).
Original audit findings and screenshots have been retained. Only F03, F04, F05, F01 and F06 were implemented.

## Acceptance checks

| Finding | Checks | Result |
| --- | --- | --- |
| F03 | Empty/whitespace name, missing gender, empty ending message, and empty invitation name/message use inline feedback. No native `invalid` event in setup/invitation. Errors use `aria-live`, invalid fields are identified and focused, and gold/pink focus styling remains visible. A valid profile/message still submits. | Passed; rendered avatar error inspected. |
| F04 | Car choices use a compact three-column footer; narration is above the building name. Ceremony narration is at the top and both reactions form a two-column footer. At 320/393/430 widths, rendered controls do not intersect the road junction or couple; buttons are at least 44×44 CSS px and type is at least 14 CSS px. | Passed; all six car/ceremony captures compared with the original audit. |
| F05 | Information panels, including the notebook, ATM, drinks, bridal restriction and hall requirements, have `닫기` and Escape. Background taps keep the panel open and cannot move the player. Typing and timed sequences display their tap/automatic-progress rule. Choice buttons remain explicit and briefly reject taps while first appearing. The gallery retains ×, arrows and Escape. | Passed; dismiss/reopen, blocking and single transition checked. Existing narration/visual hold durations are preserved. |
| F01 | First arrival shows movement/facility controls and all three groom-side or four bride-side requirements. The one-time guide does not repeat on room returns. The notebook displays its completion count and filled hearts. Bride-side progress was observed at 0/4, 1/4, 2/4, 3/4 and 4/4; the gallery updates it before closing. The hall lists every remaining activity and can be dismissed/reopened. | Passed; complete bride and groom journeys exercised. |
| F06 | Canvas UI converts a 14 CSS px text minimum and 44 CSS px target minimum into rounded world sizes on resize. Eight lobby labels fit without overlap at 320×568, 393×852, 430×932 and desktop DPR 1. Setup choices retain their sizes and submit remains reachable. Short landscape displays a portrait recommendation and working invitation action. | Passed; measurements and rendered screenshots checked. |

## Implementation files

| File | Purpose / finding |
| --- | --- |
| [TextEntryDialog.ts](../../../game/src/ui/TextEntryDialog.ts) | F03: disable native validation, accessible inline name/message errors. |
| [InvitationView.ts](../../../game/src/ui/InvitationView.ts) | F03: use the same validation behavior in the invitation guestbook. |
| [StoryDialog.ts](../../../game/src/ui/StoryDialog.ts) | F04/F05/F01: explicit safe layouts, close/Escape behavior, visible progression hints and compact notebook layout. |
| [CarRouteScene.ts](../../../game/src/scenes/CarRouteScene.ts) | F04: select the car layout. |
| [VenueHallScene.ts](../../../game/src/scenes/VenueHallScene.ts) | F04: select the ceremony layout. Reaction behavior is unchanged. |
| [waitForTap.ts](../../../game/src/ui/waitForTap.ts) | F05: show the existing timed/tap advancement rule and clean up the hint. |
| [VenueLobbyScene.ts](../../../game/src/scenes/VenueLobbyScene.ts) | F01/F06: complete itinerary, one-time controls guide, live progress, explicit hall requirements, displayed-size facility targets. |
| [gameState.ts](../../../game/src/state/gameState.ts) | F01: remember that the arrival guide was shown during this playthrough; clear it on replay. No persistent checkpoint added. |
| [sceneUi.ts](../../../game/src/ui/sceneUi.ts) | F06: shared displayed-size calculations and resize cleanup for text, buttons and facility hit areas. |
| [PixelPanel.ts](../../../game/src/ui/PixelPanel.ts) | F06: resize the existing frame together with its hit area. |
| [lobbyArt.ts](../../../game/src/scenes/lobbyArt.ts) | F06: retain dark labels, space the two lower-right labels apart, and enlarge facility hit areas. |
| [PortraitNotice.ts](../../../game/src/ui/PortraitNotice.ts) | F06: short-landscape orientation notice and invitation action. |
| [style.css](../../../game/src/style.css) | F03/F04/F05/F01/F06: existing cream/gold/dark-green frames, focus/error styles, safe layout rules, progress hints and orientation notice. |

No backgrounds, photographs, sprites, movement paths, effects, audio, wardrobe or meal-order rules were replaced.

## AFTER screenshots and original comparisons

| State | AFTER | Original |
| --- | --- | --- |
| Avatar validation | [393](f03-avatar-validation-393.png) | [Setup](../04-avatar-gender.png) |
| First bride-side lobby arrival | [393](f01-first-lobby-arrival-393.png) | [Lobby arrival](../11-lobby-arrival.png) |
| Notebook and completed photo | [393](f01-notebook-progress-393.png) | [Notebook](../14-memory-book.png) |
| All bride-side hall requirements | [393](f01-hall-requirements-393.png) | [Hall gate](../15-hall-requirements.png) |
| Car choice | [320](f04-car-choice-320.png), [393](f04-car-choice-393.png), [430](f04-car-choice-430.png) | [Car choice](../07-car-route-choice.png) |
| Ceremony applause/cheer choice | [320](f04-ceremony-choice-320.png), [393](f04-ceremony-choice-393.png), [430](f04-ceremony-choice-430.png) | [Ceremony](../28-ceremony-choice.png) |
| Lobby | [320×568](f06-lobby-320x568.png), [393×852](f06-lobby-393x852.png), [430×932](f06-lobby-430x932.png), [1440×900](f06-lobby-1440x900.png) | [320](../60-lobby-320x568.png), [393](../11-lobby-arrival.png), [430](../61-lobby-430x932.png), [desktop](../80-lobby-desktop-dpr1.png) |
| Information close controls | [ATM](f05-atm.png), [drinks](f05-drinks.png), [bridal restriction](f05-bridal-restricted.png) | [ATM](../55-atm-information.png), [drinks](../56-drinks-information.png), [restriction](../57-groom-bridal-restriction.png) |
| Avatar controls | [320](f06-avatar-320.png), [393](f06-avatar-393.png), [430](f06-avatar-430.png) | [Small setup](../48-avatar-320x568.png) |
| Landscape alternative | [852×393](f06-landscape-852x393.png) | [Landscape lobby](../64-lobby-landscape.png) |

Screenshots are viewport captures. The artwork's existing pixel-art/round-pixel/nearest rendering settings are retained. No assets were resampled for this pass.

## Verification

The game ran on local Vite servers in real Playwright Chromium. The Batch A tests use normal menu choices, canvas taps and keyboard dismissal throughout the journey; they do not inject completion flags, teleport scenes or accelerate timers. Read-only scene instrumentation measures displayed target sizes and player positions. Browser page errors, console errors and failed requests are recorded by the Batch A tests and asserted empty.

```sh
cd game
npm run build
npm run test:e2e -- e2e/review-batch-a.spec.ts e2e/current-journey.spec.ts e2e/lobby-info.spec.ts e2e/lobby-required.spec.ts e2e/lobby-return.spec.ts e2e/story-routes.spec.ts e2e/story-choice-width.spec.ts e2e/minimi-customization.spec.ts e2e/tap-pacing.spec.ts e2e/smoke.spec.ts e2e/venue-rooms.spec.ts e2e/reception-only.spec.ts e2e/photo-gallery.spec.ts --workers=2
```

Build passed, including application and E2E TypeScript checks. Vite still warns about the existing large application bundle; preload/bundle optimization is F09 in Batch B.

**Final regression result: 35 passed (8.6 minutes).** Batch A browser checks recorded **0 uncaught page errors, 0 console errors, and 0 failed requests**. `git diff --check` passed.

Routes covered: yellow wrong turn and blue B3 parking; pink tower parking; subway wrong exits and exit 5/shuttle; groom and bride guests; all required room visits; meal before and after the ceremony (no duplicate meal); applause and cheer; group countdown/photo; invalid and valid message submission; invitation opening, photo navigation and replay. Reduced-motion UI was exercised in the existing story and minimi tests; photo-effect consistency remains F17.

Viewports covered: 320×568, 320×852, 390×844, 393×852, 430×932, 720×1280, 1440×900 and 1440×1000, plus the 852×393 landscape alternative. Desktop DPR 1 and mobile Chromium DPR 3 contexts were used.

Test sources added/updated: `review-batch-a.spec.ts`, `story-helpers.ts`, `current-journey.spec.ts`, `lobby-info.spec.ts`, `lobby-required.spec.ts`, `lobby-return.spec.ts`, `story-routes.spec.ts`, `smoke.spec.ts`, `venue-rooms.spec.ts`, `reception-only.spec.ts`. Existing tests were adjusted only for the newly explicit arrival/close/required-visit controls.

## Deferred

Batch B (F02, F07–F10), Batch C (F11–F15), Batch D (F16–F23), and F24/F25 were not implemented. The landscape invitation action belongs specifically to F06 and does not add the persistent game exit or optional ending form from F08. Required tasks remain mandatory. Message skip and refresh/continue remain deferred features, so they are not reported as passing checks. Physical Safari/iOS/Android testing and production cold-cache loading measurements were outside this pass.
