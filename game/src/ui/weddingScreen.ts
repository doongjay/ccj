import type Phaser from "phaser";

/** Shared lettering for the opening and the group-photo projection screen. */
export function weddingScreen(scene: Phaser.Scene, placement: "opening" | "group-photo"): void {
  const group = placement === "group-photo";
  for (const [copy, y, size] of [
    ["JJ ♥ HS", group ? 280 : 455, group ? 32 : 42],
    ["WE ARE GETTING MARRIED", group ? 450 : 510, 16],
  ] as const) {
    scene.add.text(360, y, copy, {
      fontFamily: "Galmuri11, monospace", fontSize: `${size}px`, color: "#8a6e53", resolution: 3,
    }).setOrigin(0.5).setData("screenBranding", true);
  }
}
