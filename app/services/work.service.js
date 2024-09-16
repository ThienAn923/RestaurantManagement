const prisma = require ('../../prisma/work');

class WorkService {
    async createWork(data) {
        return await prisma.work.create({ data });
    }

    async getWorkById(id) {
        return await prisma.work.findUnique({
            where: { id },
        });
    }

    async getAllWorks() {
        return await prisma.work.findMany({
            where: { isDeleted: false },
        });
    }

    //Well, i don't plain to have this function work as orther update function.
    //If the work is updated, it will create a new work
    //This update is just add the end date to the work
    async updateWork(id, endDate = new Date()) {
        return await prisma.work.update({
            where: { id },
            data: { endDate },
        });
    }

    async getWorkByEmployeeId(employeeId) {
        return await prisma.work.findMany({
            where: { employeeId },
        });
    }

    async getWorkByPositionId(positionId) {
        return await prisma.work.findMany({
            where: { positionId },
        });
    }
    
    async getWorkByDepartmentId(departmentId) {
        return await prisma.work.findMany({
            where: { departmentId },
        });
    }
}