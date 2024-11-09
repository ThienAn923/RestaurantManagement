const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class IngredientService {
    async createIngredient(data) {
        console.log(JSON.stringify(data));
        return await prisma.ingredient.create({ data });
    }

    async getIngredientById(id) {
        return await prisma.ingredient.findUnique({
            where: { id },
        });
    }

    async getAllIngredients() {
        return await prisma.ingredient.findMany({
            where: {
                isDeleted: false
            },
            include: {
                ingredientType: true // This will include the related ingredientType based on ingredientTypeID
            }
        });
    }   

    //pinia
        async getAllIngredients(page = 1, limit = 5, sortColumn = 'createAt', sortOrder = 'asc', filter = 'AllTypes', search = '') {
        const skip = (page - 1) * limit;
        const orderBy = {};

        // Validate sortColumn to prevent potential SQL injection
        const allowedColumns = ['ingredientName', 'ingredientType', 'createAt'];
        if (allowedColumns.includes(sortColumn)) {
            orderBy[sortColumn] = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';
        } else {
            orderBy.createAt = 'asc'; // Default sorting
        }

        let where;
        if (filter !== 'AllTypes' || search !== '') {
            where = {
                isDeleted: false,
                //And condition combined filter and search, if filter is not AllTypes, add ingredientTypeID to where
                //If search is not empty, add OR condition to where to search by ingredientName
                AND: [
                    ...(filter !== 'AllTypes' ? [{ ingredientTypeID: filter }] : []),
                    ...(search !== '' ? [
                        {
                            OR: [
                                { ingredientName: { contains: search } },
                            ]
                        }
                    ] : [])
                ]
            };
        } else {
            where = { isDeleted: false };
        }

        const [data, total] = await Promise.all([
            prisma.ingredient.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            select: {
                id: true,
                ingredientName: true,
                ingredientTypeID: true,
                isDeleted: true,
                createAt: true,
                updateAt: true,
                ingredientType: {
                    select: {
                        id: true,
                        ingredientTypeName: true,
                        ingredientTypeDescription: true,
                        createAt: true,
                        updateAt: true,
                     },
                },
            }
        }),
            //count total data of the input condition   
            prisma.ingredient.count({ where }),
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

    async getAllIngredientsREAL() {
        const data = await prisma.ingredient.findMany({
            where: {
                isDeleted: false
            },
            include: {
                ingredientType: true
            }
        });
        return {data:data}; //"WHY?" BECAUSE THE FONTEND EXPECTS AN OBJECT WITH A KEY "data" THAT CONTAINS THE ARRAY OF DATA, im gonna cry
    }
    


    async updateIngredient(id, data) {
        return await prisma.ingredient.update({
            where: { id },
            data,
        });
    }

    async deleteIngredient(id) {
        return await prisma.ingredient.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
}

module.exports = new IngredientService();