import type { WalkPoint } from "../systems/walkPath";

// Feet coordinates on the existing 720×1280 lobby artwork. The inset leaves
// clearance from the left perspective wall and the two entrance glass panels.
// Furniture/escalator approach envelopes remain in LOBBY_OBSTACLES.
export const LOBBY_FLOOR: readonly WalkPoint[] = [
  { x: 112, y: 202 }, { x: 455, y: 182 }, { x: 502, y: 156 },
  { x: 628, y: 156 }, { x: 662, y: 210 }, { x: 662, y: 1116 },
  { x: 458, y: 1116 }, { x: 458, y: 1264 }, { x: 306, y: 1264 },
  { x: 306, y: 1116 }, { x: 68, y: 1116 }, { x: 68, y: 736 },
  { x: 94, y: 672 }, { x: 110, y: 390 },
];
export const GUEST_GROUND_OFFSET_Y = 48;
