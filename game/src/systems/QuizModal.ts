import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import type { Quiz } from '../data/scenario';

const PANEL_WIDTH = 600;
const PANEL_PADDING = 32;
const QUESTION_AREA_HEIGHT = 90;
const OPTION_HEIGHT = 64;
const OPTION_GAP = 16;
const FOOTER_AREA_HEIGHT = 120;

const FALLBACK_REACTION_TEXT = '음... 다시 골라볼까요?';

/** Question + options modal. Wrong answers show a reaction and reveal a hint button;
 *  retries are unlimited. A correct answer closes the modal and fires onCorrect(). */
export class QuizModal {
  private readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, quiz: Quiz, onCorrect: () => void) {
    const optionsHeight = quiz.options.length * OPTION_HEIGHT + (quiz.options.length - 1) * OPTION_GAP;
    const panelHeight = PANEL_PADDING * 2 + QUESTION_AREA_HEIGHT + optionsHeight + FOOTER_AREA_HEIGHT;
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;
    const panelTop = centerY - panelHeight / 2;

    this.container = scene.add.container(0, 0).setDepth(1000);

    const dim = scene.add.rectangle(centerX, centerY, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55).setInteractive();
    const panel = scene.add
      .rectangle(centerX, centerY, PANEL_WIDTH, panelHeight, 0x1c1c24, 0.96)
      .setStrokeStyle(2, 0xffffff, 0.4);
    const question = scene.add
      .text(centerX, panelTop + PANEL_PADDING, quiz.question, {
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: PANEL_WIDTH - PANEL_PADDING * 2 },
      })
      .setOrigin(0.5, 0);

    this.container.add([dim, panel, question]);

    const optionsTop = panelTop + PANEL_PADDING + QUESTION_AREA_HEIGHT;
    const footerY = optionsTop + optionsHeight + 24;

    const reactionText = scene.add
      .text(centerX, footerY, '', {
        fontSize: '18px',
        color: '#ffd166',
        align: 'center',
        wordWrap: { width: PANEL_WIDTH - PANEL_PADDING * 2 },
      })
      .setOrigin(0.5, 0);

    const hintText = scene.add
      .text(centerX, footerY + 36, '', {
        fontSize: '18px',
        color: '#8ecae6',
        align: 'center',
        wordWrap: { width: PANEL_WIDTH - PANEL_PADDING * 2 },
      })
      .setOrigin(0.5, 0)
      .setVisible(false);

    const hintButton = scene.add
      .text(centerX, footerY + 36, '힌트 보기', { fontSize: '18px', color: '#8ecae6' })
      .setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    hintButton.on('pointerdown', () => {
      hintText.setText(quiz.hintText).setVisible(true);
      hintButton.setVisible(false);
    });

    this.container.add([reactionText, hintText, hintButton]);

    quiz.options.forEach((option, index) => {
      const y = optionsTop + index * (OPTION_HEIGHT + OPTION_GAP) + OPTION_HEIGHT / 2;
      const button = scene.add
        .rectangle(centerX, y, PANEL_WIDTH - PANEL_PADDING * 2, OPTION_HEIGHT, 0x3a3a46)
        .setStrokeStyle(1, 0xffffff, 0.3)
        .setInteractive({ useHandCursor: true });
      const label = scene.add.text(centerX, y, option.label, { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);

      button.on('pointerdown', () => {
        if (option.correct) {
          this.container.destroy(true);
          onCorrect();
          return;
        }

        reactionText.setText(option.reactionText ?? FALLBACK_REACTION_TEXT);
        hintButton.setVisible(true);
      });

      this.container.add([button, label]);
    });
  }
}
