const express = require("express");
const ClientController = require("../controllers/client.controller.js");

const router = express.Router();

router
  .route("/")
  .get(ClientController.getAllClients)
  .post(ClientController.createClient);

router
  .route("/:id")
  .get(ClientController.getClientById)
  .put(ClientController.updateClient)
  .delete(ClientController.deleteClient);

router.route("/:id/ban").put(ClientController.banClient);
router.route("/:id/unban").put(ClientController.unbanClient);

router.route("/verified").post(ClientController.verifyOtp);
module.exports = router;
