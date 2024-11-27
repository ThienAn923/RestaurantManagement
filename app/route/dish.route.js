const express = require("express");
const DishController = require("../controllers/dish.controller.js");


const router = express.Router();

router.route("/")
    .get(DishController.getAllDishes)
    .post(DishController.createDish)


router.route("/:id")
    .get(DishController.getDishById)
    .put(DishController.updateDish)
    .delete(DishController.deleteDish);
    router.route("/type/:dishTypeId")
    .get(DishController.getDishesByDishTypeId)   
module.exports = router;