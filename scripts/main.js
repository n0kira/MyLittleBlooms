import { GameScene } from './gameScene.js';

// Setup game environment, a canvas
const config = {
  type: Phaser.WEBGL,
  width: 1280,
  height: 720,
  parent: 'gameWindow',
  backgroundColor: '#76aee3',
  scene: [GameScene]
};

new Phaser.Game(config);
