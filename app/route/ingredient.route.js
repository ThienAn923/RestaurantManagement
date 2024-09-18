const express = require("express");
const IngredientController = require("../controllers/ingredient.controller.js");


const router = express.Router();

router.route("/")
    .get(IngredientController.getAllIngredients)
    .post(IngredientController.createIngredient)

router.route("/:id")
    .get(IngredientController.getIngredientById)
    .put(IngredientController.updateIngredient)
    .delete(IngredientController.deleteIngredient);

module.exports = router;