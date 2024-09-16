const express = require("express");
const ImportInvoiceController = require("../controllers/importInvoice.controller.js");
const { route } = require("../../app.js");

const router = express.Router();

router.route("/")
    .get(ImportInvoiceController.getAllImportInvoices)
    .post(ImportInvoiceController.createImportInvoice)

router.route("/:id")
    .get(ImportInvoiceController.getImportInvoiceById)
    .put(ImportInvoiceController.updateImportInvoice)
    .delete(ImportInvoiceController.deleteImportInvoice);