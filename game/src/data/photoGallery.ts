import type { ImageKey } from "./assetManifest";

export type GalleryPhoto = Readonly<{ texture: ImageKey; caption: string }>;

export const PHOTO_GALLERY = [
  { texture: "ending-background", caption: "샘플 일러스트 · 웨딩 아치" },
  { texture: "hall-background", caption: "샘플 일러스트 · 라시따시어터" },
] as const satisfies readonly GalleryPhoto[];
