import type Phaser from "phaser";
import { weddingMonogram } from "./weddingMonogram";

export const GROUP_SCREEN_SOURCE = { x: 232, y: 468, width: 478, height: 270 };

/** Shared lettering for the opening and the group-photo projection screen. */
export function weddingScreen(scene: Phaser.Scene, placement: "opening" | "group-photo"): void {
  const group = placement === "group-photo";
  const source = scene.textures.get("venue-hall").getSourceImage() as HTMLImageElement;
  // The group shot displays this crop at 1:1. Map the opening's lettering into
  // that same screen, keeping its relative position, size and line spacing.
  const x = group ? 360 - GROUP_SCREEN_SOURCE.width / 2 + source.width / 2 - GROUP_SCREEN_SOURCE.x : 360;
  const y = (openingY: number) => group
    ? Math.round(364 - GROUP_SCREEN_SOURCE.height / 2 + openingY * source.height / 1280 - GROUP_SCREEN_SOURCE.y)
    : openingY;
  const size = (openingSize: number) => group ? Math.round(openingSize * source.width / 720) : openingSize;
  weddingMonogram(scene, x, y(455), size(42));
  scene.add.text(Math.round(x), y(510), "WE ARE GETTING MARRIED", {
    fontFamily: "Galmuri11, monospace", fontSize: `${size(16)}px`, color: "#8a6e53", resolution: 3,
  }).setOrigin(0.5).setData("screenBranding", true).setData("screenBrandingCopy", "WE ARE GETTING MARRIED");
}
