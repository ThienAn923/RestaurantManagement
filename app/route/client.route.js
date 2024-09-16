const express = require("express");
const ClientController = require("../controllers/client.controller.js");
const { route } = require("../../app.js");

const router = express.Router();

router.route("/")
    .get(ClientController.getAllClients)
    .post(ClientController.createClient)

router.route("/:id")
    .get(ClientController.getClientById)
    .put(ClientController.updateClient)
    .delete(ClientController.deleteClient);