import { CloudSaveError } from "../cloud/client";
import Phaser from "phaser";
import { MinimiPicker } from "./MinimiPicker";

type TextEntryConfig = Readonly<{
  title: string;
  fieldLabel: string;
  submitLabel: string;
  maxLength: number;
  multiline?: boolean;
  note?: string;
  collectGender?: boolean;
  onSkip?: () => void;
  onSubmit: (value: string, gender?: "male" | "female", outfit?: number, hair?: number, face?: number) => void | Promise<void>;
}>;

export class TextEntryDialog {
  private readonly element = document.createElement("div");
  private readonly scene: Phaser.Scene;
  private readonly picker: MinimiPicker | undefined;

  constructor(scene: Phaser.Scene, config: TextEntryConfig) {
    this.scene = scene;
    this.element.className = "story-overlay text-entry-overlay";
    if (config.collectGender) this.element.classList.add("profile-entry");
    const form = document.createElement("form");
    form.noValidate = true;
    form.className = config.collectGender ? "text-entry-form" : "story-narration text-entry-form";
    const title = document.createElement("h2");
    title.textContent = config.title;
    const label = document.createElement("label");
    label.textContent = config.fieldLabel;
    const field = config.multiline ? document.createElement("textarea") : document.createElement("input");
    field.maxLength = config.maxLength;
    field.setAttribute("aria-required", "true");
    field.setAttribute("aria-label", config.fieldLabel);
    if (field instanceof HTMLInputElement) field.autocomplete = "name";
    else field.rows = 5;
    label.append(field);
    const note = document.createElement("p");
    note.textContent = config.note ?? "";
    const error = document.createElement("p");
    error.setAttribute("role", "alert");
    error.setAttribute("aria-live", "polite");
    error.id = "text-entry-error";
    field.setAttribute("aria-describedby", error.id);
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "story-choice";
    submit.textContent = config.submitLabel;
    const panel = config.collectGender ? document.createElement("div") : form;
    if (panel !== form) panel.className = "story-narration text-entry-panel";
    panel.append(title, label, note, error);
    const picker = config.collectGender ? new MinimiPicker(scene, () => { error.textContent = ""; submit.disabled = picker?.isLoading ?? false; }) : undefined;
    this.picker = picker;
    if (picker) panel.insertBefore(picker.element, note);
    if (panel !== form) {
      const actions = document.createElement("div");
      actions.className = "text-entry-actions";
      actions.append(submit);
      form.append(panel, actions);
    } else form.append(submit);
    if (config.onSkip) {
      const skip = document.createElement("button");
      skip.type = "button";
      skip.className = "story-choice message-skip";
      skip.textContent = "나중에 남기기";
      skip.onclick = () => { this.destroy(); config.onSkip?.(); };
      form.append(skip);
    }
    this.element.append(form);
    document.body.append(this.element);
    field.oninput = () => {
      field.removeAttribute("aria-invalid");
      error.textContent = "";
    };
    form.onsubmit = async event => {
      event.preventDefault();
      if (submit.disabled) return;
      const value = field.value.trim();
      if (!value) {
        error.textContent = config.collectGender ? "이름을 알려주세요!" : "축하 메시지를 입력해 주세요.";
        field.setAttribute("aria-invalid", "true");
        field.focus();
        return;
      }
      try {
        const profile = picker?.value;
        if (picker && !profile) {
          error.textContent = "남자 또는 여자을 선택해 주세요.";
          return;
        }
        submit.disabled = true;
        field.readOnly = true;
        submit.textContent = "저장 중…";
        form.setAttribute("aria-busy", "true");
        form.querySelectorAll("button").forEach(button => { button.disabled = true; });
        await config.onSubmit(value, profile?.gender, profile?.outfit, profile?.hair, profile?.face);
        this.destroy();
      } catch (failure) {
        error.textContent = failure instanceof CloudSaveError ? failure.message : "저장하지 못했어요. 다시 시도해 주세요.";
      } finally {
        form.querySelectorAll("button").forEach(button => { button.disabled = false; });
        field.readOnly = false;
        submit.textContent = config.submitLabel;
        form.removeAttribute("aria-busy");
      }
    };
    this.position();
    window.addEventListener("resize", this.position);
    window.visualViewport?.addEventListener("resize", this.position);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    field.focus({ preventScroll: true });
  }

  private readonly position = (): void => {
    const bounds = this.scene.game.canvas.getBoundingClientRect();
    const viewport = window.visualViewport;
    const top = Math.max(bounds.top, viewport?.offsetTop ?? 0);
    const bottom = Math.min(bounds.bottom, (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight));
    Object.assign(this.element.style, {
      left: `${bounds.left}px`, top: `${top}px`, width: `${bounds.width}px`, height: `${Math.max(0, bottom - top)}px`,
      fontSize: `${Math.max(14, bounds.width * 0.041)}px`,
    });
    this.element.style.setProperty("--scene-width", `${bounds.width}px`);
    this.element.style.setProperty("--scene-height", `${bounds.height}px`);
  };

  destroy(): void {
    this.picker?.destroy();
    window.removeEventListener("resize", this.position);
    window.visualViewport?.removeEventListener("resize", this.position);
    this.element.remove();
  }
}
