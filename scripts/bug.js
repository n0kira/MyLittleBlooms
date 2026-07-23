import { GameManager } from "./gameManager.js";

export class Bug extends Phaser.GameObjects.Sprite {
  constructor(scene, vase, reward) {
    super(scene, vase.x, vase.y, "bugTexture");
    scene.add.existing(this);

    this.vase = vase;
    this.reward = reward;

    this.setInteractive({useHandCursor: true});
    this.on("pointerdown", () => {
      this.catchBug(scene);
    });
  }

  catchBug(scene) {
    GameManager.coins += this.reward;

    const coinCounter = document.getElementById('coinCounter');
    coinCounter.textContent = "Coins: " + GameManager.coins;

    const text = scene.add.text(this.x, this.y, `+${this.reward}`, {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#ffd700"
    }).setOrigin(0.5);

    scene.tweens.add({
      targets: text,
      y: this.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    })

    scene.saveGame();
    this.destroy();
  }
}
