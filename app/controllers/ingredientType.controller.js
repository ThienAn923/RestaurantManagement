const ingredientTypeService = require('../services/ingredientType.service');
const ApiError = require("../api-error");

class IngredientTypeController {
    async createIngredientType(req, res, next) {
        try {
            const ingredientType = await ingredientTypeService.createIngredientType(req.body);
            return res.status(201).json(ingredientType);
        } catch (error) {
            throw new ApiError(500, "An error occurred while creating ingredient type");
        }
    }
    
    async getIngredientTypeById(req, res, next) {
        try {
            const ingredientType = await ingredientTypeService.getIngredientTypeById(req.params.id);
            if (!ingredientType) {
                return res.status(404).json({ message: 'Ingredient type not found' });
            }
            res.status(200).json(ingredientType);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }
    
    async getAllIngredientTypes(req, res, next) {
        try {
            //It was build like this to allow pagination also allowng to get all ingredient type in case no query is passed
            //THIS IS REALLY IMPORTANT even though it doesn;t look so lmao
            const { page, limit } = req.query;
            let result;
            if (page && limit) {
                result = await ingredientTypeService.getAllIngredientTypes(parseInt(page), parseInt(limit));
            } else {
                result = await ingredientTypeService.getAllIngredientTypesVIP();
            }
            res.status(200).json(result);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }

    async updateIngredientType(req, res, next) {
        try {
            const ingredientType = await ingredientTypeService.updateIngredientType(req.params.id, req.body);
            if (!ingredientType) {
                return res.status(404).json({ message: 'Ingredient type not found' });
            }
            res.status(200).json(ingredientType);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while updating ingredient type"));
        }
    }

    async deleteIngredientType(req, res, next) {
        try {
            const ingredientType = await ingredientTypeService.deleteIngredientType(req.params.id);
            if (!ingredientType) {
                return res.status(404).json({ message: 'Ingredient type not found' });
            }
            res.status(200).json({ message: 'Ingredient type deleted successfully' });
        } catch (error) {
            return next(new ApiError(500, "An error occurred while deleting ingredient type"));
        }
    }
}

module.exports = new IngredientTypeController();