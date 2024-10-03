const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PromotionAfterInvoiceService {
    async createPromotionAfterInvoice(data) {
        const { promotionName, promotionDescription, discount, startDate, endDate, promotionLimit } = data;
        let isoStartDate = new Date(startDate);
        let isoEndDate = new Date(endDate);
        const promotion = await prisma.promotion.create({
            data: {
                promotionName,
                promotionDescription,
                discount,
                startDate: isoStartDate,
                endDate: isoEndDate,
                promotionLimit,
            }
        });
        const promotionAfterInvoice = await prisma.promotionAfterInvoice.create({
            data: {
                Promotion: {
                    connect: {id: promotion.id}
                },
            }
        });
        return {promotion, promotionAfterInvoice};
    }

    async getPromotionAfterInvoiceById(id) {
        return await prisma.promotionAfterInvoice.findUnique({
            where: { id },
            include:{
                promotion: true,
            },
        });
    }

    async getAllPromotionAfterInvoice() {
        return await prisma.promotionAfterInvoice.findMany({
        where: { isDeleted: false },
        include:{
            promotion: true,
        },
        });
    }

    async updatePromotionAfterInvoice(id, data) {
        const { promotionName, promotionDiscription, discount, startDay, endDate } = data;
        const promotionAfterInvoice = await prisma.promotionAfterInvoice.findUnique({
            where: { id },
            include: { promotion: true }, // Include promotion details
        });

        //hmm this feels like it should be in APIError.js
        if (!promotionAfterInvoice) {
            throw new Error('PromotionAfterInvoice not found');
        }

        await prisma.promotion.update({
            where: { id: promotionAfterInvoice.promotionID },
            data: {
            promotionName,
            promotionDiscription,
            discount,
            startDay,
            endDate,
            },
        });

        // return await prisma.promotionAfterInvoice.update({
        //     where: { id },
        //     //well, there's nothing to leave here
        // });
    }

    async deletePromotionAfterInvoice(id) {
        const promotionAfterInvoice = await prisma.promotionAfterInvoice.findUnique({
            where: { id },
        });

        if (!promotionAfterInvoice) {
            throw new Error('PromotionAfterInvoice not found');
        }

        await prisma.promotionAfterInvoice.update({
            where: { id },
            data: { isDeleted: true },
        });

        return await prisma.promotion.update({
            where: { id: promotionAfterInvoice.promotionID },
            data: { isDeleted: true },
        });
    }

}

module.exports = new PromotionAfterInvoiceService();