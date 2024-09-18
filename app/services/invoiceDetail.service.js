const prisma = require('../../prisma/invoiceDetail');

class InvoiceDetailService {
    async createInvoiceDetail(data) {
        return await prisma.invoiceDetail.create({ data });
    }

    async getInvoiceDetailAfterInvoiceId(invoiceId) {
        return await prisma.invoiceDetail.findMany({
            where: { invoiceId },
        });
    }
}

module.exports = new InvoiceDetailService();