const expenseService = require('../services/expense.service');
const ApiError = require("../api-error");

class ExpenseController {
    
    async createExpense(req, res, next) {
        try {
            const expense = await expenseService.createExpense(req.body);
            res.status(201).json(expense);
        } catch (error) {
            console.log('Error detected:', error);
            return next(new ApiError(500, error.message));
        }
    }

    async getExpenseById(req, res, next) {
        try {
            const expense = await expenseService.getExpenseById(req.params.id);
            if (!expense) {
                return res.status(404).json({ message: 'Expense not found' });
            }
            res.status(200).json(expense);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }

    async getAllExpenses(req, res, next) {
        try {
            const { page = 1, limit = 5 } = req.query
            let result
            if(req.query.page && req.query.limit) {
                result = await expenseService.getAllExpenses(parseInt(page), parseInt(limit), req.query.sortColumn, req.query.sortOrder, req.query.search)
            } else {
                result = await expenseService.getAllExpensesREAL()
            }
            res.status(200).json(result)
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }

    async updateExpense(req, res, next) {
        try {
            const updatedExpense = await expenseService.updateExpense(req.params.id, req.body);
            res.status(200).json(updatedExpense);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while updating expense" + error.message));
        }
    }

    async deleteExpense(req, res, next) {
        try {
            await expenseService.deleteExpense(req.params.id);
            res.status(204).json();
        } catch (error) {
            return next(new ApiError(500, "An error occurred while deleting expense" + error.message));
        }
    }

}

module.exports = new ExpenseController();