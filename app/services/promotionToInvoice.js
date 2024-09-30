const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PromotionToInvoiceService {
    async createPromotionToInvoice(data) {
        return await prisma.promotion.create({ data });
    }

    //should i include promotion and invoice here? probably not...lol
    async getPromotionToInvoiceById(id) {
        return await prisma.promotionToInvoice.findUnique({
            where: { id },
            include:{
                promotion: true,
                invoice: true,
            },
        });
    }

    async getAllPromotionToInvoice() {
        return await prisma.promotionToInvoice.findMany({
        where: { isDeleted: false },
        include:{
            promotion: true,
            invoice: true,
        },
        });
    }

    async getAllAfterInvoiceId(invoiceId) {
        return await prisma.promotionToInvoice.findMany({
            where: { invoiceId },
        });
    }
}