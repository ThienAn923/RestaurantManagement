const { PrismaClient } = require('@prisma/client');
const { table } = require('../../prisma/client');
const prisma = new PrismaClient();

class InvoiceService {
    async createInvoice(data) {
        try{
        // console.log("Im here", data);
        const orderId  = data.OrderID;
        // console.log(orderId);

        //find order by id
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { OrderDetail: true }
        });

        if (!order) {
            throw new Error("Order not found");
        }
        
        // find order details by order id
        const orderDetails = await prisma.orderDetail.findMany({
            where: { orderID: order.id },
            include: { Dish: true }
        });

        // Calculate total cost of order details
        //Find the latest cost of each dish in order details
        //Sort the cost by timeChange in descending order
        //Pick the first element of the sorted array because it's the newest cost
        let totalCost = 0;
        for (const orderDetail of orderDetails) {
            const dish = await prisma.dish.findUnique({ where: { id: orderDetail.dishId } });
            const latestCost = await prisma.cost.findFirst({
                where: { dishId: dish.id },
                orderBy: { createAt: 'desc' },
            });

            if (latestCost) {
                totalCost += latestCost.cost * orderDetail.quantity;
            }
        }

        // Create invoice
        const invoice = await prisma.invoice.create({
            data: {
                employeeID: order.employeeID,
                orderNote: order.orderNote,
                tableID: order.tableID,
                totalCost: totalCost,
                invoiceDate: new Date(),
            },
        });

        // console.log(invoice);

        // Create invoice details
        //Could this be shorter if i merge this with the previous loop? Currently i dont know think so. Good luck my future self
        for (const orderDetail of orderDetails) {
            let invoiceDetailCost = 0;
            const latestCost = await prisma.cost.findFirst({
                where: { dishId: orderDetail.dishId },
                orderBy: { createAt: 'desc' },
            });
            invoiceDetailCost = orderDetail.quantity * latestCost.cost;
            await prisma.invoiceDetail.create({
                data: {
                    quantity: orderDetail.quantity,
                    dishID: orderDetail.dishId,
                    invoiceID: invoice.id,
                    totalCost: invoiceDetailCost,
                },
            });
        }
        
        //IMPORTANT PART!!
        //finally delete the order detail
        for (const orderDetail of orderDetails) {
            await prisma.orderDetail.delete({ where: { id: orderDetail.id } });
        }
        //delete the order
        global.io.emit('orderDeleted', orderId);
        global.io.emit('tableUpdate', order.tableID);
        await prisma.order.delete({ where: { id: orderId } });


        //change the table status to false
        const UpdateTable = await prisma.table.update({
            where: { id: order.tableID },
            data: { tableStatus: true },
        });
        console.log("Table status updated", UpdateTable);

        

        return invoice;
        }catch(error){
            console.log(error);
        }
    }

    async getInvoiceById(id) {
        return await prisma.invoice.findUnique({
            where: { id },
            include: { invoiceDetail: true },
        });
    }

    async getAllInvoicesVIP() {
        return await prisma.invoice.findMany({
            
        });
    }

    async getAllInvoices(page = 1, limit = 5) {
        const skip = (page - 1) * limit;

        //for test
        // let where = {};
        // const dishList = await prisma.dishType.findMany({
        //     where,
        //     include: {
        //         dish_list: true
        //     }
        // });
        const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
            skip,
            take: limit,
            orderBy: {
                invoiceDate: 'desc'
            },
            include: {
                PromotionAfterInvoice: true,
                Employee: {
                    include: {
                        person: true
                    }
                },
                Table: true,
                invoiceDetail_list: {
                    include: {
                        Dish: true,
                        //explantion: The first Promotion is actually PromotionAfterDish, the later promotion is THE PROMOTION, THE OBJECT, which contain the name of the promotion.
                        Promotion: {
                            include: {
                                Promotion: true
                            }
                        }
                    }
                }
            }
        }),
            prisma.invoice.count()
        ]);

        const formattedInvoices = invoices.map(invoice => ({
        id: invoice.id,
        invoiceDate: invoice.invoiceDate,
        totalCost: invoice.totalCost,
        orderNote: invoice.orderNote,
        employeeID: invoice.employeeID,
        employeeName: invoice.Employee.person.name,
        tableID: invoice.tableID,
        tableNumber: invoice.Table.tableNumber,
        promotionID: invoice.promotionID,
        promotionName: invoice.PromotionAfterInvoice?.Promotion.Promotion.promotionName ?? 'No promotion',
        invoiceDetails: invoice.invoiceDetail_list.map(detail => ({
            id: detail.id,
            dishName: detail.Dish.name,
            quantity: detail.quantity,
            totalCost: detail.totalCost,
            createAt: detail.createAt,
            salePerUnit: detail.salesPerUnit,
            promotionAfterDishID: detail.promotionAfterDishID

        }))
    }));

        return {
        data: formattedInvoices,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        };
    }


    async getTableAfterInvoice(invoiceId){
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
        include: { table: true },
        });
        return invoice.table;
    }

    async getEmlpoyeeAfterInvoice(invoiceId){
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
        include: { employee: true },
        });
        return invoice.employee;
    }
}

module.exports = new InvoiceService();