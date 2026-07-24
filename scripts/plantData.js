// Collection of all available plants for creation
export const PLANT_DATA = {
  Daisy: {
    minWater: 30,
    maxWater: 80,
    starterWater: 50,
    growthDays: 1,
    cost: 3,
    value: 5,
    growthCheckpoint: [1, 1]
  },
  Tulip: {
    minWater: 20,
    maxWater: 70,
    starterWater: 40,
    growthDays: 2,
    cost: 5,
    value: 9,
    growthCheckpoint: [1, 2]
  },
  Rose: {
    minWater: 30,
    maxWater: 90,
    starterWater: 50,
    growthDays: 4,
    cost: 15,
    value: 27,
    growthCheckpoint: [1, 3]
  },
  Sunflower: {
    minWater: 50,
    maxWater: 100,
    starterWater: 70,
    growthDays: 6,
    cost: 30,
    value: 60,
    growthCheckpoint: [2, 5]
  },
}
