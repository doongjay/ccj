# BATCH_B_IMPLEMENTATION

Batch A.1 is visually approved. Do not rework it.

This batch removes the remaining **functional friction** that can make a wedding guest feel stuck, misled, or trapped in the game.

Implement **F02, F07, F08, F09, F10 only**.

Do not start Batch C/D/F24/F25.

---

# Preserve exactly

Do not redesign or regress:

- F03 inline validation and accessible focus treatment.
- F04 car/ceremony composition and safe areas.
- F05/A1-04 explicit panel close behavior.
- F01/A1 lobby tutorial, notebook progress, and compact hall reminder.
- F06 mobile readability and landscape fallback.
- Existing wedding/pixel art direction, backgrounds, minimi appearance, color system, route logic, meal-order logic, and invitation content.

If a shared helper must change, visually re-check all affected existing states.

---

# F02 — Constrain lobby movement to the actual floor

**Priority:** P1

## Problem

The lobby currently accepts some taps on architectural surfaces such as the left wall and can place the avatar there. The scene art communicates solid walls/furniture but movement treats too much of the image as walkable.

## Change

1. Define a real walkable floor region that follows the visible lobby architecture.
2. Keep existing obstacle/pathfinding behavior around the escalator and furniture.
3. Use the character's **feet/ground anchor** for validity and clearance, not only the sprite center.
4. Invalid taps must never leave the avatar on a wall, escalator, furniture, glass boundary, or outside the visible floor.
5. For invalid taps, either:
   - project to the nearest valid floor point, or
   - reject the tap with a tiny, restrained visual cue.
6. Preserve all required facility approach points and return/spawn positions.
7. Do not redesign the whole movement system if a bounded region/polygon + existing obstacles is enough.

## Acceptance

- Re-test the previously reproduced left-wall point around logical `(30, 250)` and several nearby edge/corner taps.
- Avatar feet never enter non-floor surfaces.
- Escalator traversal still routes around it.
- Photo booth, photo table, reception, ATM, drinks, bridal corridor, hall, and entrance remain reachable.
- Both bride/groom required progressions can be completed normally.
- No new jitter or large detours.

---

# F07 — Turn travel choices into useful arrival guidance

**Priority:** P1

## Goal

The travel sequence should teach a real guest how to arrive, not quiz them on information the game has not shown.

## Car route

Inspect the existing invitation/route copy and preserve the real parking guidance already used by the product.

Before the first color choice, show enough information to understand the venue parking options.

Preferred treatment:
- an in-world/pixel sign or compact note,
- practical label + color,
- do not let the new hint cover the road split that F04 deliberately exposed.

Examples of structure only:
- `지하 B3 · 파란 유도선`
- `타워주차장 · 분홍 유도선`

Use the game's actual route facts rather than inventing new directions.

If yellow is an intentional wrong/funny branch, it may remain selectable, but the player should have already been given enough information not to choose it by accident.

## Subway route

Before the first exit selection, clearly communicate the existing practical shuttle information, including the correct exit.

Keep the wrong-exit vignette if desired.

After a wrong choice:
- give a useful clue,
- visually mark the already-tried wrong option,
- do not make the player repeat an information-free guess.

## Acceptance

- A first-time player can identify a valid route using only information visible **before the first choice**.
- Existing valid car parking branches remain valid.
- Wrong branches still recover correctly.
- Practical arrival facts remain consistent with the invitation.
- Hints do not cover the road split/couple/major scene subject.
- Retry state visibly distinguishes an attempted wrong option.

---

# F08 — Make the invitation reachable without forcing game completion

**Priority:** P1

## Goal

The game is an invitation experience, but the practical invitation must always remain accessible.

## Persistent access

After the player begins the game, provide a discreet, consistent way to reach the invitation from major stages in **no more than two actions**.

Preferred:
- a small pixel `청첩장` action in stable screen chrome,
- visually secondary to the current scene,
- do not add a giant persistent bar.

It must not obscure the couple, route choices, lobby labels, or primary buttons.

Intro's existing skip action may remain.

## Ending

The guestbook/message is optional.

At the ending provide:
- `메시지 남기기`
- `나중에 남기기`

Skipping:
- creates no guestbook entry,
- does not fake a save,
- still reveals invitation/replay choices.

Saving:
- preserves current avatar/side/message behavior.

## Returning from invitation

Preserve the current intentional route:
- if the player opened the invitation mid-game, returning should bring them back to a safe game state or clearly offer return/restart according to the existing architecture.
- do not duplicate progression or replay side effects.

## Acceptance

- Invitation reachable from travel, lobby, ceremony, meal, and ending within two actions.
- Message can be skipped.
- Skip creates no stored message.
- Save still works.
- Mid-game invitation access does not reset progress.
- Existing intro skip and replay flows remain correct.

---

# F09 — Remove the ~56 MB critical startup preload

**Priority:** P1

This is a real performance task, not just a code-organization task.

## Current baseline

The earlier audit measured roughly **56.2 MB** of game assets transferred before gameplay could begin on localhost, excluding development JavaScript.

## Architecture

Split loading by journey stage.

Suggested order:

### Stage 1 — critical opening
Load only what is needed to render and interact with:
- boot/loading UI,
- intro,
- initial setup UI,
- minimum common fonts/UI assets.

Make the opening interactive as soon as this stage finishes.

### Stage 2 — setup warm-up
While the player reads/customizes:
- preload assets needed immediately after setup,
- only common/minimum minimi resources required by the selected configuration.

### Stage 3 — selected travel route
After car/subway choice:
- load/prefetch only that route and near-future shared lobby assets.

### Stage 4 — venue
At/near lobby:
- prefetch required room assets and near-future ceremony assets in sensible groups.

### Stage 5 — late journey
Dinner, late ceremony/group-photo/ending/invitation assets should not be in the critical opening path unless truly necessary.

## Asset optimization

For large raster assets:
- inspect actual rendered dimensions,
- use optimized variants (WebP/AVIF or appropriately sized PNG) where quality is visually equivalent,
- do not destroy the authored pixel aesthetic,
- actual couple photographs must remain photographic.

Avoid generating every possible minimi combination at startup if only the selected combination is needed.

Remove genuinely unused/obsolete preload references only after verifying usage.

## Loading UX

If a later scene needs assets that are not ready:
- show a readable, branded loading state,
- never show missing-texture frames,
- expose a retry path on real load failure.

Do not silently leave a blank screen.

## Required measurements

Measure a **production build** with a cold cache.

Record:

1. bytes transferred before intro becomes interactive,
2. asset request count before intro interactive,
3. total bytes by first lobby arrival for car,
4. total bytes by first lobby arrival for subway,
5. whether any late-scene asset was downloaded before needed,
6. any missing/failed request.

Target:
- **≤5 MB before the opening becomes interactive** if achievable without damaging visual quality.
- If >5 MB remains, document the exact unavoidable files and why.

Do not claim success from localhost timing alone.

## Acceptance

- Critical startup bytes are drastically lower than baseline and measured/documented.
- Unselected route assets are absent from the critical path.
- Food/late ceremony/full invitation gallery assets are absent from the critical path unless technically justified.
- Both routes complete with no missing textures or visible loading flashes.
- Failed later asset load has a usable retry/recovery state.
- Production build passes.

---

# F10 — Complete a keyboard-accessible route through the experience

**Priority:** P1

## Goal

A keyboard or keyboard-like assistive device should be able to complete the game without needing precise canvas pointer input.

Do **not** add WASD merely for convention.

## Required keyboard path

Using Tab / Shift+Tab / Enter / Space / Escape only, verify:

- Intro: start and skip/invitation
- Name entry and gender/setup
- Avatar customization controls
- Guest side
- Travel mode
- Car/subway choices
- Lobby required destinations
- Notebook
- Info panels
- Photo booth action/return
- Photo table/gallery
- Reception
- Bridal corridor where applicable
- Hall entry
- Ceremony reaction
- Group photo progression
- Meal choice
- Ending message save or skip
- Invitation close/back/replay where applicable

## Lobby

For keyboard users, an explicit semantic destination list/menu is acceptable and preferred to trying to emulate free-form floor movement.

It may be visually hidden until keyboard focus or exposed through the notebook/menu, but:
- it must not create a second contradictory progression model,
- it must respect the same required facilities and flags,
- it should not clutter the normal mobile visual design.

## Focus behavior

- visible custom focus state,
- focus moves into newly opened dialogs,
- Escape returns focus sensibly,
- destroyed controls do not swallow focus,
- scene transitions place focus on a meaningful first action,
- no keyboard trap.

## Acceptance

A full bride-side route and a full groom-side route can each reach the invitation/ending using keyboard-only input.

No step requires clicking the canvas.

---

# Cross-batch visual constraints

While implementing B:

- Do not turn practical guidance into large opaque text walls.
- Use the compact layouts established by A1.
- Do not cover scene subjects that F04 deliberately exposed.
- Do not add persistent UI bars that shrink the already-small play area.
- Prefer a small secondary action / pixel plaque / in-world sign.

---

# Required regression matrix

At minimum test:

## Viewports
- 320×568
- 393×852
- 430×932
- 852×393 landscape
- 1440×900 DPR 1

## Journeys
- car + bride side
- subway + groom side
- car wrong branch and recovery
- subway wrong exit and recovery
- meal before ceremony
- ceremony before meal
- applause
- cheer
- invitation opened mid-game
- ending message save
- ending message skip
- replay
- refresh at a stable point (even though resume itself remains Batch D/F18)

## Runtime
- page errors: 0
- console errors: 0
- failed requests: 0 unless deliberately injected for F09 recovery testing

---

# AFTER evidence

Save under:

`docs/game-review/after-batch-b/`

Do not overwrite prior evidence.

Capture at least:

1. `f02-invalid-wall-tap-393.png`
2. `f02-valid-edge-route-393.png`
3. `f07-car-guidance-393.png`
4. `f07-car-wrong-retry-393.png`
5. `f07-subway-guidance-393.png`
6. `f07-subway-wrong-retry-393.png`
7. `f08-invitation-access-lobby-393.png`
8. `f08-ending-skip-message-393.png`
9. `f10-intro-keyboard-focus-desktop.png`
10. `f10-lobby-keyboard-destinations-desktop.png`
11. `f09-opening-loading-state-393.png` if the loading state is visible long enough to capture

Also write:

`docs/game-review/after-batch-b/README.md`

Include:
- exact files changed,
- exact acceptance result for each F-ID,
- performance table for F09,
- E2E/test commands and results,
- browser/runtime errors,
- any compromises or deferred sub-items,
- confirmation that Batch C/D/F24/F25 were not implemented.

---

# Stop condition

After F02/F07/F08/F09/F10 pass and AFTER evidence is captured:

**STOP.**

Do not continue into Batch C.
Do not opportunistically implement P2 polish while touching related files.
