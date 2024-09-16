const prisma = require('../../prisma/promotionAfterInvoice');

class PromotionAfterInvoiceService {
    async createPromotionAfterInvoice(data) {
        const { promotionName, promotionDiscription, discount, startDay, endDate } = data;
        const promotion = await prisma.promotion.create({
            data: {
                promotionName,
                promotionDiscription,
                discount,
                startDay,
                endDate,
            }
        });
        const promotionAfterInvoice = await prisma.promotionAfterInvoice.create({
            data: {
                invoiceID,
                promotionID: promotion.id,
            }
        });
        return {promotion, promotionAfterInvoice};
    }

    async getPromotionAfterInvoiceById(id) {
        return await prisma.promotionAfterInvoice.findUnique({
            where: { id },
            include:{
                promotion: true,
                invoice: true,
            },
        });
    }

    async getAllPromotionAfterInvoice() {
        return await prisma.promotionAfterInvoice.findMany({
        where: { isDeleted: false },
        include:{
            promotion: true,
            invoice: true,
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

        return await prisma.promotionAfterInvoice.update({
            where: { id },
            data: {
                invoiceID,
            },
        });
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