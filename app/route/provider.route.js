const express = require("express");
const ProviderController = require("../controllers/provider.controller.js");

const router = express.Router();

router.route("/")
    .get(ProviderController.getAllProviders)
    .post(ProviderController.createProvider)

router.route("/:id")
    .get(ProviderController.getProviderById)
    .put(ProviderController.updateProvider)
    .delete(ProviderController.deleteProvider);

module.exports = router;