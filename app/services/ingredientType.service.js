const prisma = require('../../prisma/ingredientType');

class IngredientTypeService {
    async createIngredientType(data) {
        return await prisma.ingredientType.create({ data });
    }

    async getIngredientTypeById(id) {
        return await prisma.ingredientType.findUnique({
            where: { id },
        });
    }

    async getAllIngredientTypes() {
        return await prisma.ingredientType.findMany({
            where: { isDeleted: false },
        });
    }

    async updateIngredientType(id, data) {
        return await prisma.ingredientType.update({
            where: { id },
            data,
        });
    }

    async deleteIngredientType(id) {
        return await prisma.ingredientType.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
}