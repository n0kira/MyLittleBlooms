import { GameManager } from "./gameManager.js";

export class Bug extends Phaser.GameObjects.Sprite {
  constructor(scene, plant, reward) {
    super(scene, plant.x, plant.y + 47, "bugTexture");
    scene.add.existing(this);

    this.plant = plant;
    this.reward = reward;

    this.scale = 0.3;
    this.rotation = 90

    this.notification = scene.add.sprite(this.x + 5, this.y - 120, "notificationTexture");
    this.notification.setScale(0.5);

    scene.tweens.add({
      targets: this.notification,
      y: this.y -  128,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    })

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

    this.scene.playSound("bugPop", 0.5);
    this.scene.playSound("coin", 0.4);

    scene.saveGame();
    this.notification.destroy();
    this.destroy();
  }
}
