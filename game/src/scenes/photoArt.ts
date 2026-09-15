import type Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";

export const VENUE_PHOTOS = ["hall", "lobby", "shuttle", "garden", "bridal-room", "photo-booth", "banquet", "banquet-corridor"] as const;
const ORIGINAL_ART = { lounge: "waiting-room-background" } as const;
export type VenuePhoto = typeof VENUE_PHOTOS[number] | keyof typeof ORIGINAL_ART;

export function photoArt(scene: Phaser.Scene, photo: VenuePhoto): Phaser.GameObjects.Image {
  const key = photo in ORIGINAL_ART ? ORIGINAL_ART[photo as keyof typeof ORIGINAL_ART] : `venue-${photo}`;
  const image = scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, key).setDepth(-1);
  image.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
  return image;
}
