const express = require("express");
const InvoiceController = require("../controllers/invoice.controller.js");

const router = express.Router();
router.route("/")
    .get(InvoiceController.getAllInvoices)
    .post(InvoiceController.createInvoice)

//This is named getTotalIncome, but it actually returns both income and multiple type of expense, too lazy to change
router.route("/getTotalIncome")
    .get(InvoiceController.getTotalIncome)
router.route ("/getCustomIncome")
    .get(InvoiceController.getCustomIncomeData)

router.route("/recentInvoice")
    .get(InvoiceController.getRecentInvoice)
router.route("/incomeData")
    .get(InvoiceController.getIncomeData)
router.route("/topDish")
    .get(InvoiceController.getTopDish)

router.route("/:id")
    .get(InvoiceController.getInvoiceById)

module.exports = router;