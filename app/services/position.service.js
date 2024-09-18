const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PositionService {
    async createPosition(data) {
        return await prisma.Position.create({ data });
    }
    
    async getPositionById(id) {
        return await prisma.Position.findUnique({
        where: { id },
        });
    }
    
    async getAllPositions() {
        return await prisma.Position.findMany({
        where: { isDeleted: false },
        });
    }
    
    async updatePosition(id, data) {
        return await prisma.Position.update({
        where: { id },
        data,
        });
    }
    
    async deletePosition(id) {
        // Soft delete (set isDeleted to true)
        return await prisma.Position.update({
        where: { id },
        data: { isDeleted: true },
        });
    }
}

module.exports = new PositionService();