const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PointUsageService {
    async createPointUsage(data) {
        return await prisma.pointUsage.create({ data });
    }

    async getPointUsageById(id) {
        return await prisma.pointUsage.findUnique({
            where: { id },
        });
    }

    async getAllPointUsages() {
        return await prisma.pointUsage.findMany({
            where: { isDeleted: false },
        });
    }

    async getAllPointUsagesRegardingClient(clientId) {
        return await prisma.pointUsage.findMany({
            where: { clientId },
        });
    }
}