import Phaser from 'phaser';
import { buildPlaceholderQuizRoom } from '../systems/placeholderQuizRoom';
import { QUIZZES } from '../data/scenario';

export class SubwayRouteScene extends Phaser.Scene {
  constructor() {
    super('SubwayRouteScene');
  }

  create() {
    buildPlaceholderQuizRoom(this, {
      title: '양재역 — 3호선과 신분당선이 만나는 곳, 헷갈리지 마세요!',
      zoneLabel: '출구 안내판',
      quiz: QUIZZES.Q2,
      nextSceneKey: 'VenueLobbyScene',
    });
  }
}
