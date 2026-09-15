import { reducedMotion, watchMotion } from "./motionPreference";
import Phaser from "phaser";

export type StoryChoice = Readonly<{ label: string; onSelect: () => void; tried?: boolean }>;
/** Break at a single period after at least five characters, excluding the period. */
function formatStoryCopy(copy: string): string {
  let sentenceStart = 0;
  return copy.replace(/(?<!\.)\.(?!\.)(?:[ \t]+(?=\S)|(?=[가-힣]))/gu, (ending, offset: number) => {
    const sentence = copy.slice(sentenceStart, offset).split(/[!?…\n]/u).at(-1)!.trim();
    sentenceStart = offset + ending.length;
    return Array.from(sentence).length < 5 ? ending : ".\n";
  });
}
type StoryPlacement = "default" | "bottom" | "station" | "photo" | "group-photo" | "car" | "parking" | "ceremony" | "notebook";
export type StoryInfoOptions = Readonly<{
  variant?: "compact" | "tutorial" | "notebook" | "reminder" | "photo-result" | "buffet";
  content?: HTMLElement;
  closeLabel?: string | null;
  choices?: readonly StoryChoice[];
  escapeCloses?: boolean;
  tapToContinue?: boolean;
  dismissOnBackdrop?: boolean;
}>;

export class StoryDialog {
  private readonly scene: Phaser.Scene;
  private readonly element: HTMLDivElement;
  private timer: Phaser.Time.TimerEvent | undefined;
  private holdTimer: Phaser.Time.TimerEvent | undefined;
  private finish: (() => void) | undefined;
  private advance: (() => void) | undefined;
  private complete = false;
  private dismiss: (() => void) | undefined;
  private previousFocus: HTMLElement | undefined;
  private panelObserver: ResizeObserver | undefined;
  private dismissOnBackdrop = false;

  constructor(scene: Phaser.Scene, placement: StoryPlacement = "default") {
    this.scene = scene;
    watchMotion(scene, () => { if (reducedMotion()) this.finish?.(); });
    this.element = document.createElement("div");
    this.element.className = "story-overlay story-tappable";
    this.element.hidden = true;
    this.element.setAttribute("role", "dialog");
    this.element.setAttribute("aria-label", "이야기와 선택지");
    this.element.onclick = event => {
      if (this.element.hidden || (event.target instanceof Element && event.target.closest(".story-choice"))) return;
      if (this.dismissOnBackdrop && event.target === this.element) { this.dismiss?.(); return; }
      if (this.complete) this.advance?.();
      else this.finish?.();
    };
    this.setPlacement(placement);
    document.body.append(this.element);
    this.position();
    window.addEventListener("resize", this.position);
    window.visualViewport?.addEventListener("resize", this.position);
    window.addEventListener("keydown", this.onKeyDown);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  setPlacement(placement: StoryPlacement): void {
    this.element.classList.remove("story-bottom", "story-station", "story-photo", "story-group-photo", "story-notebook", "story-scene-safe", "story-car", "story-parking", "story-ceremony");
    if (placement === "bottom" || placement === "station") this.element.classList.add("story-bottom");
    if (["station", "photo", "notebook"].includes(placement)) this.element.classList.add(`story-${placement}`);
    if (["car", "parking", "ceremony", "group-photo"].includes(placement)) this.element.classList.add("story-scene-safe", `story-${placement}`);
  }

  show(copy: string, choices: readonly StoryChoice[], onFinished?: () => void, onAdvance?: () => void): void {
    this.hide();
    const displayCopy = formatStoryCopy(copy);
    this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    this.element.hidden = false;
    this.advance = onAdvance ? () => { this.hide(); onAdvance(); } : undefined;
    this.scene.game.canvas.dataset.storyState = "typing";
    const panel = document.createElement("button");
    panel.className = "story-narration";
    panel.type = "button";
    panel.setAttribute("aria-label", copy);
    const text = document.createElement("span");
    text.className = "story-copy";
    const reserve = document.createElement("span");
    reserve.className = "story-reserve";
    reserve.setAttribute("aria-hidden", "true");
    reserve.textContent = displayCopy;
    panel.append(reserve, text);
    const options = document.createElement("div");
    options.className = "story-choices";
    // Reserve the final, responsive choice layout before the first typed letter.
    // Pending choices must neither paint nor accept pointer/keyboard input.
    options.style.visibility = "hidden";
    options.inert = true;
    options.setAttribute("aria-hidden", "true");
    const buttons = choices.map(choice => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "story-choice";
      button.textContent = choice.label;
      button.setAttribute("aria-label", choice.label);
      if (choice.tried) {
        button.dataset.tried = "true";
        button.setAttribute("aria-description", "이미 선택한 경로");
      }
      button.disabled = true;
      button.onclick = () => {
        if (button.disabled) return;
        this.hide();
        choice.onSelect();
      };
      options.append(button);
      return button;
    });
    const hint = document.createElement("span");
    hint.className = "story-hint";
    hint.hidden = true;
    panel.append(hint);
    this.element.append(panel, options);
    if (this.element.classList.contains("story-station")) {
      const measure = () => this.element.style.setProperty("--story-narration-height", `${panel.getBoundingClientRect().height}px`);
      measure();
      this.panelObserver = new ResizeObserver(measure);
      this.panelObserver.observe(panel);
    }
    panel.focus({ preventScroll: true });
    this.finish = () => {
      if (this.complete) return;
      this.complete = true;
      this.timer?.remove();
      text.textContent = displayCopy;
      this.scene.game.canvas.dataset.storyState = "choices";
      hint.hidden = true;
      options.style.removeProperty("visibility");
      options.inert = false;
      options.removeAttribute("aria-hidden");
      for (const button of buttons) {
        // A text-reveal tap must not also activate a newly appeared choice.
        this.scene.time.delayedCall(240, () => {
          if (button.isConnected) button.disabled = button.dataset.tried === "true";
        });
      }
      onFinished?.();
    };
    const characters = Array.from(displayCopy);
    let count = 0;
    if (reducedMotion() || characters.length === 0) {
      this.finish();
      return;
    }
    this.timer = this.scene.time.addEvent({ delay: 28, repeat: characters.length - 1, callback: () => {
      text.textContent = characters.slice(0, ++count).join("");
      if (count === characters.length) this.finish?.();
    } });
  }

  hide(): void {
    this.panelObserver?.disconnect();
    this.panelObserver = undefined;
    this.element.style.removeProperty("--story-narration-height");
    this.dismissOnBackdrop = false;
    this.timer?.remove();
    this.holdTimer?.remove();
    this.finish = undefined;
    this.advance = undefined;
    this.dismiss = undefined;
    this.complete = false;
    this.element.classList.remove("story-info", "story-info-compact", "story-info-tutorial", "story-info-notebook", "story-info-reminder", "story-info-photo-result", "story-info-buffet");
    this.element.hidden = true;
    this.element.replaceChildren();
    if (this.previousFocus?.isConnected) this.previousFocus.focus({ preventScroll: true });
    this.previousFocus = undefined;
    this.scene.game.canvas.dataset.storyState = "moving";
  }

  showInfo(copy: string, onClose: () => void, options: StoryInfoOptions = {}): void {
    this.hide();
    this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    this.element.hidden = false;
    this.element.classList.add("story-info", `story-info-${options.variant ?? "compact"}`);
    this.complete = true;
    this.scene.game.canvas.dataset.storyState = "choices";
    // Information is a single panel, not a button containing other buttons.
    const panel = document.createElement("div");
    panel.className = "story-narration";
    panel.setAttribute("aria-label", copy);
    const text = document.createElement("div");
    text.className = "story-copy";
    text.textContent = formatStoryCopy(copy);
    const actions = document.createElement("div");
    actions.className = "info-actions";
    const closeLabel = options.closeLabel ?? "닫기";
    const choices = [...options.choices ?? [], ...(options.tapToContinue || options.closeLabel === null ? [] : [{ label: closeLabel, onSelect: onClose }])];
    for (const [index, choice] of choices.entries()) {
      const button = document.createElement("button");
      button.type = "button";
      const isClose = index === choices.length - 1;
      button.className = `story-choice${isClose ? " info-close" : ""}`;
      button.textContent = isClose && closeLabel === "닫기" && (options.variant ?? "compact") === "compact" ? "닫기 ×" : choice.label;
      button.setAttribute("aria-label", choice.label);
      if (options.variant === "photo-result") button.onkeydown = event => { if (event.repeat) event.preventDefault(); };
      button.onclick = () => { this.hide(); choice.onSelect(); };
      actions.append(button);
    }
    panel.append(text);
    if (options.content) panel.append(options.content);
    if (choices.length) panel.append(actions);
    this.element.append(panel);
    const close = () => { this.hide(); onClose(); };
    this.dismiss = options.escapeCloses === false ? undefined : close;
    this.dismissOnBackdrop = options.dismissOnBackdrop ?? false;
    if (options.tapToContinue) {
      this.advance = close;
      panel.tabIndex = 0;
      panel.setAttribute("role", "button");
      panel.onkeydown = event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        if (!event.repeat) this.advance?.();
      };
      panel.focus({ preventScroll: true });
    } else (actions.querySelector("button") ?? panel.querySelector("button"))?.focus({ preventScroll: true });
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || this.element.hidden || !this.dismiss) return;
    event.preventDefault();
    this.dismiss();
  };

  narrate(copy: string, next: () => void, hold = 3500): void {
    this.show(copy, [], () => {
      this.holdTimer = this.scene.time.delayedCall(hold, () => this.advance?.());
    }, next);
  }

  private readonly position = (): void => {
    const bounds = this.scene.game.canvas.getBoundingClientRect();
    Object.assign(this.element.style, {
      left: `${bounds.left}px`, top: `${bounds.top}px`, width: `${bounds.width}px`, height: `${bounds.height}px`,
      fontSize: `${Math.max(14, bounds.width * 0.041)}px`,
    });
    this.element.style.setProperty("--scene-width", `${bounds.width}px`);
    this.element.style.setProperty("--scene-height", `${bounds.height}px`);
  };

  private destroy(): void {
    this.panelObserver?.disconnect();
    this.timer?.remove();
    this.holdTimer?.remove();
    this.finish = undefined;
    this.advance = undefined;
    window.removeEventListener("resize", this.position);
    window.visualViewport?.removeEventListener("resize", this.position);
    window.removeEventListener("keydown", this.onKeyDown);
    this.element.remove();
  }
}
