import { GameScene } from './gameScene.js';

// Setup game environment, a canvas
const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'gameWindow',
  backgroundColor: '#333',
  scene: [GameScene]
};

new Phaser.Game(config);
