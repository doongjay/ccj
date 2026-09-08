import Phaser from 'phaser';
import './style.css';
import { GAME_WIDTH, GAME_HEIGHT } from './config';
import { BootScene } from './scenes/BootScene';
import { IntroScene } from './scenes/IntroScene';
import { HomeSelectScene } from './scenes/HomeSelectScene';
import { CarRouteScene } from './scenes/CarRouteScene';
import { SubwayRouteScene } from './scenes/SubwayRouteScene';
import { VenueLobbyScene } from './scenes/VenueLobbyScene';
import { VenueHallScene } from './scenes/VenueHallScene';
import { EndingScene } from './scenes/EndingScene';
import { GreeneryCorridorScene } from './scenes/GreeneryCorridorScene';
import { BanquetScene, BridalRoomScene, PhotoBoothScene, WaitingRoomScene } from './scenes/VenueRoomScene';

const GAME_SCENES = [
  BootScene,
  IntroScene,
  HomeSelectScene,
  CarRouteScene,
  SubwayRouteScene,
  VenueLobbyScene,
  VenueHallScene,
  PhotoBoothScene,
  BanquetScene,
  BridalRoomScene,
  GreeneryCorridorScene,
  WaitingRoomScene,
  EndingScene,
] as const satisfies readonly Phaser.Types.Scenes.SceneType[];

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
  },
  scene: [...GAME_SCENES],
});
