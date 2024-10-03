const positionService = require('../services/position.service');
const ApiError = require("../api-error");

class PositionController {
    async createPosition(req, res, next) {
        let totalEmployee = 9999; //Temporary value (will fix after figured out a way to count the number of employees)
        if (!req.body?.positionName) {
            return next(new ApiError(400, "Position Name must be filled"));
        }
        try {
            req.body.totalEmployee = totalEmployee; //this line is here just because total employee haven't been counted yet
            const position = await positionService.createPosition(req.body);
            res.status(201).json(position);
        } catch (error) {
            console.log('Error detected:', error);
            return next(new ApiError(500, error.message));
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

            let positions
            if(!req.query.sortColumn && !req.query.sortOrder && !req.query.page && !req.query.limit) {
                positions = await positionService.getAllPositionsREAL();
            } else {
                positions = await positionService.getAllPositions(page, limit, req.query.sortColumn, req.query.sortOrder);
            }
            // const positions = await positionService.getAllPositions(page, limit, req.query.sortColumn, req.query.sortOrder);
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