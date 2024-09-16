const ingredientTypeService = require('../services/ingredientType.service');
const ApiError = require("../api-error");

class IngredientTypeController {
    async createIngredientType(data) {
        try {
            const ingredientType = await ingredientTypeService.createIngredientType(data);
            return ingredientType;
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
            return next(new ApiError(500, "An error occurred while retrieving ingredient type"));
        }
    }
    
    async getAllIngredientTypes(req, res, next) {
        try {
            const ingredientTypes = await ingredientTypeService.getAllIngredientTypes();
            res.status(200).json(ingredientTypes);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving ingredient types"));
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