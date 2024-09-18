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
            where: { isDeleted: false },
        });
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