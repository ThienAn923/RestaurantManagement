const express = require("express");
const PositionController = require("../controllers/position.controller.js");
const { route } = require("../../app.js");

const router = express.Router();

router.route("/")
    .get(PositionController.getAllPositions)
    .post(PositionController.createPosition)

router.route("/:id")
    .get(PositionController.getPositionById)
    .put(PositionController.updatePosition)
    .delete(PositionController.deletePosition);