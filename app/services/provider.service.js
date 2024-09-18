const prisma = require('../../prisma/provider');

class ProviderService {
    async createProvider(data) {
        return await prisma.provider.create({ data });
    }

    async getProviderById(id) {
        return await prisma.provider.findUnique({
            where: { id },
        });
    }

    async getAllProviders() {
        return await prisma.provider.findMany({
            where: { isDeleted: false },
        });
    }

    async updateProvider(id, data) {
        return await prisma.provider.update({
            where: { id },
            data,
        });
    }

    async deleteProvider(id) {
        return await prisma.provider.update({
            where: { id },
            data: { isDeleted: true },
        });
    }

    async getAllInvoiceByProviderId(id) {
        return await prisma.provider.findUnique({
            where: { id },
            select: {
                importInvoices: true,
            },
        });
    }
}

module.exports = new ProviderService();