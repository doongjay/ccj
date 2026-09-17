import type { ImageKey } from "./assetManifest";
import type { VenuePhoto } from "../scenes/photoArt";
import type { GuestSide } from "../state/gameState";

export type GalleryPhoto = Readonly<{ texture: ImageKey | `venue-${VenuePhoto}` | `wedding-photo-${GuestSide}-${number}`; src: string }>;

export const PHOTO_GALLERIES = {
  groom: [
    { texture: "wedding-photo-groom-1", src: "/assets/photo-table/groom-01-v2.jpeg" },
    { texture: "wedding-photo-groom-2", src: "/assets/photo-table/groom-02.jpeg" },
    { texture: "wedding-photo-groom-3", src: "/assets/photo-table/groom-03.jpeg" },
  ],
  bride: [
    { texture: "wedding-photo-bride-1", src: "/assets/photo-table/bride-01.jpeg" },
    { texture: "wedding-photo-bride-2", src: "/assets/photo-table/bride-02.jpeg" },
    { texture: "wedding-photo-bride-3", src: "/assets/photo-table/bride-03.jpeg" },
  ],
} as const satisfies Record<GuestSide, readonly GalleryPhoto[]>;

export function photosForGuestSide(side: GuestSide | undefined) {
  return PHOTO_GALLERIES[side ?? "groom"];
}
