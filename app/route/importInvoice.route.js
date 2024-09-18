const express = require("express");
const ImportInvoiceController = require("../controllers/importInvoice.controller.js");

const router = express.Router();

router.route("/")
    .get(ImportInvoiceController.getAllImportInvoices)
    .post(ImportInvoiceController.createImportInvoice)

router.route("/:id")
    .get(ImportInvoiceController.getImportInvoiceById)

module.exports = router;
