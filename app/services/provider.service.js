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

    // //pinia
    // async getAllProviders(page = 1, limit = 5) {
    //     const skip = (page - 1) * limit;
    //     const [providers, total] = await Promise.all([
    //     prisma.Provider.findMany({
    //         where: { isDeleted: false },
    //         skip,
    //         take: limit,
    //         orderBy: { providerName: 'asc' },
    //     }),
    //     prisma.Provider.count({ where: { isDeleted: false } }),
    //     ]);
    
    //     return {
    //     providers,
    //     total,
    //     page,
    //     limit,
    //     totalPages: Math.ceil(total / limit),
    //     };
    // }

    async getAllProviders(page = 1, limit = 5, sortColumn = 'providerName', sortOrder = 'asc', filter = 'AllStatus', search = '') {
        console.log(search);
        const skip = (page - 1) * limit;
        const orderBy = {};
        
        // Validate sortColumn to prevent potential SQL injection
        const allowedColumns = ['providerName', 'providerEmail', 'providerPhoneNumber', 'providerStatus', 'createAt'];
        if (allowedColumns.includes(sortColumn)) {
            orderBy[sortColumn] = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';
        } else {
            orderBy.createAt = 'asc'; // Default sorting
        }

        let where;
        if (filter !== 'AllStatus' || search !== '') {
            where = {
                isDeleted: false,
                //And condition combined filter and search, if filter is not AllStatus, add providerStatus to where
                //If search is not empty, add OR condition to where to search by providerName, providerEmail, providerPhoneNumber, providerStatus    
                AND: [
                    ...(filter !== 'AllStatus' ? [{ providerStatus: filter }] : []),
                    ...(search !== '' ? [
                        {
                            OR: [
                                { providerName: { contains: search } },
                                { providerEmail: { contains: search } },
                                { providerPhoneNumber: { contains: search } },
                                { providerStatus: { contains: search } },
                            ]
                        }
                    ] : [])
                ]
            };
        }else where = { isDeleted: false };

        // console.log(filter)

        const [data, total] = await Promise.all([
            prisma.Provider.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            select: {
                id: true,
                providerName: true,
                providerDescription: true,
                providerPhoneNumber: true,
                providerEmail: true,
                providerAddress: true,
                providerStatus: true,
                createAt: true,
                updateAt: true,
            },
            }),
            //count total data of the input condition   
            prisma.Provider.count({ where }),
        ]);

        // Custom sorting for providerStatus
        // INCOMPLETE:
        if (sortColumn === 'providerStatus') {
            const statusOrder = ['Very Important', 'Important', 'Normal', 'Potential'];
            providers.sort((a, b) => {
                return statusOrder.indexOf(a.providerStatus) - statusOrder.indexOf(b.providerStatus);
            });
            if (sortOrder.toLowerCase() === 'desc') {
                providers.reverse();
            }
        }

        return {
            data,
            total,
            page,
            limit,
            filter,
            search,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getAllProvidersREAL() {
        const data =  await prisma.provider.findMany({
            where: { isDeleted: false },
        });
        return {data}; //"No!!! Who coded like this, you must me the worst coder ever" STFU, the frontend is expecting an object with key data, so I'm giving it to them
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