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
    
    // async getAllPositions() {
    //     return await prisma.Position.findMany({
    //     where: { isDeleted: false },
    //     });
    // }
    
    //pinia
    async getAllPositions(page = 1, limit = 5) {
        const skip = (page - 1) * limit;
        const [positions, total] = await Promise.all([
        prisma.Position.findMany({
            where: { isDeleted: false },
            skip,
            take: limit,
            orderBy: { positionName: 'asc' },
        }),
        prisma.Position.count({ where: { isDeleted: false } }),
        ]);
    
        return {
        positions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        };
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