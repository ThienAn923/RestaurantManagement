const express = require("express");
const { route } = require("../../app.js");
const DishTypeController = require("../controllers/dishType.controller.js");

const router = express.Router();

router.route("/")
    .get(DishTypeController.getAllDishType)
    .post(DishTypeController.createDishType)

router.route("/:id")
    .get(DishTypeController.getDishTypeById)
    .put(DishTypeController.updateDishType)
    .delete(DishTypeController.deleteDishType);

module.exports = router;