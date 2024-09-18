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
    
    async getAllDepartments() {
        return await prisma.Department.findMany({
        where: { isDeleted: false },
        });
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