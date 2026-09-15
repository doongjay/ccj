import type Phaser from "phaser";
import { CHECKPOINT_KEY, readCheckpoint, validCheckpoint, type Checkpoint, type ResumePoint } from "./checkpointData";
import { GAME_STATE_REGISTRY_KEYS as keys, readWeddingGameState, readGuestName, readGuestGender, readGuestOutfit, readGuestHair, readGuestFace, resetWeddingGameState, SCENE_KEYS } from "./gameState";
import { photoMemories, restorePhotoMemories, resetSessionMemories } from "../ui/sessionMemories";
import { sceneFeedback } from "../ui/SceneFeedback";

export const CHECKPOINT_REGISTRY = { route: "wedding.validRoute", meal: "wedding.mealOrder", ending: "wedding.endingDisposition" } as const;
const warned = new WeakSet<Phaser.Game>();
export function loadCheckpoint(): ReturnType<typeof readCheckpoint> {
  try { return readCheckpoint(window.localStorage); } catch { return { problem: "unavailable" }; }
}

/** Only call at an activity boundary; a suspended scene/timer is deliberately not a resume point. */
export function saveCheckpoint(scene: Phaser.Scene, point: ResumePoint): void {
  const state = readWeddingGameState(scene.registry);
  const candidate = {
    version: 1, assets: 1, name: readGuestName(scene.registry),
    profile: { gender: readGuestGender(scene.registry), outfit: readGuestOutfit(scene.registry), hair: readGuestHair(scene.registry), face: readGuestFace(scene.registry) },
    side: state.guestSide, route: state.routeChoice, validRoute: scene.registry.get(CHECKPOINT_REGISTRY.route),
    progression: state.progression, photos: photoMemories(scene.game), point,
    mealOrder: scene.registry.get(CHECKPOINT_REGISTRY.meal) ?? "pending",
    ending: scene.registry.get(CHECKPOINT_REGISTRY.ending) ?? "pending",
  };
  // Incomplete initial profiles and isolated QA scenes are not meaningful resumable visits.
  if (!validCheckpoint(candidate)) return;
  try {
    const json = JSON.stringify(candidate);
    localStorage.setItem(CHECKPOINT_KEY, json);
    scene.game.canvas.dataset.checkpointBytes = String(new TextEncoder().encode(json).length);
    scene.game.canvas.dataset.checkpointStatus = "saved";
  } catch {
    scene.game.canvas.dataset.checkpointStatus = "unavailable";
    if (!warned.has(scene.game)) {
      warned.add(scene.game);
      const clear = sceneFeedback(scene, "이어하기 저장이 어려워요. 지금 게임은 계속할 수 있어요.", 1150, "checkpoint-notice");
      scene.time.delayedCall(4500, clear);
    }
  }
}

export function applyCheckpoint(scene: Phaser.Scene, saved: Checkpoint): typeof SCENE_KEYS.VenueLobby | typeof SCENE_KEYS.VenueHall | typeof SCENE_KEYS.DinnerJourney | typeof SCENE_KEYS.Ending {
  resetWeddingGameState(scene.registry);
  scene.registry.set(keys.guestName, saved.name);
  for (const [part, key] of [["gender", keys.guestGender], ["outfit", keys.guestOutfit], ["hair", keys.guestHair], ["face", keys.guestFace]] as const) scene.registry.set(key, saved.profile[part]);
  scene.registry.set(keys.guestSide, saved.side); scene.registry.set(keys.routeChoice, saved.route);
  scene.registry.set(keys.progression, { ...saved.progression }); scene.registry.set(keys.lobbyIntroShown, true);
  scene.registry.set(CHECKPOINT_REGISTRY.route, saved.validRoute); scene.registry.set(CHECKPOINT_REGISTRY.meal, saved.mealOrder); scene.registry.set(CHECKPOINT_REGISTRY.ending, saved.ending);
  restorePhotoMemories(scene.game, saved.photos);
  Object.assign(scene.game.canvas.dataset, { guestName: saved.name, guestGender: saved.profile.gender, guestOutfit: String(saved.profile.outfit), guestHair: String(saved.profile.hair), guestFace: String(saved.profile.face), guestSide: saved.side, routeChoice: saved.route });
  for (const [flag, complete] of Object.entries(saved.progression)) scene.game.canvas.dataset[flag] = String(complete);
  return { lobby: SCENE_KEYS.VenueLobby, hall: SCENE_KEYS.VenueHall, dinner: SCENE_KEYS.DinnerJourney, ending: SCENE_KEYS.Ending }[saved.point];
}

export function restartVisit(scene: Phaser.Scene): void {
  try { localStorage.removeItem(CHECKPOINT_KEY); } catch { /* This browser denies storage; the live visit can still restart. */ }
  resetWeddingGameState(scene.registry); resetSessionMemories(scene.game);
  for (const key of Object.values(CHECKPOINT_REGISTRY)) scene.registry.set(key, undefined);
  warned.delete(scene.game);
}
