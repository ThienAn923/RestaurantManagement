// dish.service.js
const prisma = require('../../prisma/client'); // Go up two directoriedishs from 'service' to 'project' then into 'prisma'

class OrderService {
    async createOrder(data) {
        return await prisma.order.create({ data });
    }

    async getOrderById(id) {
        return await prisma.Order.findUnique({
        where: { id },
        include: { costs: true }, // Include costs if needed
        });
    }

    async getAllOrders() {
        return await prisma.Order.findMany({
        });
    }

    async updateOrder(id, data) {
        return await prisma.Order.update({
        where: { id },
        data,
        });
    }

    async deleteOrder(id) {
        // Soft delete (set isDeleted to true)
        return await prisma.Order.update({
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