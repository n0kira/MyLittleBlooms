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

    this.waterNotification = scene.add.sprite(this.x - 30, this.y - 80, "wateringCan");
    this.waterNotification.setScale(0.5);
    this.waterNotification.setVisible(false);
    
    this.harvestNotification = scene.add.sprite(this.x + 30, this.y - 80, "harvestingTool");
    this.harvestNotification.setScale(0.5);
    this.harvestNotification.setVisible(false);

    scene.tweens.add({
      targets: [this.waterNotification, this.harvestNotification],
      y: this.y - 88,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
    
    // Make the plant interactive by showing the info on click
    this.setInteractive({useHandCursor: true});
    this.on("pointerdown", () => {
      scene.showPlantInfo(this);
    });

  }

  // WATER THE PLANT
  water() {
    if (this.isDead) return;
    if (this.waterLevel >= 150) return;

    this.waterLevel += 10;
    
    if (this.scene.waterSound.isPlaying) {
      this.scene.waterSound.stop();
    }

    this.scene.waterSound.setRate(Phaser.Math.FloatBetween(0.92, 1.08));
    this.scene.waterSound.play();
  }

  // DRY THE PLANT
  dry() {
    if (this.waterLevel >= 10) this.waterLevel -= 10;
  }

  // HARVEST THE PLANT
  harvest() {

    // Block action if the plant isn't ready for harvest
    if (!(this.isDead || this.isGrown)) {
      alert("Can't harvest " + this.plantName + "!!")
      return false;
    }

    if (!this.isDead) {
      const text = this.scene.add.text(this.x, this.y, `+1 ${this.plantName}`, {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffd700"
      }).setOrigin(0.5);

      this.scene.tweens.add({
        targets: text,
        y: this.y - 40,
        alpha: 0,
        duration: 1000,
        onComplete: () => text.destroy()
      })
    }

    this.scene.playSound("harvesting", 0.5);
    this.waterNotification.destroy();
    this.harvestNotification.destroy();
    

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
    const isDrowning = this.waterLevel > this.maxWaterLevel;
    const hasBug = this.scene.bugs.some(bug => bug.plant == this);
    
    // Check plant health
    
    if (!(isWithering || isDrowning || hasBug)) {
      this.daysUnhealthy = 0;
      this.currentDays += 1;
    } else {
      this.daysUnhealthy += 1;
      this.currentDays += 1;
    }
    
    // Check status for each case
    
    const maxUnhealthy = Math.min(3, this.growthDays);

    if (this.daysUnhealthy >= maxUnhealthy) {
      this.isDead = true;
      this.isGrown = false;
      this.daysUnhealthy += 1;
    } else {
      this.isGrown = this.currentDays >= this.growthDays;
    }
    
    if (this.isGrown) {
      this.harvestNotification.setVisible(true);
    }
    
    if (isWithering && !this.isDead) {
      this.waterNotification.setVisible(true);
    } else {
      this.waterNotification.setVisible(false);
    }

    this.growthChange();

  }
  
  // CHANGE TEXTURE BASED ON GROWTH STATUS
  growthChange() {
    const checkpoints = PLANT_DATA[this.plantName].growthCheckpoint;
    let stage = 0;
    
    if (this.isDead) stage = 0;
    else if (this.currentDays < checkpoints[0]) stage = 1;
    else if (this.currentDays < checkpoints[1]) stage = 2;
    else stage = 3;
    
    if (stage != this.currentStage) {
      this.currentStage = stage;
      this.setTexture(this.plantName.toLowerCase() + "_stage_" + this.currentStage);
    }
  }

  getStatus() {
    const isWithering = this.waterLevel < this.minWaterLevel;
    const isDrowning = this.waterLevel > this.maxWaterLevel;
    const hasBug = this.scene.bugs.some(bug => bug.plant == this);
    
    this.isGrown = this.currentDays >= this.growthDays;

    if (hasBug) return "Infested";
    else if (isWithering) return "Withering";
    else if (isDrowning) return "Drowning";
    else if (this.isDead) return "Dead";
    else if (this.isGrown) return "Grown";
    return "Healthy";
  }

  updateNotifications() {
    const isWithering = this.waterLevel < this.minWaterLevel;

    if (this.isDead) {
      this.waterNotification.setVisible(false);
      this.harvestNotification.setVisible(false);
    } else {
      this.waterNotification.setVisible(isWithering);
      this.harvestNotification.setVisible(this.isGrown);
    }
  }
}
