const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PromotionService {
    async createPromotion(data) {
        return await prisma.promotion.create({ data });
    }

    async getPromotionById(id) {
        return await prisma.promotion.findUnique({
            where: { id },
        });
    }

    async getAllPromotions() {
        return await prisma.promotion.findMany({
            where: { isDeleted: false },
        });
    }

    async updatePromotion(id, data) {
        return await prisma.promotion.update({
            where: { id },
            data,
        });
    }

    async deletePromotion(id) {
        return await prisma.promotion.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
}

module.exports = new PromotionService