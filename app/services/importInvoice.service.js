const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ImportInvoiceService {
    async createImportInvoice(data) {

        const { employeeId, providerId, importInvoiceDetails } = data;
        let totalExpense = 0;
        
        //create import invoice, make totakExpense = 0 first
        const importInvoice = await prisma.importInvoice.create({
            data: {
                employeeId: employeeId,
                providerId: providerId,
                importDate: new Date(),
                totalExpense: 0,
            },
        });

        //create import invoice details, calculate totalExpense
        for (const detail of importInvoiceDetails) {
            totalExpense += detail.quantity * detail.price;
            await this.createImportInvoiceDetail(importInvoice.id, detail.ingredientId, detail.quantity);
        }

        //update totalExpense
        await prisma.importInvoice.update({
            where: { id: importInvoice.id },
            data: { totalExpense: totalExpense },
        });

        return importInvoice;
    }

    async getImportInvoiceById(id) {
        return await prisma.importInvoice.findUnique({
            where: { id },
            include: {
                importInvoiceDetails: true,
                provider: true,
                employee: true,
            },
        });
    }

    async getAllImportInvoices() {
        return await prisma.importInvoice.findMany({
            include: {
                importInvoiceDetail: true,
                Provider: true,
                Employee: true,
            },
        });
    }

    //i don't know if this have any uses anymore. i write this just in case
    async getProvider(id){
        return await prisma.importInvoice.findUnique({
            where: { id },
            select: {
                provider: true,
            },
        });
    }
}

module.exports = new ImportInvoiceService();