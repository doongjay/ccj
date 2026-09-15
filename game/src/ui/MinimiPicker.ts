import { reducedMotion } from "./motionPreference";
import type Phaser from "phaser";
import { OUTFIT_LABELS } from "../data/guestOutfits";
import { drawMinimi, drawMinimiPart, HAIR_LABELS, FACE_LABELS, type MinimiProfile } from "./minimi";
import { ensureAvatarAssets } from "../systems/stageAssets";

type Part = "face" | "hair" | "outfit";

export class MinimiPicker {
  readonly element = document.createElement("div");
  private gender: "male" | "female" | undefined;
  private outfit = 0;
  private hair = 0;
  private face = 0;
  private readonly choices = document.createElement("div");
  private readonly preview = document.createElement("canvas");
  private readonly scene: Phaser.Scene;
  private readonly onChange: () => void;
  private readonly blinkTimer: number;
  private blinkEnd: number | undefined;
  private loading = false;

  constructor(scene: Phaser.Scene, onChange: () => void, initial?: MinimiProfile) {
    this.scene = scene; this.onChange = onChange;
    this.element.className = "minimi-picker";
    this.preview.className = "minimi-preview";
    this.preview.setAttribute("aria-label", "선택한 미니미 미리보기");
    this.blinkTimer = window.setInterval(() => {
      if (!this.gender || !this.element.isConnected || document.hidden || reducedMotion()) return;
      this.paintPreview(true);
      this.blinkEnd = window.setTimeout(() => this.paintPreview(false), 150);
    }, 3600);
    const genders = document.createElement("div");
    genders.className = "gender-options";
    for (const [value, label] of [["male", "남자"], ["female", "여자"]] as const) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "story-choice";
      button.textContent = label;
      button.setAttribute("aria-pressed", String(initial?.gender === value));
      button.onclick = async () => {
        if (this.loading) return;
        if (this.gender === value) return;
        this.loading = true;
        this.onChange();
        await ensureAvatarAssets(scene, value);
        this.gender = value; this.outfit = 0; this.hair = 0;
        this.loading = false;
        for (const option of genders.querySelectorAll("button")) option.setAttribute("aria-pressed", String(option === button));
        this.renderChoices(); this.onChange();
      };
      genders.append(button);
    }
    this.element.append(genders, this.choices);
    if (initial) {
      this.gender = initial.gender; this.outfit = initial.outfit; this.hair = initial.hair;
      this.face = initial.face === 1 || initial.face === 2 ? initial.face : 0;
      this.renderChoices();
    }
  }

  get value(): MinimiProfile | undefined {
    return this.gender === undefined || this.loading ? undefined : { gender: this.gender, outfit: this.outfit, hair: this.hair, face: this.face };
  }

  get isLoading(): boolean { return this.loading; }

  private renderChoices(): void {
    this.choices.replaceChildren();
    if (!this.gender) return;
    this.element.dataset.gender = this.gender;
    this.choices.className = "minimi-customizer";
    const stage = document.createElement("div");
    stage.className = "minimi-preview-stage";
    const figure = document.createElement("div");
    figure.className = "minimi-preview-figure";
    figure.append(this.preview);
    stage.append(figure);
    this.paintPreview(false);
    const options = document.createElement("div");
    options.className = "minimi-parts";
    for (const [part, title, labels] of [
      ["face", "얼굴", FACE_LABELS],
      ["hair", "헤어", HAIR_LABELS[this.gender]],
      ["outfit", "의상", OUTFIT_LABELS[this.gender]],
    ] as const) options.append(this.partControl(part, title, labels));
    this.choices.append(stage, options);
  }

  private partControl(part: Part, title: string, labels: readonly string[]): HTMLElement {
    const row = document.createElement("div");
    row.className = "minimi-part-row";
    row.dataset.part = part;
    const controls = document.createElement("div");
    controls.className = "minimi-part-options";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", `${title} 선택`);
    for (const [index, name] of labels.entries()) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `minimi-part-option ${part}-card`;
      button.dataset.index = String(index);
      button.setAttribute("aria-label", name);
      button.title = name;
      button.setAttribute("aria-pressed", String(this[part] === index));
      const portrait = document.createElement("canvas");
      portrait.setAttribute("aria-hidden", "true");
      drawMinimiPart(this.scene, portrait, { ...this.value!, [part]: index }, part);
      button.append(portrait);
      button.onclick = () => {
        this[part] = index;
        window.clearTimeout(this.blinkEnd);
        for (const option of controls.querySelectorAll("button")) option.setAttribute("aria-pressed", String(option === button));
        this.paintPreview(false); this.onChange();
      };
      controls.append(button);
    }
    row.append(controls);
    if (labels.length > 3) {
      const pages = Math.ceil(labels.length / 3);
      let start = Math.floor(this[part] / 3) * 3;
      const navigation = document.createElement("div");
      navigation.className = "minimi-outfit-navigation";
      const status = document.createElement("span");
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      const paintWindow = () => {
        for (const [index, option] of [...controls.children].entries()) (option as HTMLElement).hidden = index < start || index >= start + 3;
        status.textContent = `${start + 1}–${start + 3} / ${labels.length}`;
      };
      const arrow = (direction: -1 | 1) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "minimi-outfit-arrow";
        button.dataset.direction = direction === -1 ? "previous" : "next";
        button.setAttribute("aria-label", `${direction === -1 ? "이전" : "다음"} 의상 보기`);
        // Integer-pixel silhouette, with the same sky/pink palette as the cards.
        button.innerHTML = `<svg viewBox="0 0 12 12" width="24" height="24" aria-hidden="true" shape-rendering="crispEdges"><path class="arrow-outline" d="M10 0H12V12H10V11H8V10H6V9H4V8H2V7H0V5H2V4H4V3H6V2H8V1H10Z"/><path class="arrow-fill" d="M11 2H10V3H8V4H6V5H4V7H6V8H8V9H10V10H11Z"/></svg>`;
        button.onclick = () => {
          start = ((start / 3 + direction + pages) % pages) * 3;
          paintWindow();
        };
        return button;
      };
      navigation.append(arrow(-1), status, arrow(1));
      row.append(navigation);
      paintWindow();
    }
    return row;
  }

  private paintPreview(blinking: boolean): void {
    if (this.value) drawMinimi(this.scene, this.preview, this.value, blinking ? "down-blink" : "down");
  }

  destroy(): void {
    window.clearInterval(this.blinkTimer);
    window.clearTimeout(this.blinkEnd);
  }
}
