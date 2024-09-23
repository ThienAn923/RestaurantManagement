const positionService = require('../services/position.service');
const ApiError = require("../api-error");

class PositionController {
    async createPosition(req, res, next) {
        if (!req.body?.positionName) {
            return next(new ApiError(400, "Position Name must be filled"));
        }
        try {
            const position = await positionService.createPosition(req.body);
            res.status(201).json(position);
        } catch (error) {
            console.log('Error detected:', error);
            return next(new ApiError(500, "An error occurred while creating position"));
        }
    }

    async getPositionById(req, res, next) {
        try {
            const position = await positionService.getPositionById(req.params.id);
            if (!position) {
                return res.status(404).json({ message: 'Position not found' });
            }
            res.status(200).json(position);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving position"));
        }
    }

    // async getAllPositions(req, res, next) {
    //     try {
    //         const positions = await positionService.getAllPositions();
    //         res.status(200).json(positions);
    //     } catch (error) {
    //         return next(new ApiError(500, "An error occurred while retrieving positions"));
    //     }
    // }

    // pinia
    async getAllPositions(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const positions = await positionService.getAllPositions(page, limit);
            res.status(200).json(positions);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }

    async updatePosition(req, res, next) {
        try {
            const updatedPosition = await positionService.updatePosition(req.params.id, req.body);
            res.status(200).json(updatedPosition);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }

    async deletePosition(req, res, next) {
        try {
            await positionService.deletePosition(req.params.id);
            res.status(204).json();
        } catch (error) {
            return next(new ApiError(500, "An error occurred while deleting position"));
        }
    }
}

module.exports = new PositionController();