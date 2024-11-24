// import clientTemporaryController from "../controller/clientTemporary.controller";
// import express from "express";
const clientTemporaryController = require("../controllers/clientTemporary.controller.js");
const express = require("express");
const router = express.Router();

router
  .route("/")
  .get(clientTemporaryController.getAllClientsTemporary)
  .post(clientTemporaryController.createClientTemporary);
router
  .route("/:id")
  .get(clientTemporaryController.getClientTemporaryById)
  .put(clientTemporaryController.updateClientTemporary)
  .delete(clientTemporaryController.deleteClientTemporary);

module.exports = router;
