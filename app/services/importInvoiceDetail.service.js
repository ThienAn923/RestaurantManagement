const prisma = require('../../prisma/importInvoiceDetail');

class ImportInvoiceDetailService {

    async createImportInvoiceDetail(data) {
        const ingredient = await prisma.ingredient.findUnique({ where: { id: data.ingredientId } });
        const totalExpense = data.quantity * ingredient.price;

        const importInvoiceDetail = await prisma.importInvoiceDetail.create({
            data: {
                ...data,
                totalExpense: totalExpense,
            },
        });

        return importInvoiceDetail;
    }

    async getImportInvoice(id) {
        return await prisma.importInvoiceDetail.findUnique({
            where: { id },
            include: {
                importInvoice: true,
                ingredient: true,
            },
        });
    }

    async getImportInvoiceDetailAfterImportInvoiceId(importInvoiceId) {
        return await prisma.importInvoiceDetail.findMany({
            where: { importInvoiceId },
            include: {
                importInvoice: true,
                ingredient: true,
            },
        });
    }
}