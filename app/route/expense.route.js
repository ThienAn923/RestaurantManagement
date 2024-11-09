const express = require("express");
const ExpenseController = require("../controllers/expense.controller.js");

const router = express.Router();
router.route("/")
    .get(ExpenseController.getAllExpenses)
    .post(ExpenseController.createExpense)

//Some might be unused, so no backend function yet, becareful
router.route("/:id")
    .get(ExpenseController.getExpenseById)
    .put(ExpenseController.updateExpense)
    .delete(ExpenseController.deleteExpense);

module.exports = router;