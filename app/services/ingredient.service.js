const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class IngredientService {
    async createIngredient(data) {
        return await prisma.ingredient.create({ data });
    }

    async getIngredientById(id) {
        return await prisma.ingredient.findUnique({
            where: { id },
        });
    }

    async getAllIngredients() {
        return await prisma.ingredient.findMany({
            where: {
                isDeleted: false
            },
            include: {
                ingredientType: true // This will include the related ingredientType based on ingredientTypeID
            }
        });
    }   

    //pinia
    async getAllIngredients(page = 1, limit = 5) {
        const skip = (page - 1) * limit;
        const [ingredients, total] = await Promise.all([
        prisma.ingredient.findMany({
            where: { isDeleted: false },
            include: { ingredientType: true },
            skip,
            take: limit,
            orderBy: { ingredientName: 'asc' },
        }),
        prisma.ingredient.count({ where: { isDeleted: false } }),
        ]);

        return {
        ingredients,
        total,
        page,
        limit,
        };
    }
    


    async updateIngredient(id, data) {
        return await prisma.ingredient.update({
            where: { id },
            data,
        });
    }

    async deleteIngredient(id) {
        return await prisma.ingredient.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
}

module.exports = new IngredientService();