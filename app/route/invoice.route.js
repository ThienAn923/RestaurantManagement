const express = require("express");
const InvoiceController = require("../controllers/invoice.controller.js");

const router = express.Router();

router.route("/")
    .get(InvoiceController.getAllInvoices)
    .post(InvoiceController.createInvoice)

router.route("/:id")
    .get(InvoiceController.getInvoiceById)

module.exports = router;