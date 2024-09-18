const express = require("express");
const IngredientTypeController = require("../controllers/ingredientType.controller.js");


const router = express.Router();

router.route("/")
    .get(IngredientTypeController.getAllIngredientTypes)
    .post(IngredientTypeController.createIngredientType)

router.route("/:id")
    .get(IngredientTypeController.getIngredientTypeById)
    .put(IngredientTypeController.updateIngredientType)
    .delete(IngredientTypeController.deleteIngredientType);

module.exports = router;