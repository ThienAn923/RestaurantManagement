const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class IngredientTypeService {
    async createIngredientType(data) {
        return await prisma.ingredientType.create({ data });
    }

    async getIngredientTypeById(id) {
        return await prisma.ingredientType.findUnique({
            where: { id },
        });
    }

    async getAllIngredientTypesVIP() {
        return await prisma.ingredientType.findMany({
            where: { isDeleted: false },
        });
    }

    //pinia
    async getAllIngredientTypes(page = 1, limit = 5) {
        const skip = (page - 1) * limit;
        const [ingredientTypes, total] = await Promise.all([
        prisma.ingredientType.findMany({
            where: { isDeleted: false },
            skip,
            take: limit,
            orderBy: { ingredientTypeName: 'asc' },
        }),
        prisma.ingredientType.count({ where: { isDeleted: false } }),
        ]);
    
        return {
        ingredientTypes,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        };
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

module.exports = new IngredientTypeService();