// dish.controller.js
const dishTypeService = require('../services/dishType.service');
const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");

class DishTypeController {

  async createDishType(req, res, next) {
  if (!req.body?.DishTypeName) {
    return next(new ApiError(400, "Name cannot be empty"));
  }

  try {
    const dishType = await dishTypeService.createDishType(req.body);
    res.status(201).json(dishType);
  } catch (error) {
    console.log('Error detected:', error);

    return next(new ApiError(500, "An error occurred while creating dish"));
  }
}


  async getDishTypeById(req, res) {
    try {
      const dishType = await dishTypeService.getDishTypeById(req.params.id);
      if (!dishType) {
        return res.status(404).json({ message: 'Dish Type not found' });
      }
      res.status(200).json(dishType);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllDishType(req, res) {
    try {
      const dishTypes = await dishTypeService.getAllDishTypes();
      res.status(200).json(dishTypes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateDishType(req, res) {
    try {
      const updatedDishType = await dishTypeService.updateDishType(req.params.id, req.body);
      res.status(200).json(updatedDishType);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteDishType(req, res) {
    try {
      await dishTypeService.deleteDish(req.params.id);
      res.status(204).json();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DishTypeController();