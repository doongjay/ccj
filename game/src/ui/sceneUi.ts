import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import type { SceneKey } from "../state/gameState";
import { PixelPanel } from "./PixelPanel";

export const SCENE_UI_COLORS = {
  ivory: { fill: 0xfff9ef, text: "#FFF9EF" },
  blush: { fill: 0xe9a0a7, text: "#E9A0A7" },
  greenery: { fill: 0x738d5f, text: "#738D5F" },
  gold: { fill: 0xc8a24b, text: "#C8A24B" },
  coral: { fill: 0xdb6c63, text: "#DB6C63" },
  inkOutline: { fill: 0x26332a, text: "#26332A" },
  labelSurface: { fill: 0x1e2920, text: "#1E2920" },
  labelText: { fill: 0xfffaf2, text: "#FFFAF2" },
} as const;

export type SceneUiColor = keyof typeof SCENE_UI_COLORS;

export type SceneBandConfig = Readonly<{
  y: number;
  width: number;
  height: number;
  color: SceneUiColor;
}>;

export type SceneBackgroundConfig = Readonly<{
  color: SceneUiColor;
  bands?: readonly SceneBandConfig[];
}>;

export type SceneBackground = Readonly<{
  fill: Phaser.GameObjects.Rectangle;
  bands: readonly Phaser.GameObjects.Rectangle[];
}>;

export type KoreanTextConfig = Readonly<{
  x: number;
  y: number;
  copy: string;
  width: number;
  maxCharactersPerLine: number;
  maxLines: number;
  fontSize: number;
  lineHeight: number;
  color: SceneUiColor;
  align?: "center" | "left" | "right";
  originX?: number;
  originY?: number;
  depth?: number;
}>;

export type SceneHeaderConfig = Readonly<{
  title: string;
  status?: string;
  y?: number;
}>;

export type SceneHeader = Readonly<{
  title: Phaser.GameObjects.Text;
  status: Phaser.GameObjects.Text | undefined;
}>;

export type ScenePanelConfig = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  surface?: SceneUiColor;
  border?: SceneUiColor;
  texture?: "dialog-panel" | "quiz-frame";
  depth?: number;
}>;

export type TouchButtonConfig = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  onPress: () => void;
  depth?: number;
}>;

export type TouchButton = Readonly<{
  hitArea: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}>;

const FONT_FAMILY = "Galmuri11, system-ui, sans-serif";
const MIN_TOUCH_TARGET = 44;
const SCENE_FADE_DURATION_MS = 240;

export function createSceneBackground(scene: Phaser.Scene, config: SceneBackgroundConfig): SceneBackground {
  const fill = scene.add.rectangle(
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2,
    GAME_WIDTH,
    GAME_HEIGHT,
    SCENE_UI_COLORS[config.color].fill,
  );
  const bands: Phaser.GameObjects.Rectangle[] = [];

  for (const band of config.bands ?? []) {
    bands.push(
      scene.add.rectangle(
        GAME_WIDTH / 2,
        band.y,
        band.width,
        band.height,
        SCENE_UI_COLORS[band.color].fill,
      ),
    );
  }

  return { fill, bands };
}

export function createKoreanText(scene: Phaser.Scene, config: KoreanTextConfig): Phaser.GameObjects.Text {
  const fontSize = Math.max(1, Math.floor(config.fontSize));
  const lineHeight = Math.max(Math.floor(config.lineHeight), fontSize);
  const charactersPerLine = Math.max(1, Math.floor(config.maxCharactersPerLine));
  const maxLines = Math.max(1, Math.floor(config.maxLines));
  const text = scene.add.text(config.x, config.y, wrapKoreanText(config.copy, charactersPerLine, maxLines), {
    align: config.align ?? "center",
    color: SCENE_UI_COLORS[config.color].text,
    fixedWidth: config.width,
    fontFamily: FONT_FAMILY,
    fontSize: `${fontSize}px`,
    resolution: 2,
    testString: "|M가나다라마바사아자차카타파하힣",
    padding: { top: 4, bottom: 4 },
    lineSpacing: lineHeight - fontSize,
    maxLines,
  });

  text.setLineSpacing(Math.max(0, lineHeight - text.getTextMetrics().fontSize));
  text.setOrigin(config.originX ?? 0.5, config.originY ?? 0.5);
  text.setDepth(config.depth ?? 0);
  return text;
}

export function createSceneHeader(scene: Phaser.Scene, config: SceneHeaderConfig): SceneHeader {
  const y = config.y ?? 96;
  const title = createKoreanText(scene, {
    x: GAME_WIDTH / 2,
    y,
    copy: config.title,
    width: 608,
    maxCharactersPerLine: 14,
    maxLines: 2,
    fontSize: 32,
    lineHeight: 40,
    color: "inkOutline",
  });
  const status = config.status === undefined
    ? undefined
    : createKoreanText(scene, {
        x: GAME_WIDTH / 2,
        y: y + 56,
        copy: config.status,
        width: 560,
        maxCharactersPerLine: 20,
        maxLines: 1,
        fontSize: 22,
        lineHeight: 24,
        color: "labelSurface",
      });

  return { title, status };
}

export function createScenePanel(scene: Phaser.Scene, config: ScenePanelConfig): Phaser.GameObjects.Rectangle {
  const panel = new PixelPanel(scene, config.x, config.y, config.width, config.height,
    config.texture ?? "dialog-panel");
  panel.setDepth(config.depth ?? 0);
  return panel;
}

export function createTouchButton(scene: Phaser.Scene, config: TouchButtonConfig): TouchButton {
  const width = Math.max(config.width, MIN_TOUCH_TARGET);
  const height = Math.max(config.height, MIN_TOUCH_TARGET);
  const hitArea = new PixelPanel(scene, config.x, config.y, width, height, "touch-button");
  hitArea.setInteractive({ useHandCursor: true });
  hitArea.setDepth(config.depth ?? 0);
  hitArea.on(Phaser.Input.Events.POINTER_DOWN, () => {
    hitArea.setFillStyle(SCENE_UI_COLORS.greenery.fill);
  });
  hitArea.on(Phaser.Input.Events.POINTER_OUT, () => {
    hitArea.setFillStyle(SCENE_UI_COLORS.gold.fill);
  });
  hitArea.on(Phaser.Input.Events.POINTER_UP, () => {
    hitArea.setFillStyle(SCENE_UI_COLORS.gold.fill);
    config.onPress();
  });

  const label = createKoreanText(scene, {
    x: config.x,
    y: config.y,
    copy: config.label,
    width: width - 24,
    maxCharactersPerLine: Math.max(1, Math.floor((width - 24) / 26)),
    maxLines: 2,
    fontSize: 26,
    lineHeight: 30,
    color: "inkOutline",
    depth: (config.depth ?? 0) + 1,
  });

  return { hitArea, label };
}

export function fadeToScene(scene: Phaser.Scene, targetScene: SceneKey, data: Readonly<{ entrance?: "bridal" }> = {}): void {
  const camera = scene.cameras.main;

  if (camera.fadeEffect.isRunning) {
    return;
  }

  camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(targetScene, data);
  });
  const fadeColor = Phaser.Display.Color.IntegerToRGB(SCENE_UI_COLORS.inkOutline.fill);
  camera.fadeOut(SCENE_FADE_DURATION_MS, fadeColor.r, fadeColor.g, fadeColor.b);
}

export function markActiveScene(scene: Phaser.Scene, sceneKey: SceneKey): void {
  scene.game.canvas.dataset.activeScene = sceneKey;
}

export function wrapKoreanText(copy: string, charactersPerLine: number, maxLines: number): string {
  const lineLimit = Math.max(1, Math.floor(charactersPerLine));
  const visibleLineLimit = Math.max(1, Math.floor(maxLines));
  const lines: string[] = [];

  for (const paragraph of copy.split("\n")) {
    if (paragraph.trim().length === 0) {
      lines.push("");
      continue;
    }

    let line = "";
    for (const word of paragraph.trim().split(/\s+/u)) {
      const characters = Array.from(word);
      if (line.length > 0 && Array.from(line).length + 1 + characters.length <= lineLimit) {
        line += ` ${word}`;
        continue;
      }
      if (line.length > 0) lines.push(line);
      let start = 0;
      while (characters.length - start > lineLimit) {
        lines.push(characters.slice(start, start + lineLimit).join(""));
        start += lineLimit;
      }
      line = characters.slice(start).join("");
    }
    if (line.length > 0) lines.push(line);
  }

  const visibleLines = lines.slice(0, visibleLineLimit);

  if (lines.length > visibleLineLimit && lineLimit > 3) {
    const lastLineIndex = visibleLines.length - 1;
    const lastLine = visibleLines[lastLineIndex];

    if (lastLine !== undefined) {
      visibleLines[lastLineIndex] = `${lastLine.slice(0, lineLimit - 3)}...`;
    }
  }

  return visibleLines.join("\n");
}
