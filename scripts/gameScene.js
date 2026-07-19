import { GameManager } from "./gameManager.js";
import { Plant } from "./plant.js";
import { Vase } from "./vase.js";
import { PLANT_DATA } from "./plantData.js";
import { LockedVase } from "./lockedVase.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }
  
  
  preload() {
    // runs once before create()
    this.load.image("background", "assets/game_view_sketch.png");
    this.load.image("lockedTexture", "assets/lockedVase.png");
    this.load.image("vaseTexture", "assets/vase.png");
    this.load.image("rose", "assets/rose_stage_3.png");
    this.load.image("tulip", "assets/tulip_stage_3.png");
    this.load.image("sunflower", "assets/sunflower_stage_3.png");
  }

  create() {
    // runs once
    this.add.image(640, 360, "background")

    this.collectedPlants = new Map();
    this.plants = [];
    this.selectedPlantType = null;
    this.lockedVases = [];
    this.vases = [];

    const save = localStorage.getItem("gameData");
    if (save) {
      this.loadGame();
    } else {
      this.lockedVases = [
        new LockedVase(this, 400, 260, 70),
        new LockedVase(this, 800, 260, 100),
        new LockedVase(this, 900, 260, 100),  
      ];

      this.vases = [
        new Vase(this, 300, 260)
      ];
    }

    document.getElementById('dayCounter').textContent = "Day: " + GameManager.currentDay;
    document.getElementById('coinCounter').textContent = "Coins: " + GameManager.coins;
    this.showInventory();

    document.getElementById('advanceDayBtn').addEventListener("click", () => {
      GameManager.advanceDay();
    });


    // WATER CURRENTLY SELECTED PLANT
    document.getElementById('waterBtn').addEventListener("click", () => {
      if (!this.selectedPlant) return;
      this.selectedPlant.water();
      this.showPlantInfo(this.selectedPlant);
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
      if (this.selectedPlant.isDead) return;

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
      // Update the UI
      this.showInventory();
      document.getElementById('coinCounter').textContent = "Coins: " + GameManager.coins;
      this.saveGame();
    });

    // SELL ALL PLANTS IN THE INVENTORY
    document.getElementById('openPlantInventory').addEventListener("click", (e) => {
      if (e.target.id !== "sellAllButton") return;

      this.collectedPlants.forEach((count, plant) => {
        if (count <= 0) return;
        const data = PLANT_DATA[plant];
        if (!data) return;

        this.collectedPlants.set(plant, 0);
        GameManager.coins += data.value * count;
      });

      this.showInventory();
      document.getElementById('coinCounter').textContent = "Coins: " + GameManager.coins;
      this.saveGame();
    });


    // SELECT THE PLANT
    document.getElementById('plantSelection').addEventListener("click", (e) => {
      if (!e.target.classList.contains("plantSeed")) return;
      this.selectedPlantType = e.target.textContent.split(" ")[0];
      console.log(this.selectedPlantType)
    });


    // DETECTS THE DAY CYCLE AND CHECK ALL PLANTS
    GameManager.on("day_advanced", () => {
      document.getElementById('dayCounter').textContent = `Day ${GameManager.currentDay}`;
      this.plants.forEach(plant => {
        plant.dry();
        plant.checkHealth();
      });

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

  // UPDATE THE PANEL SHOWING ALL PLANT INFO
  showPlantInfo(plant) {
    // If no plant is selected hide everything
    if (plant == null) {
      document.getElementById('emptyPlantInfo').style.display = "";
      document.getElementById('plantInfo').classList.add("hidden");
      this.selectedPlant = null;
      return;
    }

    // Display all the info
    this.selectedPlant = plant
    document.getElementById('emptyPlantInfo').style.display = "none";
    document.getElementById('plantInfoTitle').textContent = plant.plantName;
    document.getElementById('plantInfoWater').textContent = "Water: " + plant.waterLevel;
    document.getElementById('plantInfoGrowthDays').textContent = "Days to grow: " + plant.growthDays;
    document.getElementById('plantInfoCurrentDays').textContent = "Days alive: " + plant.currentDays;
    document.getElementById('plantInfoUnhealthyDays').textContent = "Days unhealthy: " + plant.daysUnhealthy;
    document.getElementById('plantInfoValue').textContent = "Value: " + plant.value + " coins";
    document.getElementById('waterBtn').textContent = "Water";
    document.getElementById('harvestBtn').textContent = "Harvest";
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
    
    document.getElementById('coinCounter').textContent = "Coins: " + GameManager.coins;
    alert("Planted: " + this.selectedPlantType);
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

  saveGame() {
  
    const plantsData = this.plants.map(plant => {
      return {
        plantName: plant.plantName,
        waterLevel: plant.waterLevel,
        currentDays: plant.currentDays,
        daysUnhealthy: plant.daysUnhealthy,
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

  loadGame() {
    const gameData = localStorage.getItem("gameData");
    if (!gameData) return;

    const saveData = JSON.parse(gameData);

    GameManager.currentDay = saveData.currentDay;
    GameManager.coins = saveData.coins;

    this.collectedPlants = new Map(saveData.collectedPlants);

    this.vases = saveData.vases.map(vase => new Vase(this, vase.x, vase.y));

    this.lockedVases = saveData.lockedVases.map(vase => new LockedVase(this, vase.x, vase.y, vase.price));

    saveData.plants.forEach(plant => {
      const vase = this.vases[plant.vaseIndex];
      const data = PLANT_DATA[plant.plantName];
      const newPlant = new Plant(this, vase.x, vase.y, plant.plantName, data.maxWater, data.minWater, plant.waterLevel, data.growthDays, vase, data.value)
    
      newPlant.currentDays = plant.currentDays;
      newPlant.daysUnhealthy = plant.daysUnhealthy;

      this.plants.push(newPlant);
      vase.isEmpty = false;
      vase.setVisible(false);
    });
  }

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

    vase.destroy();

    document.getElementById('coinCounter').textContent = "Coins: " + GameManager.coins;
    this.saveGame();
  }
}
