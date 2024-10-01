const ingredientService = require('../services/ingredient.service');
const ApiError = require("../api-error");

class IngredientController {
    async createIngredient(req, res, next) {
        try {
            const ingredient = await ingredientService.createIngredient(req.body);
            console.log("create ingredient testing");
            return res.status(201).json(ingredient);
        } catch (error) {
            throw new ApiError(500, error.message);
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
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const result = await ingredientService.getAllIngredients(page, limit);
            res.status(200).json(result);
        } catch (error) {
            return next(new ApiError(500, error.message));
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
            return next(new ApiError(500, error.message));
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

module.exports = new IngredientController();