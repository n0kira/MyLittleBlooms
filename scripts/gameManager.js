
// Manages all global stats
class GameManagerClass extends Phaser.Events.EventEmitter {
  constructor() {
    super();
    this.currentDay = 1;
    this.coins = 100;
  }

  // Signal to make the game advance
  advanceDay() {
    this.currentDay += 1;
    this.emit("day_advanced");
  }
}

export const GameManager = new GameManagerClass();
