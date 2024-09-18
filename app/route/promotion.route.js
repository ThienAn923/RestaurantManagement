const express = require("express");
const PromotionController = require("../controllers/promotion.controller.js");

const router = express.Router();

router.route("/")
    .get(PromotionController.getAllPromotions)
    .post(PromotionController.createPromotion)

router.route("/:id")
    .get(PromotionController.getPromotionById)
    .put(PromotionController.updatePromotion)
    .delete(PromotionController.deletePromotion);

module.exports = router;

