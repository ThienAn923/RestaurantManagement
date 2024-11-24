const qrCodeService = require('../services/qr.service');
const ApiError = require("../api-error");

class qrController {
    async createQrCode(req, res, next) {
        try {
            const qrCode = await qrCodeService.createQrCode(req.body);
            res.status(201).json(qrCode);
        } catch (error) {
            throw new ApiError(500, error.message);
        }
    }

    async getQrCodeById(req, res, next) {
        try {
            const qrCode = await qrCodeService.getQrCodeById(req.params.id);
            if (!qrCode) {
                return res.status(404).json({ message: 'QrCode not found' });
            }
            res.status(200).json(qrCode);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving qrCode"));
        }
    }
}

module.exports = new ProviderController();