const express = require("express");
const TableController = require("../controllers/table.controller.js");
const { route } = require("../../app.js");

const router = express.Router();

router.route("/")
    .get(TableController.getAllTables)
    .post(TableController.createTable)

router.route("/:id")
    .get(TableController.getTableById)
    .put(TableController.updateTable)
    .delete(TableController.deleteTable);