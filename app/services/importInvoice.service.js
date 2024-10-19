const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ImportInvoiceService {
    async createImportInvoice(data) {

        const { employeeId, providerId, importInvoiceDetails } = data;
        let totalExpense = 0;
        let quantity=0
        
        //create import invoice, make totakExpense = 0 first
        const importInvoice = await prisma.importInvoice.create({
            data: {
                Employee: {
                    connect: {id: employeeId}
                },
                Provider: {
                    connect: {id: providerId}
                },
                importDate: new Date(),
                totalExpense: 0,
            },
        });

        //create import invoice details, calculate totalExpense
        for (const detail of importInvoiceDetails) {
            totalExpense += detail.quantity * detail.price;
            console.log("AHHHHHHHHHH debug!!!" + detail.quantity + " " + detail.price)
            quantity+=1
            // const ingredient = await prisma.ingredient.findUnique({ where: { id: detail.ingredientId } });
            // const totalExpenses = detail.quantity * ingredient.price;

            const importInvoiceDetail = await prisma.importInvoiceDetail.create({
                data: {
                    totalExpense: totalExpense,
                    quantity: quantity,
                    ImportInvoice: {
                        connect: {id: importInvoice.id}
                    },
                    ingredient: {
                        connect: {id: detail.ingredientId}
                    }
                },
            });
            return importInvoiceDetail;
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

    async getAllImportInvoicesREAL() {
        return await prisma.importInvoice.findMany({
            include: {
                importInvoiceDetail: true,
                Provider: true,
                Employee: true,
            },
        });
    }

    //pinia pagination
    async getAllImportInvoices(page, limit, sortColumn, sortOrder, filter = 'AllProvider', search = '') {
        const skip = (page - 1) * limit;
        //doesn't support nested sort yet
        // const orderBy = { [sortColumn]: sortOrder };
        
        //support nested sort
        const orderBy = sortColumn.includes('Provider.')
            ? { Provider: { providerName: sortOrder } }
            : { [sortColumn]: sortOrder };

        
        // const [importInvoices, totalCount] = await Promise.all([
        //     prisma.importInvoice.findMany({
        //         skip,
        //         take: limit,
        //         orderBy,
        //         include: {
        //             importInvoiceDetail: {
        //                 include: {
        //                     ingredient: true
        //                 }
        //             },
        //             Provider: true,
        //             Employee: true,
        //         },
        //     }),
        //     prisma.importInvoice.count()
        // ]);

        let where;
        if (filter !== 'AllProvider' || search !== '') {
            where = {
                //And condition combined filter and search, if filter is not AllProvider, add providerStatus to where
                //If search is not empty, add OR condition to where to search by createAt
                //why there is AND here? it actually because i copy pasted this XD
                //it suppose to have "isDeleted: false" here but since invoice cannot be deleted, i remove it
                    ...(filter !== 'AllProvider' ? [{ providerName: filter }] : []),
                    ...(search !== '' ? [
                        {
                            OR: [
                                { createAt: { contains: search } },
                                // employee name
                            ]
                        }
                    ] : [])
            };
        }

        const [data, total] = await Promise.all([
            prisma.importInvoice.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            select: {
                id: true,
                importDate: true,
                totalExpense: true,
                providerID: true,
                employeeID: true,
                createAt: true,
                importInvoiceDetail: true,
                Provider: {
                    select: {
                        id: true,
                        providerName: true,
                        providerDescription: true,
                        providerPhoneNumber: true,
                        providerEmail: true,
                        providerAddress: true,
                        providerStatus: true,
                        isDeleted: true,
                        updateAt: true,
                        createAt: true,
                    }
                },
                Employee: {
                    select: {
                        id: true,
                        employeeAdress: true,
                        employeeGender: true,
                        employeeDateOfBirth: true,
                        employeePhoneNumber: true,
                        employeeEmail: true,
                        personId: true,
                        isDeleted: true,
                        updateAt: true,
                        createAt: true,
                    }
                }
            },
            }),
            //count total data of the input condition   
            prisma.importInvoice.count({ where }),
        ]);

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