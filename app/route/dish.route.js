const express = require("express");
const DishController = require("../controllers/dish.controller.js");
const { route } = require("../../app.js");

const router = express.Router();

router.route("/")
    .get(DishController.getAllDishes)
    .post(DishController.createDish)
    // .delete(DishController.deleteAll);


router.route("/:id")
    .get(DishController.getDishById)
    .put(DishController.updateDish)
    .delete(DishController.deleteDish);

module.exports = router;