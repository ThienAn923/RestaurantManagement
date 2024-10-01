const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PromotionAfterDishService {
    
    async createPromotionAfterDish(data) {
        const { promotionName, promotionDiscription, discount, startDate, endDate, dishID } = data;
        const promotion = await prisma.promotion.create({
            data: {
                promotionName,
                promotionDiscription,
                discount,
                startDate,
                endDate,
            }
        });
        const promotionAfterDish = await prisma.promotionAfterDish.create({
            data: {
                Promotion: {
                    connect: { id: promotion.id } 
                },
                Dish: {
                    connect: { id: dishID}
                }
            }
        });
        return {promotionAfterDish, promotion};
    }      

    async getPromotionAfterDishById(id) {
        return await prisma.promotionAfterDish.findUnique({
            where: { id },
            include:{
                promotion: true,
                dish: true,
            },
        });
    }

    async getAllPromotionAfterDish() {
        return await prisma.promotionAfterDish.findMany({
        where: { isDeleted: false },
        include:{
            promotion: true,
            dish: true,
        },
        });
    }

    async updatePromotionAfterDish(id, data) {
        const { promotionName, promotionDiscription, discount, startDay, endDate, dishID } = data;
        const promotionAfterDish = await prisma.promotionAfterDish.findUnique({
            where: { id },
            include: { promotion: true }, // Include promotion details
        });

        //hmm this feels like it should be in APIError.js
        if (!promotionAfterDish) {
            throw new Error('PromotionAfterDish not found');
        }

        await prisma.promotion.update({
            where: { id: promotionAfterDish.promotionID },
            data: {
            promotionName,
            promotionDiscription,
            discount,
            startDay,
            endDate,
            }
        });

        await prisma.promotionAfterDish.update({
            where: { id },
            data: {
            dishID,
            }
        });
    }

    async deletePromotionAfterDish(id) {
        return await prisma.promotionAfterDish.update({
            where: { id },
            data: { isDeleted: true },
        });
    }

}

module.exports = new PromotionAfterDishService();