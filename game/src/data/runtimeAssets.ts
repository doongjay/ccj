import { PHOTO_GALLERIES, type GalleryPhoto } from "./photoGallery";

/** Shared stage registry: consumed by the loader and shipping verifier. No eager preload. */
export type Asset = { key: string; url: string; sheet?: boolean };
export const assets: Record<string, Asset> = {};
function image(key: string, source: string, optimized = true, sheet = false): string {
  assets[key] = { key, url: optimized ? `/assets/optimized/${source.replaceAll("/", "-").replace(/\.png$/, ".webp")}` : `/assets/${source}`, sheet };
  return key;
}
const hall = image("venue-hall", "lacitta/pixel-venue/hall.png");
const couple = image("wedding-couple-sheet", "lacitta/characters/wedding-couple.png");
const hair = image("minimi-hair", "lacitta/characters/minimi-hair.png");
const sixthOutfits = image("sixth-outfits", "lacitta/characters/sixth-outfits.png");
function gallery(photos: readonly GalleryPhoto[]): string[] {
  return photos.map(photo => { assets[photo.texture] = { key: photo.texture, url: photo.src }; return photo.texture; });
}
export const ASSET_STAGES = {
  opening: [hall, couple, image("dialog-panel", "lacitta/ui/dialog-panel.png", false), image("touch-button", "lacitta/ui/touch-button.png", false)],
  setup: [image("home-background", "lacitta/routes/home-ground-v2.png")],
  car: [image("car-background", "lacitta/routes/car-guidance-v2.png"), image("white-car", "lacitta/characters/white-car.png")],
  subway: [image("subway-background", "lacitta/routes/subway-background.png", false), image("venue-shuttle", "lacitta/pixel-venue/shuttle.png")],
  lobby: [image("venue-lobby", "lacitta/pixel-venue/lobby.png"), image("parents", "lacitta/characters/parents.png"),
    image("npc-reception", "lacitta/characters/npc-reception.png", false, true), image("quiz-frame", "lacitta/ui/quiz-frame.png", false)],
  "photo-table-groom": gallery(PHOTO_GALLERIES.groom),
  "photo-table-bride": gallery(PHOTO_GALLERIES.bride),
  reception: [image("reception-family", "lacitta/pixel-venue/reception-family.png")],
  photo: [image("venue-photo-booth", "lacitta/pixel-venue/photo-booth.png")],
  garden: [image("venue-garden", "lacitta/pixel-venue/garden.png")],
  bridal: [image("venue-bridal-room", "optimized/lacitta-pixel-venue-bridal-room-empty-v2.png", false)],
  hall: [hall, couple, image("wedding-group-portrait", "lacitta/pixel-venue/group-photo-portrait-v3.png"), image("formal-guests", "lacitta/characters/formal-guests.png")],
  dinner: [hall, image("venue-banquet", "lacitta/pixel-venue/banquet.png"), image("venue-banquet-corridor", "lacitta/pixel-venue/banquet-corridor.png"),
    image("buffet-left", "lacitta/food/buffet-left.png"), image("buffet-right", "lacitta/food/buffet-right.png")],
  waiting: [image("waiting-room-background", "lacitta/venue/waiting-room-background.png", false)],
  "avatar-male": [hair, sixthOutfits, image("outfits-male", "lacitta/characters/outfits-male.png"), image("extra-outfits-male", "lacitta/characters/extra-outfits-male.png")],
  "avatar-female": [hair, image("sixth-outfits-female", "lacitta/characters/sixth-outfits-female-black.png"), image("gray-tweed", "lacitta/characters/extra-outfits-female-gray.png"), image("outfits-female", "lacitta/characters/outfits-female.png"), image("extra-outfits-female", "lacitta/characters/extra-outfits-female.png")],
} as const;
export type AssetStage = keyof typeof ASSET_STAGES;
