const prisma = require('../../prisma/client');

class ProviderService {
    async createProvider(data) {
        console.log({data: data});
        return await prisma.provider.create({ data });
    }

    async getProviderById(id) {
        return await prisma.provider.findUnique({
            where: { id },
        });
    }

    // async getAllProviders() {
    //     return await prisma.provider.findMany({
    //         where: { isDeleted: false },
    //     });
    // }

    //pinia
    async getAllProviders(page = 1, limit = 5) {
        const skip = (page - 1) * limit;
        const [providers, total] = await Promise.all([
        prisma.Provider.findMany({
            where: { isDeleted: false },
            skip,
            take: limit,
            orderBy: { providerName: 'asc' },
        }),
        prisma.Provider.count({ where: { isDeleted: false } }),
        ]);
    
        return {
        providers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        };
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