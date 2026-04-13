import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@core/config';
import { BootScene } from '@scenes/BootScene';
import { GameScene } from '@scenes/GameScene';
import { ShopScene } from '@scenes/ShopScene';

/**
 * Конфигурация Phaser игры
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 360,
      height: 640,
    },
    max: {
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
  },
  scene: [BootScene, GameScene, ShopScene],
  input: {
    activePointers: 1,
  },
  render: {
    antialias: true,
    roundPixels: false,
  },
};

/**
 * Инициализация игры
 */
const game = new Phaser.Game(config);

// Обработка паузы при сворачивании
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.loop.pause();
  } else {
    game.loop.resume();
  }
});

export default game;
