import { PROGRESSION_FLAGS, type ProgressionState, type GuestSide, type RouteChoice } from "./gameState";
import { OUTFIT_LABELS } from "../data/guestOutfits";

export const CHECKPOINT_KEY = "ccj.wedding.checkpoint.v1";
export const CHECKPOINT_VERSION = 1;
export const PHOTO_COMPOSITION_VERSION = 1;
export type SavedProfile = { gender: "male" | "female"; outfit: number; hair: number; face: number };
export type PhotoMemory = { kind: "booth" | "bridal"; profile: SavedProfile; composition: 1 };
export type ResumePoint = "lobby" | "hall" | "dinner" | "ending";
export type Checkpoint = {
  version: 1; assets: 1; name: string; profile: SavedProfile; side: GuestSide; route: RouteChoice;
  validRoute: "b3" | "tower" | "exit5"; progression: ProgressionState; photos: PhotoMemory[];
  mealOrder: "pending" | "first" | "after"; point: ResumePoint; ending: "pending" | "saved" | "skipped";
};

const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
export function validProfile(value: unknown): value is SavedProfile {
  return object(value) && (value.gender === "male" || value.gender === "female")
    && Number.isInteger(value.outfit) && Number(value.outfit) >= 0 && Number(value.outfit) < OUTFIT_LABELS[value.gender].length
    && Number.isInteger(value.hair) && Number(value.hair) >= 0 && Number(value.hair) < 3
    && Number.isInteger(value.face) && Number(value.face) >= 0 && Number(value.face) < 3;
}

/** Reject incompatible/contradictory records; never coerce a corrupt save into completed tasks. */
export function validCheckpoint(value: unknown): value is Checkpoint {
  if (!object(value) || value.version !== CHECKPOINT_VERSION || value.assets !== PHOTO_COMPOSITION_VERSION
    || typeof value.name !== "string" || !value.name.trim() || value.name.length > 20 || !validProfile(value.profile)
    || !["bride", "groom"].includes(String(value.side)) || !["car", "subway"].includes(String(value.route))
    || !["lobby", "hall", "dinner", "ending"].includes(String(value.point))
    || !["pending", "saved", "skipped"].includes(String(value.ending))
    || !["pending", "first", "after"].includes(String(value.mealOrder)) || !object(value.progression)) return false;
  const p = value.progression;
  if (!Object.values(PROGRESSION_FLAGS).every(flag => typeof p[flag] === "boolean") || !p.routeChosen || !p.routeQuizSolved || !p.guestSideChosen) return false;
  if (value.route === "car" ? !["b3", "tower"].includes(String(value.validRoute)) : value.validRoute !== "exit5") return false;
  if (!Array.isArray(value.photos) || value.photos.length > 2) return false;
  const kinds = new Set<string>();
  for (const photo of value.photos) {
    if (!object(photo) || !["booth", "bridal"].includes(String(photo.kind)) || photo.composition !== PHOTO_COMPOSITION_VERSION
      || !validProfile(photo.profile) || kinds.has(String(photo.kind))) return false;
    kinds.add(String(photo.kind));
  }
  if (Boolean(p.photoBoothVisited) !== kinds.has("booth") || Boolean(p.bridalRoomVisited) !== kinds.has("bridal")
    || (value.side === "groom" && p.bridalRoomVisited)) return false;
  const ready = p.photoBoothVisited && p.photoTableVisited && p.receptionComplete && (value.side !== "bride" || p.bridalRoomVisited);
  if ((p.banquetGuideComplete || value.point === "hall") && !ready) return false;
  if (value.point === "hall" && p.banquetGuideComplete) return false;
  if (value.point === "dinner" && p.mealComplete && !p.banquetGuideComplete) return false;
  if ((p.mealComplete || value.point === "dinner") && value.mealOrder === "pending") return false;
  if (value.mealOrder === "after" && !p.banquetGuideComplete) return false;
  if ((value.point === "ending" || value.ending !== "pending") && (!p.mealComplete || !p.banquetGuideComplete)) return false;
  return true;
}

export function readCheckpoint(storage: Pick<Storage, "getItem">): { value?: Checkpoint; problem?: "unavailable" | "incompatible" } {
  let raw: string | null;
  try { raw = storage.getItem(CHECKPOINT_KEY); } catch { return { problem: "unavailable" }; }
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    return validCheckpoint(value) ? { value } : { problem: "incompatible" };
  } catch { return { problem: "incompatible" }; }
}
