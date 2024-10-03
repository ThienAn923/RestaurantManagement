const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


class DepartmentService {
    async createDepartment(data) {
        return await prisma.Department.create({ data });
    }
    
    async getDepartmentById(id) {
        return await prisma.Department.findUnique({
        where: { id },
        });
    }
    
    async getAllDepartmentsREAL() {
        return await prisma.Department.findMany({
        where: { isDeleted: false },
        });
    }

    //pinia
    // async getAllDepartments(page = 1, limit = 5) {
    //     const skip = (page - 1) * limit;
    //     const [departments, total] = await Promise.all([
    //     prisma.Department.findMany({
    //         where: { isDeleted: false },
    //         skip,
    //         take: limit,
    //         orderBy: { createAt: 'desc' },
    //     }),
    //     prisma.Department.count({ where: { isDeleted: false } }),
    //     ]);
    
    //     return {
    //     departments,
    //     total,
    //     page,
    //     limit,
    //     totalPages: Math.ceil(total / limit),
    //     };
    // }
    
    //pinia with sort
    async getAllDepartments(page = 1, limit = 5, sortColumn, sortOrder) {
        const skip = (page - 1) * limit;
        const allowedSortColumns = ['departmentName', 'totalEmployee', 'headOfDepartment', 'createAt'];
        
        // Ensure sortColumn is valid
        if (!allowedSortColumns.includes(sortColumn)) {
            sortColumn = 'createAt';
        }

        // Ensure sortOrder is valid
        sortOrder = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
        console.log(sortColumn, sortOrder);
        const [departments, total] = await Promise.all([
            prisma.Department.findMany({
            where: { isDeleted: false },
            skip,
            take: limit,
            orderBy: { [sortColumn]: sortOrder },
            }),
            prisma.Department.count({ where: { isDeleted: false } }),
        ]);

        return {
            departments,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
        }
    async updateDepartment(id, data) {
        return await prisma.Department.update({
        where: { id },
        data,
        });
    }
    
    async deleteDepartment(id) {
        // Soft delete (set isDeleted to true)
        return await prisma.Department.update({
        where: { id },
        data: { isDeleted: true },
        });
    }
}

module.exports = new DepartmentService();