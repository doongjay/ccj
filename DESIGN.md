# Wedding Route Game Design System

## 1. Atmosphere & Identity

A warm, playful wedding invitation journey designed for a phone held upright. The signature is a tiny pixel-style procession: clear, outlined actors and landmark markers remain legible over changing map colors without relying on external art.

## 2. Color

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| Ivory canvas | `--ivory` | `#FFF9EF` | Light map and costume highlight |
| Blush | `--blush` | `#E9A0A7` | Bride marker |
| Greenery | `--greenery` | `#738D5F` | Groom marker and map accents |
| Gold | `--gold` | `#C8A24B` | Reception marker and ceremony detail |
| Coral | `--coral` | `#DB6C63` | Player and primary progress cue; use sparingly |
| Ink outline | `--ink-outline` | `#26332A` | Actor outlines and dark-background contrast |
| Label surface | `--label-surface` | `#1E2920` | Actor label backing |
| Label text | `--label-text` | `#FFFAF2` | Actor label text |

Actor fills always sit inside the 4px ink outline. Labels always use the label-surface and label-text pair, so they stay readable on both light and dark map regions.

## 3. Typography

Use `Galmuri11, system-ui, sans-serif` when the pixel font is available; otherwise use the system fallback. Actor labels are 14px, 700 weight, 16px line height, with zero letter spacing. Labels may use two lines of seven characters, never grow the actor footprint, and truncate after fourteen visible characters.

## 4. Spacing & Layout

The base unit is 4px. Actor geometry is fixed at a 64px wide by 96px tall logical footprint. The body is centered in the lower half, leaving a fixed 112px by 36px label plate above it. Future scene controls must keep a 44px minimum touch target; the game canvas remains portrait-first at 720 by 1280 logical pixels.

## 5. Components

### Actor Marker
- **Structure:** fixed label plate, outline/ring, square pixel body, small face or direction indicator.
- **Variants:** player, bride, groom, reception, guide.
- **Spacing:** 4px outline and 4px internal pixel steps.
- **States:** player idle/moving/facing; NPC default/facing. The label plate has a permanent high-contrast state.
- **Accessibility:** a scene interaction must provide a 44px or larger target; labels are centered, two lines maximum, and high contrast against their backing plate.
- **Motion:** player position changes only through the deterministic movement helper; no decorative idle animation.
- **Layout:** actors occupy stable 64 by 96 logical bounds regardless of label content.

### Scene Composition
- **Structure:** full-canvas color fill with optional horizontal bands, a centered scene header, flat panel geometry, bounded Korean copy, and a labeled touch button.
- **Variants:** ivory or greenery canvas; label-surface or ivory panel; gold primary button.
- **Spacing:** 4px outlines and 24px panel/button inner clearance; controls stay within the 720 by 1280 logical canvas.
- **States:** touch buttons retain a 44px or larger hit area and use greenery on hover/press; panels and headers are static.
- **Accessibility:** Korean copy is wrapped to an explicit character limit and fixed text width so long unspaced text cannot expand over controls. Buttons use high-contrast ink text.
- **Motion:** scene changes use the existing 200 to 300ms opacity-only fade.
- **Layout:** backgrounds cover the scene; header, panel, body copy, and action occupy separate fixed vertical bands to avoid overlap on the portrait canvas.

## 6. Motion & Interaction

Player movement is direct and deterministic at 240 logical pixels per second. Direction changes are instantaneous state feedback. Future scene transitions may use opacity-only fades of 200 to 300ms and must respect reduced-motion settings when the scene layer supports them.

## 7. Depth & Surface

Use flat pixel geometry with a high-contrast outline/ring, not shadows. The ring is a visibility tool rather than elevation; map landmarks and actors are separated by color plus the ink outline.

## 8. Accessibility Constraints & Accepted Debt

Target WCAG 2.2 AA contrast for text-bearing UI. Actor labels use light text on a dark plate, and all scene actions must remain usable without color alone. Pixel-font licensing and final sprite art are deferred until supplied; placeholder geometry is intentional and must remain asset-free until then.

## 9. Mobile Text Rendering

Canvas downscaling uses browser smoothing instead of forced whole-canvas nearest-neighbor scaling. Pixel artwork retains its existing source geometry. Shared scene text and actor labels render at 2x texture resolution; layout coordinates remain unchanged. Primary button labels use 26px text with 30px line height and width-aware wrapping. Scene subtitles and home route captions use 22px text. These are logical game sizes, not viewport-dependent font sizes.
