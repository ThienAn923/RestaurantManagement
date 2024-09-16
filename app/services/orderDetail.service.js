const prisma = require('../../prisma/client');

class OrderDetailService {
    async createOrderDetail(data) {
        return await prisma.orderDetail.create({ data });
    }

    async getOrderDetailById(id) {
        return await prisma.orderDetail.findUnique({
            where: { id },
            include: { costs: true },
        });
    }

    async getAllOrderDetails() {
        return await prisma.orderDetail.findMany({
            where: { isDeleted: false },
        });
    }

    async updateOrderDetail(id, data) {
        return await prisma.orderDetail.update({
            where: { id },
            data,
        });
    }

    async deleteOrderDetail(id) {
        return await prisma.orderDetail.update({
            where: { id },
            data: { isDeleted: true },
        });
    }

    async getAllOrderDetailsByOrderId(orderId) {
        return await prisma.orderDetail.findMany({
            where: { orderId },
        });
    }
}

module.exports = new OrderDetailService();