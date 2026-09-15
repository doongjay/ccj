import type Phaser from "phaser";

const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
const listeners = new Set<() => void>();
export const reducedMotion = (): boolean => preference.matches;
export function subscribeMotion(update: () => void): () => void {
  listeners.add(update); update();
  return () => { listeners.delete(update); };
}
const publish = () => {
  document.documentElement.dataset.motionPreference = preference.matches ? "reduce" : "normal";
  for (const update of listeners) update();
};
preference.addEventListener("change", publish);
publish();

/** One browser preference listener; scene/target-owned subscribers cannot accumulate. */
export function watchMotion(scene: Phaser.Scene, update: () => void): () => void {
  const apply = () => { if (reducedMotion()) scene.cameras.main.flashEffect.reset(); update(); };
  listeners.add(apply); apply();
  const stop = () => { listeners.delete(apply); scene.events.off("shutdown", stop); };
  scene.events.once("shutdown", stop);
  return stop;
}

export function photoFlash(scene: Phaser.Scene, duration: number): void {
  if (!reducedMotion()) {
    scene.cameras.main.flash(duration, 255, 255, 255);
    const stop = watchMotion(scene, () => {});
    scene.time.delayedCall(duration, stop);
  }
}
