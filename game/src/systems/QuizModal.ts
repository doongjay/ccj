import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import type { CorrectQuizOption, QuizData, QuizOption } from "../data/scenario";
import {
  createKoreanText,
  createScenePanel,
  createTouchButton,
  SCENE_UI_COLORS,
  wrapKoreanText,
} from "../ui/sceneUi";

export type QuizModalConfig = Readonly<{
  scene: Phaser.Scene;
  quiz: QuizData;
  onCorrect: (option: CorrectQuizOption) => void;
}>;

const MODAL_DEPTH = 100;
const PANEL_WIDTH = 640;
const PANEL_HEIGHT = 1040;
const OPTION_BUTTON_HEIGHT = 68;
const OPTION_BUTTON_SPACING = 84;

type OptionButton = Readonly<{
  hitArea: Phaser.GameObjects.Rectangle;
  option: QuizOption;
}>;

type StoredEmitterListener = Readonly<{
  fn: (...args: readonly unknown[]) => void;
  context: unknown;
  once: boolean;
}>;

type StoredEmitterListeners = StoredEmitterListener | readonly StoredEmitterListener[];

type SceneInputWithEventStore = Phaser.Input.InputPlugin &
  Readonly<{
    _events: Readonly<Record<string, StoredEmitterListeners | undefined>>;
  }>;

type SuspendedSceneInputListener = StoredEmitterListener &
  Readonly<{
    eventName: string;
  }>;

const SCENE_POINTER_EVENTS = [
  Phaser.Input.Events.POINTER_DOWN,
  Phaser.Input.Events.POINTER_UP,
  Phaser.Input.Events.POINTER_MOVE,
  Phaser.Input.Events.POINTER_WHEEL,
] as const;

// allow: SIZE_OK — Task 12 constrains the reusable Phaser modal to this file.
export class QuizModal {
  private readonly config: QuizModalConfig;
  private readonly renderObjects: Phaser.GameObjects.GameObject[] = [];
  private readonly optionButtons: OptionButton[] = [];
  private readonly suspendedSceneInputListeners: SuspendedSceneInputListener[] = [];
  private reactionText: Phaser.GameObjects.Text | undefined;
  private hintText: Phaser.GameObjects.Text | undefined;
  private keyboardPlugin: Phaser.Input.Keyboard.KeyboardPlugin | undefined;
  private selectedOptionIndex = 0;
  private opened = false;
  private destroyed = false;

  public constructor(config: QuizModalConfig) {
    this.config = config;
    this.config.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  public open(): void {
    if (this.destroyed || this.opened) {
      return;
    }

    this.opened = true;
    this.suspendScenePointerListeners();
    this.renderOverlay();
    this.bindKeyboard();
  }

  public close(): void {
    if (!this.opened) {
      return;
    }

    this.opened = false;
    this.reactionText = undefined;
    this.hintText = undefined;
    this.selectedOptionIndex = 0;
    this.unbindKeyboard();
    this.restoreScenePointerListeners();

    for (const object of this.renderObjects) {
      object.destroy();
    }

    this.renderObjects.length = 0;
    this.optionButtons.length = 0;
  }

  public destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.close();
    this.destroyed = true;
    this.config.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  public isOpen(): boolean {
    return this.opened;
  }

  private renderOverlay(): void {
    const blocker = this.track(
      this.config.scene.add
        .rectangle(
          GAME_WIDTH / 2,
          GAME_HEIGHT / 2,
          GAME_WIDTH,
          GAME_HEIGHT,
          SCENE_UI_COLORS.inkOutline.fill,
          0.45,
        )
        .setDepth(MODAL_DEPTH)
        .setInteractive({ useHandCursor: false }),
    );
    blocker.on(Phaser.Input.Events.POINTER_DOWN, this.stopPointerPropagation, this);
    blocker.on(Phaser.Input.Events.POINTER_UP, this.stopPointerPropagation, this);

    this.track(
      createScenePanel(this.config.scene, {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        surface: "labelSurface",
        border: "ivory",
        texture: "quiz-frame",
        depth: MODAL_DEPTH + 1,
      }),
    );
    this.track(
      createKoreanText(this.config.scene, {
        x: GAME_WIDTH / 2,
        y: 292,
        copy: this.config.quiz.question,
        width: 544,
        maxCharactersPerLine: 16,
        maxLines: 2,
        fontSize: 30,
        lineHeight: 40,
        color: "labelText",
        depth: MODAL_DEPTH + 2,
      }),
    );
    this.reactionText = this.track(
      createKoreanText(this.config.scene, {
        x: GAME_WIDTH / 2,
        y: 470,
        copy: "",
        width: 544,
        maxCharactersPerLine: 24,
        maxLines: 3,
        fontSize: 20,
        lineHeight: 28,
        color: "blush",
        depth: MODAL_DEPTH + 2,
      }),
    );

    const optionStartY = 880 - ((this.config.quiz.options.length - 1) * OPTION_BUTTON_SPACING) / 2;

    for (const [index, option] of this.config.quiz.options.entries()) {
      const button = createTouchButton(this.config.scene, {
        x: GAME_WIDTH / 2,
        y: optionStartY + index * OPTION_BUTTON_SPACING,
        width: 544,
        height: OPTION_BUTTON_HEIGHT,
        label: option.label,
        onPress: () => {
          this.updateKeyboardSelection(index);
          this.handleOption(option);
        },
        depth: MODAL_DEPTH + 3,
      });
      button.hitArea.on(Phaser.Input.Events.POINTER_DOWN, this.stopPointerPropagation, this);
      button.hitArea.on(Phaser.Input.Events.POINTER_UP, this.stopPointerPropagation, this);
      this.optionButtons.push({ hitArea: button.hitArea, option });
      this.track(button.hitArea);
      this.track(button.label);
    }

    this.updateKeyboardSelection(0);
  }

  private suspendScenePointerListeners(): void {
    for (const eventName of SCENE_POINTER_EVENTS) {
      for (const listener of this.storedSceneInputListeners(eventName)) {
        this.suspendedSceneInputListeners.push({ eventName, ...listener });
      }

      this.config.scene.input.removeAllListeners(eventName);
    }
  }

  private restoreScenePointerListeners(): void {
    for (const listener of this.suspendedSceneInputListeners) {
      if (listener.once) {
        this.config.scene.input.once(listener.eventName, listener.fn, listener.context);
      } else {
        this.config.scene.input.on(listener.eventName, listener.fn, listener.context);
      }
    }

    this.suspendedSceneInputListeners.length = 0;
  }

  private storedSceneInputListeners(eventName: string): readonly StoredEmitterListener[] {
    if (!this.hasEventStore(this.config.scene.input)) {
      return [];
    }

    const stored = this.config.scene.input._events[eventName] ?? this.config.scene.input._events[`~${eventName}`];
    if (stored === undefined) {
      return [];
    }

    if ("fn" in stored) {
      return [stored];
    }

    return [...stored];
  }

  private hasEventStore(inputPlugin: Phaser.Input.InputPlugin): inputPlugin is SceneInputWithEventStore {
    return "_events" in inputPlugin;
  }

  private bindKeyboard(): void {
    const keyboard = this.config.scene.input.keyboard;
    if (keyboard === null) {
      return;
    }

    keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.handleKeyDown, this);
    this.keyboardPlugin = keyboard;
  }

  private unbindKeyboard(): void {
    if (this.keyboardPlugin === undefined) {
      return;
    }

    this.keyboardPlugin.off(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.handleKeyDown, this);
    this.keyboardPlugin = undefined;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.opened) {
      return;
    }

    const optionIndex = this.optionIndexForKey(event);
    if (optionIndex !== undefined) {
      this.chooseOptionAtIndex(optionIndex);
      event.preventDefault();
      return;
    }

    if (this.isPreviousSelectionKey(event)) {
      this.moveKeyboardSelection(-1);
      event.preventDefault();
      return;
    }

    if (this.isNextSelectionKey(event)) {
      this.moveKeyboardSelection(1);
      event.preventDefault();
      return;
    }

    if (this.isConfirmSelectionKey(event)) {
      this.chooseOptionAtIndex(this.selectedOptionIndex);
      event.preventDefault();
    }
  }

  private optionIndexForKey(event: KeyboardEvent): number | undefined {
    const optionNumber = Number.parseInt(event.key, 10);
    if (!Number.isInteger(optionNumber) || optionNumber < 1 || optionNumber > this.config.quiz.options.length) {
      return this.optionIndexForCode(event.code);
    }

    return optionNumber - 1;
  }

  private optionIndexForCode(code: string): number | undefined {
    const digitOption = this.optionIndexForCodePrefix(code, "Digit");
    if (digitOption !== undefined) {
      return digitOption;
    }

    return this.optionIndexForCodePrefix(code, "Numpad");
  }

  private optionIndexForCodePrefix(code: string, prefix: string): number | undefined {
    if (!code.startsWith(prefix)) {
      return undefined;
    }

    const optionNumber = Number.parseInt(code.slice(prefix.length), 10);
    if (!Number.isInteger(optionNumber) || optionNumber < 1 || optionNumber > this.config.quiz.options.length) {
      return undefined;
    }

    return optionNumber - 1;
  }

  private isPreviousSelectionKey(event: KeyboardEvent): boolean {
    return event.key === "ArrowUp" || event.key === "ArrowLeft" || event.key === "Up" || event.key === "Left";
  }

  private isNextSelectionKey(event: KeyboardEvent): boolean {
    return event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "Down" || event.key === "Right";
  }

  private isConfirmSelectionKey(event: KeyboardEvent): boolean {
    return event.key === "Enter" || event.key === " " || event.code === "Enter" || event.code === "NumpadEnter";
  }

  private moveKeyboardSelection(offset: number): void {
    if (this.config.quiz.options.length === 0) {
      return;
    }

    const optionCount = this.config.quiz.options.length;
    this.updateKeyboardSelection((this.selectedOptionIndex + offset + optionCount) % optionCount);
  }

  private chooseOptionAtIndex(index: number): void {
    const selectedButton = this.optionButtons[index];
    if (selectedButton === undefined) {
      return;
    }

    this.updateKeyboardSelection(index);
    this.handleOption(selectedButton.option);
  }

  private updateKeyboardSelection(index: number): void {
    this.selectedOptionIndex = index;

    for (const [buttonIndex, button] of this.optionButtons.entries()) {
      button.hitArea.setFillStyle(
        buttonIndex === this.selectedOptionIndex ? SCENE_UI_COLORS.greenery.fill : SCENE_UI_COLORS.gold.fill,
      );
    }
  }

  private handleOption(option: QuizOption): void {
    if (!this.opened) {
      return;
    }

    if (option.isCorrect) {
      this.close();
      this.config.onCorrect(option);
      return;
    }

    this.reactionText?.setText(wrapKoreanText(option.wrongReaction, 24, 3));

    if (this.hintText !== undefined) {
      return;
    }

    this.hintText = this.track(
      createKoreanText(this.config.scene, {
        x: GAME_WIDTH / 2,
        y: 620,
        copy: `힌트\n${this.config.quiz.hint}`,
        width: 544,
        maxCharactersPerLine: 28,
        maxLines: 3,
        fontSize: 18,
        lineHeight: 28,
        color: "gold",
        depth: MODAL_DEPTH + 2,
      }),
    );
    this.track(this.config.scene.add.image(94, 620, "hint-button").setDepth(MODAL_DEPTH + 2));
  }

  private stopPointerPropagation(
    _pointer: Phaser.Input.Pointer,
    _localX: number,
    _localY: number,
    event: Phaser.Types.Input.EventData,
  ): void {
    event.stopPropagation();
  }

  private track<ObjectType extends Phaser.GameObjects.GameObject>(object: ObjectType): ObjectType {
    this.renderObjects.push(object);
    return object;
  }
}
