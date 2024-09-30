const PointUsageService = require('../services/pointUsage.service');
const ApiError = require("../api-error");

class PointUsageController {
    async createPointUsage(req, res, next) {
        try {
            const pointUsage = await PointUsageService.createPointUsage(req.body);
            return pointUsage;
        } catch (error) {
            throw new ApiError(500, error.message);
        }
    }

    async getPointUsageById(req, res, next) {
        try {
            const pointUsage = await PointUsageService.getPointUsageById(req.params.id);
            if (!pointUsage) {
                return res.status(404).json({ message: 'PointUsage not found' });
            }
            res.status(200).json(pointUsage);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }

    async getAllPointUsages(req, res, next) {
        try {
            const pointUsages = await PointUsageService.getAllPointUsages();
            res.status(200).json(pointUsages);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }

    async getAllPointUsagesRegardingClient(req, res, next) {
        try {
            const pointUsages = await PointUsageService.getAllPointUsagesRegardingClient(req.params.clientId);
            res.status(200).json(pointUsages);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }
}