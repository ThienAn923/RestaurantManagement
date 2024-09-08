// dish.controller.js
const DishService = require('../services/dish.service');
const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");

class DishController {
  async createDish(req, res) {
    
    if(!req.body?.name){
        return next(new ApiError(400, "Name cannot be empty"));
    }

    try {
      const dish = await DishService.createDish(req.body);
      res.status(201).json(dish);
    } catch (error) {
      return next(
            new ApiError(500, "An error occured while creating contact")
        );
    }
  }

  async getDishById(req, res) {
    try {
      const dish = await DishService.getDishById(req.params.id);
      if (!dish) {
        return res.status(404).json({ message: 'Dish not found' });
      }
      res.status(200).json(dish);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllDishes(req, res) {
    try {
      const dishes = await DishService.getAllDishes();
      res.status(200).json(dishes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateDish(req, res) {
    try {
      const updatedDish = await DishService.updateDish(req.params.id, req.body);
      res.status(200).json(updatedDish);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteDish(req, res) {
    try {
      await DishService.deleteDish(req.params.id);
      res.status(204).json();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DishController();
