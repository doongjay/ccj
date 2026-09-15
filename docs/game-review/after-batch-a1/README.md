# Batch A.1 visual refinement — 2026-09-12

Scope: `BATCH_A_1_VISUAL_REFINEMENT.md`, A1-01 through A1-04 only. Original findings in `GAME_REVIEW.md` and `GAME_REVIEW_FINAL.md` remain intact. This record describes refinements to F01/F05 after Batch A.

## Acceptance

- [x] fixed — **A1-01:** The first arrival shows the specified three Korean tutorial lines and one `확인` action. `수첩 0/3` or `수첩 0/4` remains visible above the panel. At 393×852, the panel occupies less than half the lobby height and area. The notebook reveals every side-specific requirement before the player attempts the hall.
- [x] fixed — **A1-02:** Checklist hearts and progress remain. Each activity includes its facility's position in the lobby. The existing notebook was already informational; it remains non-navigational for both remaining and completed activities. There is no notebook teleport or new quest marker. The player closes it and uses the normal lobby facilities.
- [x] fixed — **A1-03:** The hall reminder shows the remaining count and a compact checklist, with exactly `수첩 보기` and `돌아가기` side by side. It uses the same requirement data as the notebook. At 393×852 it occupies less than half the lobby height and area. The previous hall-menu shortcuts have been removed.
- [x] fixed — **A1-04:** ATM, welcome drink and bridal restriction each render as one pixel panel with a compact bottom-right `닫기 ×`. Each close target measured 81.25×45.39 CSS px at 430×932. The existing gold 3px keyboard focus outline is visible; both click and Escape dismiss, background taps do not move the player, and normal floor movement resumes after closing. The text remains at its existing mobile font size. All acceptance criteria passed visual inspection and browser checks.

## AFTER screenshots

Captured from Chromium while playing the normal routes; no scene jumps, injected progression flags, or shortened gameplay timers were used for these captures. Each image was opened and visually inspected, and compared with the corresponding original Batch A image.

| State | Viewport | AFTER image |
| --- | --- | --- |
| First lobby arrival | 393×852 | [a1-first-lobby-arrival-393x852.png](a1-first-lobby-arrival-393x852.png) |
| Notebook before any visit | 393×852 | [a1-notebook-393x852.png](a1-notebook-393x852.png) |
| Hall reminder with all bride-side requirements remaining | 393×852 | [a1-hall-requirements-393x852.png](a1-hall-requirements-393x852.png) |
| ATM, keyboard focus visible | 430×932 | [a1-atm-430x932.png](a1-atm-430x932.png) |
| Welcome drink, keyboard focus visible | 430×932 | [a1-welcome-drink-430x932.png](a1-welcome-drink-430x932.png) |
| Bridal restriction, keyboard focus visible | 430×932 | [a1-bridal-restriction-430x932.png](a1-bridal-restriction-430x932.png) |
| Notebook after completing the photo booth | 393×852 | [a1-notebook-completed-393x852.png](a1-notebook-completed-393x852.png) |

The original `docs/game-review/after-batch-a/` images and README were not overwritten; SHA-256 comparisons against the pre-A1 files confirm they are unchanged.

## Exact files changed in A1

Application code:

- `game/src/scenes/VenueLobbyScene.ts` — compact arrival, shared notebook/remaining requirements, location hints, two-action hall reminder, normal facility exploration.
- `game/src/ui/StoryDialog.ts` — shared information-panel variants with actions inside a non-button panel, explicit close labels, preserved Escape and focus restoration.
- `game/src/style.css` — styles scoped to information panels: reserve the notebook header, compact internal actions, side-by-side reminder actions, visible labeled close.

Tests:

- `game/e2e/review-batch-a1.spec.ts` — new A1 acceptance, screenshot, panel-coverage, keyboard, touch-size, input-blocking, progression and error checks.
- `game/e2e/story-helpers.ts` — dismiss the compact arrival using `확인`.
- `game/e2e/review-batch-a.spec.ts` — retain F03/F04/F06 checks, adapt F01 to the refined flow, save rerun screenshots to test results so original Batch A evidence stays intact.
- `game/e2e/current-journey.spec.ts` — use normal facility visits after the two-action hall reminder.
- `game/e2e/lobby-required.spec.ts` — check remaining checklist and unlock conditions without hall-menu shortcuts.
- `game/e2e/lobby-return.spec.ts` — verify normal gallery and room return positions after dismissing the hall reminder.
- `game/e2e/smoke.spec.ts` — enter the bridal corridor through its lobby facility after the reminder.

Evidence: this `docs/game-review/after-batch-a1/README.md` and the seven PNG files listed above. All other pre-existing working-tree changes belong to earlier work.

## Verification

`npm run build` passed TypeScript, E2E type checking and the Vite production build. The existing large-chunk warning remains outside A1 scope.

Browser regression command, run from `game/`:

```sh
npm run test:e2e -- e2e/review-batch-a1.spec.ts e2e/review-batch-a.spec.ts e2e/current-journey.spec.ts e2e/lobby-info.spec.ts e2e/lobby-required.spec.ts e2e/lobby-return.spec.ts e2e/smoke.spec.ts e2e/story-choice-width.spec.ts --workers=2
```

Result: **all 17 scenarios passed across the suite and the targeted correction run**. The main run passed 16/17; A1-04's final movement assertion required an exact logical coordinate even though the browser click was rounded by about 1.2 logical pixels. Its UI, close, focus, sizing and blocking assertions already passed. The assertion now allows less than 3 logical pixels of click-coordinate rounding and still requires the player to reach the target and stop in the lobby. No game movement or rendering code changed for this correction.

The corrected A1-04 test passed on its targeted rerun (1/1, 13.4 seconds). `npm run typecheck:e2e` passed after the final test edit. `git diff --check` passed.

```sh
npm run test:e2e -- e2e/review-batch-a1.spec.ts --grep A1-04 --workers=1 --reporter=list,json --output=/private/tmp/ccj-a1-recheck-results
```

Checks by issue:

| Issue | Executed checks |
| --- | --- |
| A1-01 | Normal car/bride arrival; exact tutorial copy; unobscured progress header; panel height and area each below 50% of the canvas; full notebook opened before hall attempt; confirmation dismisses. |
| A1-02 | Groom 3-item and bride 4-item itineraries with locations; clicking notebook content leaves scene, player position and progress unchanged; completed heart and 1/4 progress after the photo booth; normal photo table, reception and bridal corridor visits reach 4/4. |
| A1-03 | Hall attempts with 4, 3, 2 and 1 remaining activities; only the two named actions; notebook and reminder share requirements; no completed activities in the remaining list; reminder below 50% canvas coverage; normal facility return positions; hall unlocks after all required visits. |
| A1-04 | All three panels opened through actual lobby hotspots; labeled close inside the frame; measured target size; Tab/Shift+Tab focus and gold outline; Escape and button click; blocked background movement; restored floor movement; screenshots with keyboard focus visible. |
| F03 preservation | Empty/whitespace name and missing gender in setup, invitation name/message validation, accessible error/focus state, no native `invalid` event. |
| F04 preservation | Car routes and ceremony subjects unobscured at 320/393/430 widths; applause and cheer choices; double-click produces one ceremony transition. |
| F06 preservation | Displayed labels at least 14 CSS px, touch targets at least 44×44 CSS px, avatar controls and lobby labels fit, landscape notice opens the invitation. |

No console errors, page exceptions or failed requests were recorded in the A1 and Batch A review checks. Both groom/bride journeys, car/subway routes including wrong answers, reception, gallery, photo booth, bridal corridor/photo, meal-before-ceremony and ceremony-before-meal, applause/cheer, group photo, ending message save/skip and replay were exercised.

Viewport coverage: 320×568, 320×852, 390×844, 393×852 (DPR 1 and a DPR 3 lobby run), 430×932, 1440×900 and 852×393 landscape. The page-title smoke check also ran at the default 1280×720 desktop viewport. The six requested A1 states and the completed notebook were visually inspected; F03 validation, F04 car/ceremony composition, and F06 lobby/landscape screenshots were also opened for regression verification.

## Preserved and deferred

F03 inline validation and accessibility, F04 car/ceremony composition, and F06 mobile sizing and landscape alternative retain their existing implementation. Their dedicated source files are byte-identical to the pre-A1 snapshot. Shared `StoryDialog.ts` and CSS changes are limited to information-panel rendering; ordinary narration and scene-choice rendering are unchanged.

Lobby art, sprites, movement/pathfinding, progression flag definitions and required visits are preserved. No new game system, particles, animation, screen shake, gradient, shadow or pixel scaling was introduced.

Batch B/C/D and F24/F25 were not implemented. No P2/P3 polish work was started.
