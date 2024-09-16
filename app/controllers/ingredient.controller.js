const ingredientService = require('../services/ingredient.service');
const ApiError = require("../api-error");

class IngredientController {
    async createIngredient(data) {
        try {
            const ingredient = await ingredientService.createIngredient(data);
            return ingredient;
        } catch (error) {
            throw new ApiError(500, "An error occurred while creating ingredient");
        }
    }
    
    async getIngredientById(req, res, next) {
        try {
            const ingredient = await ingredientService.getIngredientById(req.params.id);
            if (!ingredient) {
                return res.status(404).json({ message: 'Ingredient not found' });
            }
            res.status(200).json(ingredient);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving ingredient"));
        }
    }
    
    async getAllIngredients(req, res, next) {
        try {
            const ingredients = await ingredientService.getAllIngredients();
            res.status(200).json(ingredients);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving ingredients"));
        }
    }

    async updateIngredient(req, res, next) {
        try {
            const ingredient = await ingredientService.updateIngredient(req.params.id, req.body);
            if (!ingredient) {
                return res.status(404).json({ message: 'Ingredient not found' });
            }
            res.status(200).json(ingredient);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while updating ingredient"));
        }
    }

    async deleteIngredient(req, res, next) {
        try {
            const ingredient = await ingredientService.deleteIngredient(req.params.id);
            if (!ingredient) {
                return res.status(404).json({ message: 'Ingredient not found' });
            }
            res.status(200).json({ message: 'Ingredient deleted successfully' });
        } catch (error) {
            return next(new ApiError(500, "An error occurred while deleting ingredient"));
        }
    }
}