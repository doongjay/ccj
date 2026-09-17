import type Phaser from "phaser";
import { OUTFIT_LABELS } from "../data/guestOutfits";
import { SCENE_KEYS, readGuestGender, readGuestSide, type SceneKey } from "../state/gameState";
import { loadGameFont } from "../ui/assetHelpers";
import { buildWeddingCoupleTextures } from "../ui/weddingCouple";
import { buildFormalGuestTexture, buildMinimiTextures } from "../ui/minimi";

import { assets, ASSET_STAGES, type AssetStage } from "../data/runtimeAssets";
export { ASSET_STAGES, type AssetStage } from "../data/runtimeAssets";
const inFlight = new WeakMap<Phaser.Game, Map<string, Promise<void>>>();
const prepared = new WeakMap<Phaser.Game, Set<AssetStage>>();
const warmFailures = new WeakMap<Phaser.Game, Map<string, unknown>>();

async function loadOne(scene: Phaser.Scene, key: string): Promise<void> {
  if (scene.textures.exists(key)) return;
  let pending = inFlight.get(scene.game);
  if (!pending) { pending = new Map(); inFlight.set(scene.game, pending); }
  if (pending.has(key)) return pending.get(key);
  const asset = assets[key];
  if (!asset) throw new Error(`Unknown asset: ${key}`);
  const task = (async () => {
    const decoded = new Image();
    decoded.src = asset.url;
    try { await decoded.decode(); }
    catch { throw new Error(asset.url); }
    if (!scene.textures.exists(key)) {
      const texture = asset.sheet ? scene.textures.addSpriteSheet(key, decoded, { frameWidth: 32, frameHeight: 48 }) : scene.textures.addImage(key, decoded);
      texture?.setFilter(0); // NEAREST: preserve authored pixels and existing scene transforms.
    }
  })();
  pending.set(key, task);
  try { await task; } finally { pending.delete(key); }
}

export function warmStage(scene: Phaser.Scene, stage: AssetStage): void {
  // Keep a failed speculative request for an explicit foreground retry.
  for (const key of ASSET_STAGES[stage]) void loadOne(scene, key).catch(error => {
    let failures = warmFailures.get(scene.game);
    if (!failures) { failures = new Map(); warmFailures.set(scene.game, failures); }
    failures.set(key, error);
  });
}

function prepare(scene: Phaser.Scene, stage: AssetStage): void {
  if (stage === "opening" && !scene.textures.exists("npc-bride")) buildWeddingCoupleTextures(scene);
  if (stage === "hall") {
    if (!scene.textures.exists("formal-guest-portraits")) buildFormalGuestTexture(scene);
    for (const gender of ["male", "female"] as const) for (let outfit = 0; outfit < OUTFIT_LABELS[gender].length; outfit++) for (let hair = 0; hair < 3; hair++) {
      buildMinimiTextures(scene, { gender, outfit, hair, face: 0 });
    }
  }
}

export async function ensureStages(scene: Phaser.Scene, stages: readonly AssetStage[], boot = false): Promise<void> {
  let ready = prepared.get(scene.game);
  if (!ready) { ready = new Set(); prepared.set(scene.game, ready); }
  if (stages.every(stage => ready.has(stage))) return;
  const keys = [...new Set(stages.flatMap(stage => [...ASSET_STAGES[stage]]))];
  // Warmed stages can enter immediately, without briefly flashing a loading panel.
  if (!stages.includes("opening") && keys.every(key => scene.textures.exists(key))) {
    for (const stage of stages) { prepare(scene, stage); ready.add(stage); }
    return;
  }
  const overlay = document.createElement("div");
  overlay.className = boot ? "stage-loading" : "stage-loading-inline";
  overlay.dataset.loadingPolicy = boot ? "boot" : "background";
  overlay.setAttribute("role", boot ? "dialog" : "region");
  overlay.setAttribute("aria-label", "추억을 준비하는 중");
  const panel = document.createElement("div");
  const title = document.createElement("p");
  title.textContent = "JJ ♥ HS";
  title.hidden = !boot;
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const progress = document.createElement("progress");
  progress.max = keys.length;
  progress.setAttribute("aria-label", "불러오기 진행률");
  const retry = document.createElement("button");
  retry.type = "button";
  retry.textContent = "다시 불러오기";
  retry.hidden = true;
  panel.append(title, status, progress, retry);
  overlay.append(panel);
  const focus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
  const blocked = [...document.querySelectorAll<HTMLElement>(".story-overlay, .game-access, .keyboard-destinations, .canvas-keyboard-button, .portrait-notice, .timed-continue-hint")]
    .map(node => ({ node, inert: node.inert }));
  if (boot) for (const { node } of blocked) node.inert = true;
  // After boot, keep the current scene visible until its destination is ready.
  // Normal loading stays in the background; only a failed request needs retry UI.
  const show = () => { if (!overlay.isConnected) document.body.append(overlay); };
  if (boot) show();
  const dataset = scene.game.canvas.dataset;
  dataset.assetLoadStage = stages.join(",");
  for (;;) {
    retry.hidden = true;
    dataset.assetLoadState = "loading";
    delete dataset.assetLoadError;
    let completed = 0;
    const update = () => { progress.value = completed; dataset.assetLoadProgress = String(completed / keys.length); status.textContent = boot ? `추억을 준비하고 있어요 · ${Math.round(completed / keys.length * 100)}%` : "다시 불러오는 중…"; };
    update();
    const results = await Promise.allSettled(keys.map(async key => { const failure = warmFailures.get(scene.game)?.get(key);
      if (failure && !scene.textures.exists(key)) throw failure;
      await loadOne(scene, key); completed++; update(); }));
    const failures = results.filter(result => result.status === "rejected");
    if (failures.length === 0) {
      if (stages.includes("opening")) await loadGameFont(scene.game.canvas);
      for (const stage of stages) { prepare(scene, stage); ready.add(stage); }
      break;
    }
    dataset.assetLoadState = "error";
    dataset.assetLoadError = failures.map(result => String(result.reason)).join(",");
    status.textContent = "불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요.";
    overlay.dataset.loadingPolicy = "error";
    show();
    retry.hidden = false;
    retry.focus({ preventScroll: true });
    await new Promise<void>(resolve => { retry.onclick = () => { for (const key of keys) warmFailures.get(scene.game)?.delete(key); resolve(); }; });
  }
  dataset.assetLoadState = "complete";
  dataset.assetLoadProgress = "1";
  const restoreFocus = boot || overlay.contains(document.activeElement);
  overlay.remove();
  if (boot) for (const { node, inert } of blocked) node.inert = inert;
  if (restoreFocus && focus?.isConnected && !focus.hidden) focus.focus({ preventScroll: true });
}

export function ensureAvatarAssets(scene: Phaser.Scene, gender: "male" | "female"): Promise<void> {
  return ensureStages(scene, [`avatar-${gender}`]);
}

function sceneStages(scene: Phaser.Scene, target: SceneKey): AssetStage[] {
  const stages: AssetStage[] = [];
  const selected = `avatar-${readGuestGender(scene.registry)}` as const;
  switch (target) {
    case SCENE_KEYS.Intro: stages.push("opening"); break;
    case SCENE_KEYS.HomeSelect: stages.push("setup"); break;
    case SCENE_KEYS.CarRoute: stages.push(selected, "car"); break;
    case SCENE_KEYS.SubwayRoute: stages.push(selected, "subway"); break;
    case SCENE_KEYS.VenueLobby: stages.push(selected, "lobby", `photo-table-${readGuestSide(scene.registry) ?? "groom"}`); break;
    case SCENE_KEYS.Reception: stages.push("reception"); break;
    case SCENE_KEYS.PhotoBooth: stages.push(selected, "photo"); break;
    case SCENE_KEYS.GreeneryCorridor: stages.push(selected, "garden"); break;
    case SCENE_KEYS.BridalRoom: stages.push(selected, "bridal"); break;
    case SCENE_KEYS.VenueHall: stages.push("avatar-male", "avatar-female", "hall"); break;
    case SCENE_KEYS.Banquet: case SCENE_KEYS.DinnerJourney: stages.push(selected, "dinner"); break;
    case SCENE_KEYS.WaitingRoom: stages.push(selected, "waiting"); break;
    case SCENE_KEYS.Ending: stages.push("opening"); break;
    case SCENE_KEYS.Invitation: stages.push("opening", "avatar-male", "avatar-female"); break;
  }
  return stages;
}

export function ensureSceneAssets(scene: Phaser.Scene, target: SceneKey): Promise<void> {
  return ensureStages(scene, sceneStages(scene, target));
}

export function warmSceneAssets(scene: Phaser.Scene, target: SceneKey): void {
  for (const stage of sceneStages(scene, target)) warmStage(scene, stage);
}
