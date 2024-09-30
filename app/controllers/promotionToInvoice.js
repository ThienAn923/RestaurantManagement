const promotionToInvoiceService = new PromotionToInvoiceService();
const ApiError = require("../api-error");

class PromotionToInvoiceController {
    async createPromotionToInvoice(req, res, next) {
        try {
            const promotionToInvoice = await promotionToInvoiceService.createPromotionToInvoice(req.body);
            return promotionToInvoice;
        } catch (error) {
            throw new ApiError(500, error.message);
        }
    }

    async getPromotionToInvoiceById(req, res, next) {
        try {
            const promotionToInvoice = await promotionToInvoiceService.getPromotionToInvoiceById(req.params.id);
            if (!promotionToInvoice) {
                return res.status(404).json({ message: 'PromotionToInvoice not found' });
            }
            res.status(200).json(promotionToInvoice);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }

    async getAllPromotionToInvoice(req, res, next) {
        try {
            const promotionToInvoices = await promotionToInvoiceService.getAllPromotionToInvoice();
            res.status(200).json(promotionToInvoices);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }

    async getAllAfterInvoiceId(req, res, next) {
        try {
            const promotionToInvoices = await promotionToInvoiceService.getAllAfterInvoiceId(req.params.invoiceId);
            res.status(200).json(promotionToInvoices);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }
}