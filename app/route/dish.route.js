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

module.exports = router;