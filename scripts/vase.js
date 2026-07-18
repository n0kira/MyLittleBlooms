import {Plant} from "./plant.js"
import { PLANT_DATA } from "./plantData.js";

// Create an empty vase scene
export class Vase extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "vaseTexture");
    this.setDisplaySize(100, 100);
    scene.add.existing(this);
    
    this.isEmpty = true;

    // Make the vase interactive by planting inside the selected plant if any
    this.setInteractive({useHandCursor: true});
    this.on("pointerdown", () => {
      if (!this.isEmpty) return;
      if (!scene.selectedPlantType) return;

      scene.plant(this);
    });
  }
}
