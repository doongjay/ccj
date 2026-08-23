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

async function boot() {
  // Canvas text is rasterized once at creation time, so the pixel font has to be
  // ready before any scene draws text — otherwise it renders in the fallback font
  // and never updates. Don't let a slow/failed font load block the game forever.
  await Promise.race([
    Promise.all([document.fonts.load('16px Galmuri11'), document.fonts.load('bold 16px Galmuri11')]),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]).catch(() => undefined);

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
    scene: [
      BootScene,
      IntroScene,
      HomeSelectScene,
      CarRouteScene,
      SubwayRouteScene,
      VenueLobbyScene,
      VenueHallScene,
      EndingScene,
    ],
  });
}

boot();
