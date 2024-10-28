// dish.service.js
const prisma = require('../../prisma/client'); // Go up two directoriedishs from 'service' to 'project' then into 'prisma'

class OrderService {
    async createOrder(data) {
        const {employeeID, tableID, orderNote,orderStatus,orderDetails,OrderDetail} =data;
        const order=  await prisma.order.create({ 
            data: {
                Employee: {
                    connect: {id: employeeID}
                },
                Table: {
                    connect: {id: tableID}
                },
                orderNote: orderNote,
                orderStatus: orderStatus,
            }   
        });
        for (const orderDetail of OrderDetail) {
            await prisma.orderDetail.create({
                data: {
                    Order: {
                        connect: {id: order.id}
                    },
                    Dish: {
                        connect: {id: orderDetail.dishId}
                    },
                    quantity: orderDetail.quantity,                    
                },
            });
        }
        const table = await prisma.table.findUnique({
            where: { id: tableID }, // Sử dụng tableID để tìm bàn
            select: { tableNumber: true } // Chỉ lấy số bàn
        });
        order.tableID = table.tableNumber;
        global.io.emit("orderAdded",order)
        console.log(order)
    }

    async getOrderById(id) {
    try{
        console.log("Yo");
        return await prisma.order.findUnique({
        where: { id },
        include: { OrderDetail: true }, // Include costs if needed
        });
    }catch(error){
        console.log(error);
    }
    }

    async getAllOrders() {
        return await prisma.order.findMany({
        });
    }

    async updateOrder(id, data) {
        console.log(data);
        console.log(id);
        const { realTableID, ...dataWithoutRealTableID } = data;
        const dataWithTableID = { ...dataWithoutRealTableID, tableID: realTableID }; // Spread the properties
        
        try {
            const orderUpdated = await prisma.order.update({
            where: { id },
            data: dataWithTableID,
            include: { OrderDetail: true }, 
            });
            global.io.emit("orderUpdated", orderUpdated);
            return orderUpdated;
        } catch (error) {
            console.log(error);
        }
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