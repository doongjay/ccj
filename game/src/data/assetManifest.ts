import type { SceneKey } from "../state/gameState";

export const ASSET_ROOT = "/assets/lacitta/";
export const ASSET_BUDGETS = { preload: 2_500_000, png: 512_000, fonts: 500_000, share: 1_000_000 } as const;
export const CHARACTER_DIRECTIONS = ["down", "left", "right", "up"] as const;
export type CharacterDirection = (typeof CHARACTER_DIRECTIONS)[number];
type Consumer = SceneKey | "Player" | "Npc" | "QuizModal" | "ArrowGuide" | "sceneUi" | "index.html";
type BaseAsset = Readonly<{
  key: string;
  url: `/assets/lacitta/${string}`;
  width: number;
  height: number;
  byteLimit: number;
  preloadGroup: "initial" | "share";
  provenanceId: string;
  sceneConsumers: readonly Consumer[];
}>;
export type ImageAsset = BaseAsset & Readonly<{ kind: "image"; alpha: "opaque" | "mixed" }>;
export type CharacterAsset = BaseAsset & Readonly<{
  kind: "spritesheet"; alpha: "mixed"; frameWidth: 32; frameHeight: 48;
  columns: 4; rows: typeof CHARACTER_DIRECTIONS; margin: 0; spacing: 0; runtimeScale: 2;
}>;
export type FontAsset = BaseAsset & Readonly<{ kind: "font"; family: "Galmuri11" }>;
export type AssetEntry = ImageAsset | CharacterAsset | FontAsset;

function image<const K extends string>(key: K, category: "routes" | "venue" | "ui" | "share", width: number, height: number, sceneConsumers: readonly Consumer[], alpha: ImageAsset["alpha"] = "mixed") {
  return { key, url: `${ASSET_ROOT}${category}/${key}.png`, kind: "image", width, height, alpha,
    byteLimit: category === "share" ? ASSET_BUDGETS.share : ASSET_BUDGETS.png,
    preloadGroup: category === "share" ? "share" : "initial", provenanceId: key, sceneConsumers } as const satisfies ImageAsset;
}
function character<const K extends string>(key: K, sceneConsumers: readonly Consumer[]) {
  return { key, url: `${ASSET_ROOT}characters/${key}.png`, kind: "spritesheet", width: 128, height: 192,
    frameWidth: 32, frameHeight: 48, columns: 4, rows: CHARACTER_DIRECTIONS, margin: 0, spacing: 0,
    runtimeScale: 2, alpha: "mixed", byteLimit: ASSET_BUDGETS.png, preloadGroup: "initial",
    provenanceId: key, sceneConsumers } as const satisfies CharacterAsset;
}

export const ASSET_MANIFEST = [
  image("home-background", "routes", 360, 640, ["HomeSelectScene"], "opaque"),
  image("car-background", "routes", 360, 640, ["CarRouteScene"], "opaque"),
  image("subway-background", "routes", 360, 640, ["SubwayRouteScene"], "opaque"),
  image("lobby-background", "venue", 360, 640, ["VenueLobbyScene"], "opaque"),
  image("hall-background", "venue", 360, 640, ["VenueHallScene"], "opaque"),
  image("banquet-background", "venue", 360, 640, ["BanquetScene"], "opaque"),
  image("photo-room-background", "venue", 360, 640, ["PhotoBoothScene"], "opaque"),
  image("bridal-room-background", "venue", 360, 640, ["BridalRoomScene"], "opaque"),
  image("waiting-room-background", "venue", 360, 640, ["WaitingRoomScene"], "opaque"),
  image("greenery-corridor-background", "venue", 360, 640, ["GreeneryCorridorScene"], "opaque"),
  image("ending-background", "venue", 360, 640, ["IntroScene", "EndingScene"], "opaque"),
  character("player-guest", ["Player"]),
  character("npc-bride", ["Npc", "BridalRoomScene", "EndingScene"]),
  character("npc-groom", ["Npc", "EndingScene"]),
  character("npc-reception", ["Npc", "VenueLobbyScene"]),
  character("npc-guide", ["Npc", "VenueHallScene"]),
  image("car-choice", "routes", 96, 64, ["HomeSelectScene"]),
  image("subway-choice", "routes", 96, 64, ["HomeSelectScene"]),
  image("shuttle-bus", "routes", 128, 80, ["SubwayRouteScene"]),
  image("exit-sign", "routes", 64, 64, ["SubwayRouteScene"]),
  image("reception-desk", "venue", 96, 64, ["VenueLobbyScene"]),
  image("photo-table", "venue", 112, 64, ["VenueLobbyScene"]),
  image("buffet-island", "venue", 128, 80, ["BanquetScene"]),
  image("drinks-station", "venue", 96, 64, ["BanquetScene", "VenueLobbyScene"]),
  image("photo-booth", "venue", 96, 96, ["PhotoBoothScene", "EndingScene"]),
  image("dialog-panel", "ui", 64, 64, ["sceneUi"]),
  image("quiz-frame", "ui", 64, 64, ["QuizModal"]),
  image("touch-button", "ui", 96, 32, ["sceneUi", "QuizModal"]),
  image("hint-button", "ui", 32, 32, ["QuizModal"]),
  image("arrow-marker", "ui", 32, 32, ["ArrowGuide"]),
  image("guide-marker", "ui", 32, 32, ["ArrowGuide"]),
  image("loading-accent", "ui", 64, 32, ["BootScene"]),
  image("route-sign", "ui", 64, 32, ["CarRouteScene", "SubwayRouteScene"]),
  image("og-lacitta-wedding", "share", 1200, 630, ["index.html"], "opaque"),
  { key: "galmuri11", url: "/assets/lacitta/fonts/Galmuri11.woff2", kind: "font", family: "Galmuri11",
    width: 0, height: 0, byteLimit: ASSET_BUDGETS.fonts, preloadGroup: "initial", provenanceId: "galmuri11",
    sceneConsumers: ["sceneUi", "Player", "Npc", "BootScene"] },
] as const satisfies readonly AssetEntry[];

export type AssetKey = (typeof ASSET_MANIFEST)[number]["key"];
export type CharacterKey = Extract<(typeof ASSET_MANIFEST)[number], { kind: "spritesheet" }>["key"];
export type ImageKey = Extract<(typeof ASSET_MANIFEST)[number], { kind: "image" }>["key"];
export function characterAnimationKey(key: CharacterKey, direction: CharacterDirection, motion: "idle" | "walk"): string {
  return `${key}-${motion}-${direction}`;
}
