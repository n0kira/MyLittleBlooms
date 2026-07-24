import { GameManager } from "./gameManager.js";
import { Plant } from "./plant.js";
import { Vase } from "./vase.js";
import { PLANT_DATA } from "./plantData.js";
import { LockedVase } from "./lockedVase.js";
import { Bug } from "./bug.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }
  
  
  preload() {
    // runs once before create()
    
    /* 
      LOAD
      IMAGES
    */
    this.load.image("background", "assets/art/background.png");
    this.load.image("lockedTexture", "assets/art/locked_vase.png");
    this.load.image("vaseTexture", "assets/art/vase.png");

    this.load.image("rose_stage_0", "assets/art/rose_stage_0.png");
    this.load.image("rose_stage_1", "assets/art/rose_stage_1.png");
    this.load.image("rose_stage_2", "assets/art/rose_stage_2.png");
    this.load.image("rose_stage_3", "assets/art/rose_stage_3.png");

    this.load.image("tulip_stage_0", "assets/art/tulip_stage_0.png");
    this.load.image("tulip_stage_1", "assets/art/tulip_stage_1.png");
    this.load.image("tulip_stage_2", "assets/art/tulip_stage_2.png");
    this.load.image("tulip_stage_3", "assets/art/tulip_stage_3.png");

    this.load.image("sunflower_stage_0", "assets/art/sunflower_stage_0.png");
    this.load.image("sunflower_stage_1", "assets/art/sunflower_stage_1.png");
    this.load.image("sunflower_stage_2", "assets/art/sunflower_stage_2.png");
    this.load.image("sunflower_stage_3", "assets/art/sunflower_stage_3.png");

    this.load.image("daisy_stage_0", "assets/art/daisy_stage_0.png");
    this.load.image("daisy_stage_1", "assets/art/daisy_stage_1.png");
    this.load.image("daisy_stage_3", "assets/art/daisy_stage_3.png");

    this.load.image("bugTexture", "assets/art/bug.png");
    this.load.image("notificationTexture", "assets/art/notification.png");

    this.load.image("wateringCan", "assets/art/watering_can.png");
    this.load.image("harvestingTool", "assets/art/harvest_tool.png")

    /* 
      LOAD
      SOUNDS
    */
    this.load.audio("watering", "assets/sounds/watering.mp3");
    this.load.audio("planting", "assets/sounds/planting.mp3");
    this.load.audio("harvesting", "assets/sounds/harvesting.mp3");
    this.load.audio("coin", "assets/sounds/coin.mp3");
    this.load.audio("unlocking", "assets/sounds/unlocking.mp3");
    this.load.audio("newDay", "assets/sounds/newDay.mp3");
    this.load.audio("bugPop", "assets/sounds/bugPop.mp3");

    this.load.audio("background_1", "assets/sounds/background_1.mp3");
    this.load.audio("background_2", "assets/sounds/background_2.mp3");

  }
  
  create() {
    // runs once
    this.nightOverlay = this.add.rectangle(640, 360, 1280, 720, 0x0a1128);
    this.nightOverlay.setAlpha(0);
    this.nightOverlay.setDepth(-1);

    this.add.image(640, 360, "background")

    this.dayDuration = 1000 * 60 * 2;
    this.dayTimer = 0;

    this.time.addEvent({
      delay: this.dayDuration,
      callback: () => {
        GameManager.advanceDay();
      },
      loop: true,
    });
 
    // DAY CYCLE
    function advanceDay() {
      GameManager.advanceDay();
    }

    this.collectedPlants = new Map();
    this.plants = [];
    this.selectedPlantType = null;
    this.lockedVases = [];
    this.vases = [];
    this.songsPlaylist = ["background_1", "background_2"];
    this.currentIndex = 0;
    this.currentMusic = null;
    this.targetVolume = 0.2;
    this.fade = 3000;

    this.playSongs(this.currentIndex);

    this.waterSound = this.sound.add("watering", { volume: 0.4 });

    const save = localStorage.getItem("gameData");
    if (save) {
      this.loadGame();
    } else {
      this.lockedVases = [
        new LockedVase(this, 390, 475, 35, "35"),
        new LockedVase(this, 545, 475, 35, "35"),
        
        new LockedVase(this, 735, 475, 75, "75"),
        new LockedVase(this, 895, 475, 75, "75"),  
        new LockedVase(this, 1035, 475, 75, "75"),
        
        new LockedVase(this, 975, 600, 125, "125"),
        new LockedVase(this, 825, 600, 125, "125"),
        new LockedVase(this, 475, 600, 125, "125"),
        new LockedVase(this, 335, 600, 125, "125"),
      ];

      this.vases = [
        new Vase(this, 250, 475)
      ];
    }

    // SPAWN BUGS
    this.bugs = [];

    this.time.delayedCall(60_000, () => {
      this.spawnBug();
    });

    document.getElementById('dayCounter').textContent = "Day: " + GameManager.currentDay;
    document.getElementById('coinCounter').textContent = "Coins: " + GameManager.coins;
    this.showInventory();


    // WATER CURRENTLY SELECTED PLANT
    document.getElementById('waterBtn').addEventListener("click", () => {
      if (!this.selectedPlant) return;
      this.selectedPlant.water();
      this.showPlantInfo(this.selectedPlant);
      this.selectedPlant.updateNotifications();
      this.saveGame();
    });


    // HARVEST CURRENTLY SELECTED PLANT
    document.getElementById('harvestBtn').addEventListener("click", () => {
      if (!this.selectedPlant) return;
      
      if(!this.selectedPlant.harvest()) return;

      // Remove the plant from the array
      const index = this.plants.indexOf(this.selectedPlant);
      if (index != -1) {
        this.plants.splice(index, 1);
      }

      // Early return in case the plant has died, no reward
      if (this.selectedPlant.isDead){
        this.saveGame();
        return;
      }

      // Add to inventory if the plant was all good
      this.addToInventory(this.selectedPlant.plantName);
      this.showPlantInfo(null);
      this.saveGame();
    });

    // Generate all plants inside of the plant selection
    const plantSel = document.getElementById('plantSelection');
    Object.entries(PLANT_DATA).forEach(([plantName, data]) => {
      const div = plantSel.appendChild(document.createElement("div"));
      div.classList.add("plantSeed");
      div.textContent = plantName;

      const span = div.appendChild(document.createElement("span"));
      span.textContent = ` ${data.cost} coins`;
    });

    // EXPAND THE PLANT SELECTION
    document.getElementById('openPlantSelection').addEventListener("click", () => {
      const plantSel = document.getElementById('plantSelection');
      const openPlantSel = document.getElementById('openPlantSelection');

      if (plantSel.style.display == "none") {
        plantSel.style.display = "block";
        openPlantSel.textContent = "▽ Plant Selection";
      } else {
        plantSel.style.display = "none";
        openPlantSel.textContent = "▷ Plant Selection";
      }
    });


    // EXPAND THE INVENTORY
    document.getElementById('openPlantInventory').addEventListener("click", (e) => {
      if (e.target.id !== "inventoryText") return;

      const plantInv = document.getElementById('plantInventory');
      const inventoryText = document.getElementById('inventoryText');

      if (plantInv.style.display == "none") {
        plantInv.style.display = "block";
        inventoryText.innerHTML = "▽ Inventory";
        this.showInventory();
      } else {
        plantInv.style.display = "none";
        inventoryText.innerHTML = "▷ Inventory";
      }

    });


    // SELL THE PLANT IF "SELL" IS CLICKED
    document.getElementById('plantInventory').addEventListener("click", (e) => {
      if (!e.target.classList.contains("sellBtn")) return;

      // Get only the name of the plant selected
      const plantName = e.target.parentElement.textContent.split(" ")[0];
      
      const data = PLANT_DATA[plantName];
      if (!data) return;

      const count = this.collectedPlants.get(plantName);
      // Update the amount of specified plant in the inventory
      this.collectedPlants.set(plantName, count - 1);
      GameManager.coins += data.value;
      this.playSound("coin", 0.4);
      // Update the UI
      this.showInventory();
      document.getElementById('coinCounter').textContent = "Coins: " + GameManager.coins;
      this.saveGame();
    });

    // SELL ALL PLANTS IN THE INVENTORY
    document.getElementById('openPlantInventory').addEventListener("click", (e) => {
      if (e.target.id !== "sellAllButton") return;

      let totalCoins = 0;

      this.collectedPlants.forEach((count, plant) => {
        if (count <= 0) return;
        const data = PLANT_DATA[plant];
        if (!data) return;

        this.collectedPlants.set(plant, 0);
        totalCoins += data.value * count;
      });

      if (totalCoins == 0) return;

      GameManager.coins += totalCoins;
      this.playSound("coin", 0.4);

      this.showInventory();
      document.getElementById('coinCounter').textContent = "Coins: " + GameManager.coins;
      this.saveGame();
    });


    // SELECT THE PLANT
    document.getElementById('plantSelection').addEventListener("click", (e) => {
      if (!e.target.classList.contains("plantSeed")) return;
      this.selectedPlantType = e.target.textContent.split(" ")[0];
    });


    // DETECTS THE DAY CYCLE AND CHECK ALL PLANTS
    GameManager.on("day_advanced", () => {
      document.getElementById('dayCounter').textContent = `Day ${GameManager.currentDay}`;
      this.plants.forEach(plant => {
        plant.dry();
        plant.checkHealth();
      });

      this.playSound("newDay", 0.4, false);
      this.saveGame();

      if (!this.selectedPlant) return;
      // Update the info in case a plant was selected
      this.showPlantInfo(this.selectedPlant);
    });

  }

  /*

  :) :) :) :) :) :) :) :) :) :) :) :) :) :) :)


  Ignore
  This
  Comment
  Is
  Just
  A
  Separator

  
   :) :) :) :) :) :) :) :) :) :) :) :) :) :) :)

  */

  update(time, delta) {
    // runs every single frame
    this.dayTimer = (this.dayTimer + delta) % this.dayDuration;
    const progress = this.dayTimer / this.dayDuration;

    let alpha = 0;

    if (progress > 0.5 && progress <= 0.7) {
      alpha = ((progress - 0.5) / 0.2) * 0.6;
    } else if (progress > 0.7 && progress <= 0.85) {
      alpha = 0.6;
    } else if (progress > 0.85) {
      alpha = (1 - (progress - 0.85) / 0.15) * 0.6;
    }

    this.nightOverlay.setAlpha(Phaser.Math.Clamp(alpha, 0, 0.6));
  }

    /*

  :) :) :) :) :) :) :) :) :) :) :) :) :) :) :)


  Ignore
  This
  Comment
  Is
  Just
  A
  Separator

  
   :) :) :) :) :) :) :) :) :) :) :) :) :) :) :)

  */

  playSongs(index) {
    const song = this.songsPlaylist[index];
    const next = this.sound.add(song, {volume: 0});
    next.play();

    this.tweens.add({
      targets: next,
      volume: this.targetVolume,
      duration: this.fade,
    });

    if (this.currentMusic && this.currentMusic.isPlaying) {
      const old = this.currentMusic;
      this.tweens.add({
        target: old,
        volume: 0,
        duration: this.fade,
        onComplete: () => {
          old.stop();
          old.destroy();
        }
      });
    }

    this.currentMusic = next;

    this.currentMusic.once("complete", () => {
      this.nextTrack();
    });
  }

  nextTrack() {
    this.currentIndex = (this.currentIndex + 1) % this.songsPlaylist.length;
    this.playSongs(this.currentIndex);
  } 

  // UPDATE THE PANEL SHOWING ALL PLANT INFO
  showPlantInfo(plant) {
    const emptyText = document.getElementById('emptyPlantInfo');
    const details = document.getElementById('plantInfoDetails');

    // If no plant is selected hide everything
    if (plant == null) {
      emptyText.style.display = "";
      details.classList.add("hidden");
      this.selectedPlant = null;
      return;
    }

    // Display all the info
    this.selectedPlant = plant
    emptyText.style.display = "none";
    details.classList.remove("hidden");
    document.getElementById('emptyPlantInfo').style.display = "none";
    document.getElementById('plantInfoImage').src = `assets/art/${plant.plantName}_stage_${plant.currentStage}.png`;
    document.getElementById('plantInfoTitle').textContent = plant.plantName;
    document.getElementById('plantInfoWaterStatus').textContent = "Plant Status: " + plant.getStatus();
    document.getElementById('plantInfoWater').textContent = "Current Water Level: " + plant.waterLevel;
    document.getElementById('plantInfoWaterRange').textContent = "Water Range: [" + plant.minWaterLevel + " , " + plant.maxWaterLevel + "]";
    document.getElementById('plantInfoGrowthDays').textContent = "Days to grow: " + plant.growthDays;
    document.getElementById('plantInfoCurrentDays').textContent = "Days alive: " + plant.currentDays;
    document.getElementById('plantInfoUnhealthyDays').textContent = "Days unhealthy: " + plant.daysUnhealthy;
    document.getElementById('plantInfoValue').textContent = "Value: " + plant.value + " coins";
    document.getElementById('plantInfo').classList.remove("hidden");
  }

  // PLANT THE PLANT IN THE SELECTED VASE
  plant(vase) {
    // Get all the info of the selected plant
    const data = PLANT_DATA[this.selectedPlantType];
    if (!data) return;

    const cost = data.cost;

    if (GameManager.coins < cost) {
      alert("Insufficient coins!");
      return;
    }

    // Create the plant with all the data retrieved
    const newPlant = new Plant(this, vase.x, vase.y, this.selectedPlantType, data.maxWater, data.minWater, data.starterWater, data.growthDays, vase, data.value);
    GameManager.coins -= cost;

    this.playSound("planting", 0.4, false);
    
    document.getElementById('coinCounter').textContent = "Coins: " + GameManager.coins;
    this.plants.push(newPlant);
    // Hide the vase and flag is as full
    vase.isEmpty = false;
    vase.setVisible(false);

    this.selectedPlantType = null; 
    this.saveGame();   
  }

  // ADD PLANT TO INVENTORY
  addToInventory(plantName) {
     if (this.collectedPlants.has(plantName)) {
      const count = this.collectedPlants.get(plantName);
      this.collectedPlants.set(plantName, count + 1);
    } else {
      this.collectedPlants.set(plantName, 1);
    }

    this.showInventory();
  }

  // UPDATE THE INVENTORY UI
  showInventory() {
    let totalCount = 0;
    this.collectedPlants.forEach((count, plant) => {
      if (count >= 1) totalCount += count;
    });
    if (this.collectedPlants.size == 0 || totalCount == 0) {
      document.getElementById('emptyInventory').style.display = "block";
    } else {
      document.getElementById('emptyInventory').style.display = "none";
    }

    // Delete all previous entries
    const children = Array.from(document.getElementById('plantInventory').children);
    children.forEach(child => {
      if (child.id != "emptyInventory") {
        child.remove();
      }
    })

    // Add a div for each plant with corresponding amount and sell button
    this.collectedPlants.forEach((value, plant) => {
      if (value == 0) return;
      const div = document.getElementById('plantInventory').appendChild(document.createElement("div"));
      div.classList.add("collectedPlant");
      div.textContent = plant + " x" + value;

      const span = div.appendChild(document.createElement("span"));
      span.classList.add("sellBtn");
      span.textContent = "Sell"; 
    });
  }

  // SAVE ALL THE DATA
  saveGame() {
  
    const plantsData = this.plants.map(plant => {
      return {
        plantName: plant.plantName,
        waterLevel: plant.waterLevel,
        currentDays: plant.currentDays,
        daysUnhealthy: plant.daysUnhealthy,
        isGrown: plant.isGrown,
        isDead: plant.isDead,
        vaseIndex: this.vases.indexOf(plant.vase)
      };
    });

    const vasesData = this.vases.map(vase => {
      return {
        x: vase.x,
        y: vase.y,
      }
    });

    const lockedData = this.lockedVases.map(vase => {
      return {
        x: vase.x,
        y: vase.y,
        price: vase.price,
      }
    })

    const saveData = {
      collectedPlants: Array.from(this.collectedPlants.entries()),
      plants: plantsData,
      vases: vasesData,
      lockedVases: lockedData,
      currentDay: GameManager.currentDay,
      coins: GameManager.coins
    };

    localStorage.setItem("gameData", JSON.stringify(saveData));
  }

  // LOAD THE SAVED DATA
  loadGame() {
    const gameData = localStorage.getItem("gameData");
    if (!gameData) return;

    const saveData = JSON.parse(gameData);

    GameManager.currentDay = saveData.currentDay;
    GameManager.coins = saveData.coins;

    this.collectedPlants = new Map(saveData.collectedPlants);

    this.vases = saveData.vases.map(vase => new Vase(this, vase.x, vase.y));

    this.lockedVases = saveData.lockedVases.map(vase => new LockedVase(this, vase.x, vase.y, vase.price, vase.price.toString()));

    saveData.plants.forEach(plant => {
      const vase = this.vases[plant.vaseIndex];
      const data = PLANT_DATA[plant.plantName];
      const newPlant = new Plant(this, vase.x, vase.y, plant.plantName, data.maxWater, data.minWater, plant.waterLevel, data.growthDays, vase, data.value)
    
      newPlant.currentDays = plant.currentDays;
      newPlant.daysUnhealthy = plant.daysUnhealthy;
      newPlant.isGrown = plant.isGrown;
      newPlant.isDead = plant.isDead;

      newPlant.growthChange();
      newPlant.updateNotifications();

      this.plants.push(newPlant);
      vase.isEmpty = false;
      vase.setVisible(false);
    });
  }

  // UNLOCK VASE WHEN CLICKING ON IT
  unlock(vase) {
    if (GameManager.coins < vase.price) {
      alert("Too expensive :P");
      return;
    }

    GameManager.coins -= vase.price;
    const newVase = new Vase(this, vase.x, vase.y);
    this.vases.push(newVase);

    const index = this.lockedVases.indexOf(vase);
    if (index != -1) {
      this.lockedVases.splice(index, 1);
    }

    this.playSound("unlocking", 0.6, false);
    vase.destroy();

    document.getElementById('coinCounter').textContent = "Coins: " + GameManager.coins;
    this.saveGame();
  }

  // SPAWN BUGS
  spawnBug() {
      if (this.bugs.length < 3) {
        const plants = this.plants.filter(plant => {
          const hasBug = this.bugs.some(bug => bug.plant == plant);
          return !hasBug;
        })
  
        if (plants.length > 0) {
          const plant = Phaser.Utils.Array.GetRandom(plants);
    
          const bug = new Bug(this, plant, 5);
          bug.on("destroy", () => {
            const index = this.bugs.indexOf(bug);
            if (index != -1) this.bugs.splice(index, 1);
          });
    
          this.bugs.push(bug);
        }
      } 

      const delay = Phaser.Math.Between(60_000, 180_000);
      this.time.delayedCall(delay, this.spawnBug, [], this);
  }

  playSound(key, baseVolume = 0.5, randomPitch = true) {
    const config = {
      volume: baseVolume,
    };

    if (randomPitch) {
      config.rate = Phaser.Math.FloatBetween(0.92, 1.08);
    }

    this.sound.play(key, config)
  }
}
