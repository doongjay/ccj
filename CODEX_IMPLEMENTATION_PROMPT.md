# CODEX IMPLEMENTATION PROMPT

Read `GAME_REVIEW_FINAL.md` completely before changing any code.

You are now implementing the review, not re-auditing the game.

## First pass scope

Implement **Batch A only**:

1. F03 — remove native browser validation UI
2. F04 — recompose large overlays so important scene subjects remain visible
3. F05 — make close/continue behavior explicit and consistent
4. F01 — teach lobby controls + expose required itinerary + visible progress
5. F06 — improve mobile text/touch readability

Do not implement later batches yet.

## Rules

- Preserve the existing pixel-wedding art direction.
- Preserve the existing backgrounds unless a finding explicitly requests otherwise.
- Preserve the current cream / gold / dark-green UI language.
- Do not introduce generic modern web styling.
- Do not add new game systems.
- Make the smallest coherent implementation that satisfies each acceptance criterion.
- Reuse common UI helpers instead of adding one-off fixes where a shared component is appropriate.
- Do not remove keyboard focus indicators; restyle them.
- Do not hide required tasks in order to simplify the interface.

## Visual verification

Run the game and verify each change in a real browser.

Capture AFTER screenshots for at least:

- avatar validation error
- first lobby arrival
- notebook/progress
- hall requirement state
- car route choice
- ceremony applause/cheer choice
- 320×568 lobby
- 393×852 lobby
- 430×932 lobby

Compare against the screenshots in `docs/game-review/`.

## Required output

At the end:

### Completed
List F-IDs and exact files changed.

### Acceptance checks
For every F-ID, state whether every acceptance criterion passed.

### Screenshots
List the paths to AFTER screenshots.

### Regressions checked
List routes and viewport sizes tested.

### Deferred
Explicitly confirm that Batch B/C/D and F24/F25 were not implemented.

Do not mark an issue complete solely because the code compiles.
The rendered result must be visually checked.
