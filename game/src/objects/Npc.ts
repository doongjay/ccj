import Phaser from "phaser";
import type { CharacterKey } from "../data/assetManifest";

export const NPC_VARIANTS = {
  bride: "bride",
  groom: "groom",
  reception: "reception",
  guide: "guide",
} as const;

export type NpcVariant = (typeof NPC_VARIANTS)[keyof typeof NPC_VARIANTS];

export type NpcConfig = Readonly<{
  x: number;
  y: number;
  label: string;
  variant: NpcVariant;
}>;

const NPC_WIDTH = 64;
const NPC_HEIGHT = 96;
const NPC_LABEL_WIDTH = 112;
const NPC_LABEL_HEIGHT = 36;
const LABEL_CHARACTERS_PER_LINE = 7;
const MAX_LABEL_CHARACTERS = LABEL_CHARACTERS_PER_LINE * 2;

const COLORS = {
  blush: 0xe9a0a7,
  coral: 0xdb6c63,
  gold: 0xc8a24b,
  greenery: 0x738d5f,
  inkOutline: 0x26332a,
  ivory: 0xfff9ef,
  labelSurface: 0x1e2920,
  labelText: "#fffaf2",
} as const;

const TEXTURES = {
  bride: "npc-bride", groom: "npc-groom", reception: "npc-reception", guide: "npc-guide",
} as const satisfies Readonly<Record<NpcVariant, CharacterKey>>;

export class Npc extends Phaser.GameObjects.Container {
  public readonly variant: NpcVariant;

  private readonly labelText: Phaser.GameObjects.Text;

  public constructor(scene: Phaser.Scene, config: NpcConfig) {
    super(scene, config.x, config.y);

    this.variant = config.variant;
    this.setSize(NPC_WIDTH, NPC_HEIGHT);

    const labelPlate = new Phaser.GameObjects.Rectangle(
      scene,
      0,
      -66,
      NPC_LABEL_WIDTH,
      NPC_LABEL_HEIGHT,
      COLORS.labelSurface,
    ).setStrokeStyle(4, COLORS.ivory);
    this.labelText = new Phaser.GameObjects.Text(scene, 0, -66, formatLabel(config.label), {
      align: "center",
      color: COLORS.labelText,
      padding: { top: 2, bottom: 2 },
      fixedWidth: NPC_LABEL_WIDTH - 8,
      fontFamily: "Galmuri11, system-ui, sans-serif",
      fontSize: "14px",
      resolution: 2,
      testString: "|M가나다라마바사아자차카타파하힣",
      fontStyle: "700",
      lineSpacing: 0,
    }).setOrigin(0.5);

    const sprite = new Phaser.GameObjects.Sprite(scene, 0, 48, TEXTURES[config.variant], 0)
      .setOrigin(0.5, 1).setScale(2);
    this.add([sprite, labelPlate, this.labelText]);
    scene.add.existing(this);
  }

  public setLabel(label: string): this {
    this.labelText.setText(formatLabel(label));
    return this;
  }
}

function formatLabel(label: string): string {
  const characters = Array.from(label.trim() || "안내");
  const visibleCharacters = characters.slice(0, MAX_LABEL_CHARACTERS);

  if (characters.length > MAX_LABEL_CHARACTERS) {
    visibleCharacters.splice(MAX_LABEL_CHARACTERS - 3, 3, ".", ".", ".");
  }

  return [
    visibleCharacters.slice(0, LABEL_CHARACTERS_PER_LINE).join("").trim(),
    visibleCharacters.slice(LABEL_CHARACTERS_PER_LINE).join("").trim(),
  ]
    .filter((line) => line.length > 0)
    .join("\n");
}
