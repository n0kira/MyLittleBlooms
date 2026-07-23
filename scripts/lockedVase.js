export class LockedVase extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, price, labelText) {
    super(scene, x, y, "lockedTexture");
    scene.add.existing(this);

    this.label = scene.add.text(x, y + 55, labelText, {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#fff"
    }).setOrigin(0.5);

    this.price = price;

    this.setInteractive({useHandCursor: true});
    this.on("pointerdown", () => {
      scene.unlock(this);
    })
  }
}
