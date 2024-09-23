const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class InvoiceService {
    async createInvoice(data) {
        const { orderId } = data;

        //find order by id
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { orderDetails: true }
        });

        if (!order) {
            throw new Error("Order not found");
        }
        
        // find order details by order id
        const orderDetails = await prisma.orderDetail.findMany({
            where: { orderId: order.id },
            include: { dish: true }
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
                orderBy: { timeChange: 'desc' },
            });

            if (latestCost) {
                totalCost += latestCost.cost * detail.quantity;
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

        // Create invoice details
        //Could this be shorter if i merge this with the previous loop? Currently i dont know think so. Good luck my future self
        for (const orderDetail of orderDetails) {
            let invoiceDetailCost = 0;
            const latestCost = await prisma.cost.findFirst({
                where: { dishId: dish.id },
                orderBy: { timeChange: 'desc' },
            });
            invoiceDetailCost = orderDetail.quantity * latestCost.cost;
            await prisma.invoiceDetail.create({
                data: {
                    quantity: orderDetail.quantity,
                    dishId: orderDetail.dishId,
                    invoiceId: invoice.id,
                    totalCost: invoiceDetailCost,
                },
            });
        }
        
        //IMPORTANT PART!!
        //finally delete the order
        await prisma.order.delete({ where: { id: orderId } });
        //change the table status to 0
        await prisma.table.update({
            where: { id: order.tableID },
            data: { status: 0 },
        });

        return invoice;
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
                    Person: true
                }
            },
            Table: true,
            invoiceDetail: {
                include: {
                    Dish: true
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
        employeeName: invoice.Employee.Person.name,
        tableID: invoice.tableID,
        tableNumber: invoice.Table.tableNumber,
        promotionID: invoice.promotionID,
        promotionName: invoice.PromotionAfterInvoice?.Promotion.promotionName,
        invoiceDetails: invoice.invoiceDetail.map(detail => ({
            id: detail.id,
            dishName: detail.Dish.name,
            quantity: detail.quantity,
            totalCost: detail.totalCost
        }))
    }));

        return {
        invoices : formattedInvoices,
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