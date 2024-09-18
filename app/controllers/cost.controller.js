// dish.controller.js
const CostService = require('../services/cost.service');
const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");

class CostController {
  async createCost(req, res, next) {
    if (!req.body?.name) {
      return next(new ApiError(400, "Name cannot be empty"));
    }

    try {
      const cost = await CostService.createCost(req.body);
      res.status(201).json(dish);
    } catch (error) {
      console.log('Error detected:', error);

      return next(new ApiError(500, "An error occurred while adding cost to the dish"));
    } 
  }

  async getCostByDish(req, res) {
    try {
      const cost = await CostService.getCostAfterDish(req.params.id);
      if (!cost) {
        return res.status(404).json({ message: 'Cost for this dish not found' });
      }
      res.status(200).json(cost);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CostController();
