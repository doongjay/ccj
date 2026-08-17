import Phaser from 'phaser';
import { buildPlaceholderQuizRoom } from '../systems/placeholderQuizRoom';
import { QUIZZES } from '../data/scenario';

export class CarRouteScene extends Phaser.Scene {
  constructor() {
    super('CarRouteScene');
  }

  create() {
    buildPlaceholderQuizRoom(this, {
      title: '양재IC — 어라, 오늘따라 왜 이렇게 막히지?',
      zoneLabel: '유도선 갈림길',
      quiz: QUIZZES.Q1,
      nextSceneKey: 'VenueLobbyScene',
    });
  }
}
