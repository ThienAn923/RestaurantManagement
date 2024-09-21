const tableService = require('../services/table.service');
const ApiError = require("../api-error");

class TableController {
    async createTable(req, res, next) {
        try {
            const table = await tableService.createTable(req.body);
            res.status(201).json(table);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }
    
    async getTableById(req, res, next) {
        try {
            const table = await tableService.getTableById(req.params.id);
            if (!table) {
                return res.status(404).json({ message: 'Table not found' });
            }
            res.status(200).json(table);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving table"));
        }
    }
    
    async getAllTables(req, res, next) {
        try {
            const tables = await tableService.getAllTables();
            res.status(200).json(tables);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }

    async updateTable(req, res, next) {
        try {
            const table = await tableService.updateTable(req.params.id, req.body);
            if (!table) {
                return res.status(404).json({ message: 'Table not found' });
            }
            res.status(200).json(table);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while updating table"));
        }
    }

    async deleteTable(req, res, next) {
        try {
            const table = await tableService.deleteTable(req.params.id);
            if (!table) {
                return res.status(404).json({ message: 'Table not found' });
            }
            res.status(200).json({ message: 'Table deleted successfully' });
        } catch (error) {
            return next(new ApiError(500, "An error occurred while deleting table"));
        }
    }

    async getTableByNumber(req, res, next) {
        try {
            const table = await tableService.getTableByNumber(req.params.number);
            if (!table) {
                return res.status(404).json({ message: 'Table not found' });
            }
            res.status(200).json(table);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving table"));
        }
    }

    async getTableByStatus(req, res, next) {
        try {
            const table = await tableService.getTableByStatus(req.params.status);
            if (!table) {
                return res.status(404).json({ message: 'Table not found' });
            }
            res.status(200).json(table);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving table"));
        }
    }
}

module.exports = new TableController();