import type Phaser from "phaser";

/** A single accessible scene notice. Scene timers and invitation pause own its lifetime. */
export function sceneFeedback(scene: Phaser.Scene, copy: string, logicalY: number, className = ""): () => void {
  const element = document.createElement("div");
  element.className = `scene-feedback ${className}`;
  element.setAttribute("role", "status");
  element.textContent = copy;
  const position = () => {
    const bounds = scene.game.canvas.getBoundingClientRect();
    Object.assign(element.style, { left: `${bounds.left + 16}px`, top: `${bounds.top + bounds.height * logicalY / 1280}px`, width: `${bounds.width - 32}px` });
  };
  document.body.append(element); position();
  window.addEventListener("resize", position);
  const remove = () => { element.remove(); window.removeEventListener("resize", position); scene.events.off("shutdown", remove); };
  scene.events.once("shutdown", remove);
  return remove;
}
