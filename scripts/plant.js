import { GameManager } from "./gameManager.js";
import { PLANT_DATA } from "./plantData.js";

// Create a plant scene
export class Plant extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, plantName, maxWaterLevel, minWaterLevel, starterWater, growthDays, vase, value) {
    super(scene, x, y, plantName.toLowerCase() + "_stage_1");
    scene.add.existing(this);

    // Assign all data to the created plant
    this.plantName = plantName;
    this.maxWaterLevel = maxWaterLevel;
    this.minWaterLevel = minWaterLevel
    this.waterLevel = starterWater;
    this.growthDays = growthDays;
    this.vase = vase;
    this.value = value;

    // Set values
    this.currentDays = 0;
    this.daysUnhealthy = 0;
    this.isDead = false;
    this.isGrown = false;
    this.currentStage = 1;
    
    // Make the plant interactive by showing the info on click
    this.setInteractive({useHandCursor: true});
    this.on("pointerdown", () => {
      scene.showPlantInfo(this);
    });

  }

  // WATER THE PLANT
  water() {
    if (this.isDead) return;
    this.waterLevel = Math.min(this.waterLevel + 10, 100);
  }

  // DRY THE PLANT
  dry() {
    if (this.isDead) return; 
    if (this.waterLevel >= 10) this.waterLevel -= 10;
  }

  // HARVEST THE PLANT
  harvest() {

    // Block action if the plant isn't ready for harvest
    if (!(this.isDead || this.isGrown)) {
      console.log(this.isDead);
      console.log(this.isGrown)
      alert("Can't harvest " + this.plantName + "!!")
      return false;
    }

    // Rstore the empty vase
    this.vase.isEmpty = true;
    this.vase.setVisible(true);
    
    // Remove the plant
    this.destroy();
    return true;
  }

  // CHECK PLANT STATUS
  checkHealth () {
    // Check to see if the plant is in bad conditions
    const isWithering = this.waterLevel < this.minWaterLevel;
    const isDrowning = this.waterLevel > this.maxWaterLevel
    
    // Check if the plant is fully grown and ready to harvest
    this.isGrown = this.currentDays >= this.growthDays;

    // Check status for each case
    if (this.daysUnhealthy >= 3) {
      this.isDead = true;
      this.daysUnhealthy += 1;
      alert(this.plantName + " has just died... :(")
    } else if (isWithering || isDrowning) {
      this.daysUnhealthy += 1;
      this.currentDays += 1;
    } else if (this.isGrown) {
      alert(this.plantName + " has grown, ready to harvest!");
      this.currentDays += 1;
    } else {
      this.daysUnhealthy = 0;
      this.currentDays += 1;
    }

    this.growthChange();

  }
  
  // CHANGE TEXTURE BASED ON GROWTH STATUS
  growthChange() {
    const checkpoints = PLANT_DATA[this.plantName].growthCheckpoint;
    let stage = 0;
    
    if (this.isDead) stage = 1;
    else if (this.currentDays < checkpoints[0]) stage = 1;
    else if (this.currentDays < checkpoints[1]) stage = 2;
    else stage = 3;
    
    if (stage != this.currentStage) {
      this.currentStage = stage;
      this.setTexture(this.plantName.toLowerCase() + "_stage_" + this.currentStage);
    }
  }
}
