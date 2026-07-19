export class LockedVase extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, price) {
    super(scene, x, y, "lockedTexture");
    scene.add.existing(this);

    this.price = price;
    this.scale = 0.5;

    this.setInteractive({useHandCursor: true});
    this.on("pointerdown", () => {
      scene.unlock(this);
    })
  }
}
