const invoiceService = require('../services/invoice.service');
const ApiError = require("../api-error");

class InvoiceController {
    async createInvoice(data) {
        try {
            const invoice = await invoiceService.createInvoice(data);
            return invoice;
        } catch (error) {
            throw new ApiError(500, "An error occurred while creating invoice");
        }
    }
    
    async getInvoiceById(req, res, next) {
        try {
            const invoice = await invoiceService.getInvoiceById(req.params.id);
            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
            res.status(200).json(invoice);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving invoice"));
        }
    }
    
    async getAllInvoices(req, res, next) {
        try {
            const invoices = await invoiceService.getAllInvoices();
            res.status(200).json(invoices);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving invoices"));
        }
    }
}