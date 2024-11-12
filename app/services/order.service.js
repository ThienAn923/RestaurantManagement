// dish.service.js
const prisma = require('../../prisma/client'); // Go up two directoriedishs from 'service' to 'project' then into 'prisma'

class OrderService {
    async createOrder(data) {
        console.log("Running create Order at order.service.js");
        const {employeeID, tableID, orderNote,orderStatus,OrderDetail, forDate} =data;
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
                forDate: forDate,
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
        //Not my fault
        order.tableID = table.tableNumber;
        global.io.emit("orderAdded",order)
        // console.log(order)

        try {
            // Update table status to false IF, IF, the order is for today, else, just skip
            if(order.forDate === new Date().toISOString()){{
                const updatedTable = await prisma.table.update({
                    where: { id: tableID },
                    data: { tableStatus: false },
                });
            
                //why reconstructing the table? because in table.vue, which was written in the beginning, i messed up the table status, so i have to reconstruct it
                const reconstructedTable = { ...updatedTable, status: updatedTable.tableStatus };
                global.io.emit("tableUpdate",reconstructedTable);
                return updatedTable;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async getOrderById(id) {
        try{
            //as it looks too nesty, im gonna guide you through this.
            //first, we find the order by id
            //then we include the orderDetails of that order, and table number too
            //Then we select the name and cost(and array json) for that dish
            //Then we select the name of the employee that take that order
            return await prisma.order.findUnique({
            where: { id },
                include: {
                    Table: {select: {tableNumber: true}},
                    OrderDetail: {    
                        include: { 
                            Dish: {
                                select : {
                                    name: true,
                                    costs: true,
                                    timeToCook: true,
                                }
                            }
                        },
                    },
                    Employee: {
                        select: { person: {select: {name: true,}}} },
                    },
                },
            );
        }catch(error){
            console.log(error);
        }
    }

    async getAllOrders() {
        return await prisma.order.findMany({
        });
    }

    async updateOrder(id, data) {
        console.log('Running updateOrder at order.service.js');
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