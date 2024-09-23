const invoiceDetailService = require('../services/invoiceDetailService');
const ApiError = require("../api-error");

class InvoiceDetailController {

    //this file exist for the sole purpose of creating invoice details for testing invoice.
    //In reality, this file is not needded because invoice details are created when an order is dealt with.
    async createInvoiceDetail(req, res, next) {
        try {
            const invoiceDetail = await invoiceDetailService.createInvoiceDetail(req.body);
            return invoiceDetail;
        } catch (error) {
            throw new ApiError(500, error.message);
        }
    }
}