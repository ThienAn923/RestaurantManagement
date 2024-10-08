const importInvoiceService  = require('../services/importInvoice.service');
const ApiError = require("../api-error");

class ImportInvoiceController {
    async createImportInvoice(data) {
        try {
            const importInvoice = await importInvoiceService.createImportInvoice(data);
            return importInvoice;
        } catch (error) {
            throw new ApiError(500, "An error occurred while creating import invoice");
        }
    }
    
    async getImportInvoiceById(req, res, next) {
        try {
            const importInvoice = await importInvoiceService.getImportInvoiceById(req.params.id);
            if (!importInvoice) {
                return res.status(404).json({ message: 'Import invoice not found' });
            }
            res.status(200).json(importInvoice);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving import invoice"));
        }
    }
    
    async getAllImportInvoices(req, res, next) {
        try {
            const importInvoices = await importInvoiceService.getAllImportInvoices();
            res.status(200).json(importInvoices);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }
}

module.exports = new ImportInvoiceController();