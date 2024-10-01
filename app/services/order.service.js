// dish.service.js
const prisma = require('../../prisma/client'); // Go up two directoriedishs from 'service' to 'project' then into 'prisma'

class OrderService {
    async createOrder(data) {
        return await prisma.order.create({ data });
    }

    async getOrderById(id) {
        return await prisma.order.findUnique({
        where: { id },
        include: { costs: true }, // Include costs if needed
        });
    }

    async getAllOrders() {
        return await prisma.order.findMany({
        });
    }

    async updateOrder(id, data) {
        return await prisma.order.update({
        where: { id },
        data,
        });
    }

    async deleteOrder(id) {
        // Soft delete (set isDeleted to true)
        return await prisma.order.update({
        where: { id },
        data: { isDeleted: true },
        });
    }

    async getAllOrderDetails(orderId) {
        return await prisma.orderDetail.findMany({
        where: { orderId },
        });
    }
    
}


module.exports = new OrderService();