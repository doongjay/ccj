# LACITTA pixel-art style guide

Extends existing DESIGN.md and SCENE_UI_COLORS; preserves their typography and touch targets. See .omo/evidence/lacitta-asset-production/CONTRACT-READY.md for every key/dimension.

## Palette and grid

| Role | Hex |
| --- | --- |
| Ivory highlights | #FFF9EF |
| Blush accents | #E9A0A7 |
| Greenery | #738D5F |
| Gold | #C8A24B |
| Coral cue | #DB6C63 |
| Ink outline | #26332A |
| Label surface | #1E2920 |
| Label text | #FFFAF2 |
| Route blue | #4F86C6 |
| Route pink | #D9689A |
| Route yellow | #E7C94A |
| Glass highlight | #C9E4DE |

Work on a 1x integer source pixel grid. One-to-two source-pixel outlines; scale two means 2-4 logical pixels. Six 360x640 opaque scene backgrounds fill 720x1280. Nearest-neighbor only; no smoothing or blurry resampling. Character sheets 128x192, sixteen 32x48 frames, zero spacing/margin, rows down/left/right/up and columns idle/walk-1/walk-2/walk-3. Scale 2, bottom-center origin, retain 64x96 actor container and separate label plate. Character motion stays within each frame and feet align consistently.

## Depth and typography

Background below landmarks; actors above background; navigation markers above art; actor labels above actors; modal veil, modal panel and live text above gameplay. Do not bake arrows or hit targets into scenery. Keep top header and bottom instructions quiet, and keep destination areas open.
Galmuri11, system-ui, sans-serif is primary. Font loaded before creating scene text; explicit fallback on font failure. Zero letter spacing. Retain existing fixed text bounds and wrapping. LabelText on LabelSurface is the default small-text pair; require contrast >=4.5:1 for normal text. No gold/blush small text on ivory. Use live Korean labels, never generated bitmap text for quiz/hint/route instructions. Short static brand signs may be drawn; all actionable labels remain live text.
Controls keep >=44 logical-pixel hit areas. Preserve question/hint line limits and 390x844 legibility. Panel border inset 8 source pixels; no decorative nested panels. Right-pointing arrow texture at rotation 0, visible outline against light/dark scenery. Icons express mode/command; color always paired with label/shape.

## Scene subjects

| Scene | Required subject and mood |
| --- | --- |
| Boot | Loading accent, progress and observable failure; quiet invitation |
| Intro | Reuse ending background, couple/wedding identity, readable live title |
| Home | Distinct car and subway choices, apartment departure |
| Car | Yangjae IC, High Brand entrance, ramp, B3, tower parking, blue/pink/yellow lanes, A Gate direction |
| Subway | 양재시민의숲역 5번 출구, shuttle bus/stop, 10-minute note, Seocho20/walk alternatives |
| Lobby | Glass, greenery, LACITTA THEATER sign, High Brand 1F, A Gate, two desks, poster/photo table |
| Hall | Grand Ballroom, tall vertical space, chandelier, 450-inch LED, long white aisle, flowers, gold seating; buffet islands/open kitchen, separate 96x64 mixed-alpha drinks-station prop and two static guests forming a modest queue |
| Ending | Couple/stage backdrop and photo booth, generous title space; banquet stays in existing hall |
| Share | 1200x630, couple, aisle/A Gate, floral border, readable wedding title |

## Reference checklist

Use research facts to draw original simplified forms. Do not copy venue photographs, floorplans, gallery pixels, logos or map screenshots. No invented failures, pricing or new gameplay branches. Record actual production steps and source evidence per asset in asset-provenance.md. Verify each source image's dimensions/alpha and source/size budgets, then screenshot mobile states and longest quiz/hints. UI integration ownership remains with the UI worker.
