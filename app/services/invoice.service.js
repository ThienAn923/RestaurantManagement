const {
  startOfWeek,
  startOfMonth,
  parseISO,
  formatISO,
  startOfDay,
} = require("date-fns");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class InvoiceService {
  async createInvoice(data) {
    try {
      console.log("check data", data.ClientID, data.pointUsed, data.OrderID);
      // console.log("Im here", data);
      const orderId = data.OrderID;
      // console.log("LMAOOOOOOOOOOOOOOOOOOOOOOOOOOO",orderId);

      //find order by id
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { OrderDetail: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // find order details by order id
      const orderDetails = await prisma.orderDetail.findMany({
        where: { orderID: order.id },
        include: { Dish: true },
      });

      // Calculate total cost of order details
      //Find the latest cost of each dish in order details
      //Sort the cost by timeChange in descending order
      //Pick the first element of the sorted array because it's the newest cost
      let totalCost = 0;
      for (const orderDetail of orderDetails) {
        const dish = await prisma.dish.findUnique({
          where: { id: orderDetail.dishId },
        });
        const latestCost = await prisma.cost.findFirst({
          where: { dishId: dish.id },
          orderBy: { createAt: "desc" },
        });

        if (latestCost) {
          totalCost += latestCost.cost * orderDetail.quantity;
        }
      }

      //THIS LOGIC IS WRONG!!!! BUT TEMPORARILY USABLE. i gotta show the product tomorrow
      // Apply promotion discount if available
      // Get the first promotion that hasn't ended
      const currentDate = new Date();
      const promotion = await prisma.promotion.findFirst({
        where: {
          isDeleted: false,
          startDate: { lte: currentDate },
          endDate: { gte: currentDate },
        },
        select: { discount: true, promotionName: true },
      });
      const promotionAfterInvoice =
        await prisma.promotionAfterInvoice.findFirst({
          where: { promotionID: promotion.id, isDeleted: false },
        });

      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          employeeID: order.employeeID,
          orderNote: order.orderNote,
          tableID: order.tableID,
          totalCost: totalCost,
          invoiceDate: new Date().toISOString(),
          promotionAfterInvoiceID: promotionAfterInvoice.id,
          finalTotalCost: totalCost - (promotion.discount / 100) * totalCost,
          pointEarned: 0,
          pointUsed: 0,

          //Cheating
          discount: promotion.discount,
          promotionName: promotion.promotionName,
        },
      });

      // console.log(invoice);

      // Create invoice details
      //Could this be shorter if i merge this with the previous loop? Currently i dont know think so. Good luck my future self
      for (const orderDetail of orderDetails) {
        let invoiceDetailCost = 0;
        const latestCost = await prisma.cost.findFirst({
          where: { dishId: orderDetail.dishId },
          orderBy: { createAt: "desc" },
        });
        invoiceDetailCost = orderDetail.quantity * latestCost.cost;

        let promotionName = null;
        let discount = 0;

        const dish = await prisma.dish.findUnique({
          where: { id: orderDetail.dishId },
          include: { promotion: true },
        });

        if (dish?.promotion?.promotionID) {
          const promotionAfterDish = dish.promotion;
          const promotion = await prisma.promotion.findUnique({
            where: { id: promotionAfterDish.promotionID },
          });

          const currentDate = new Date();
          if (promotion && currentDate < new Date(promotion.endDate)) {
            promotionName = promotion.promotionName;
            discount = promotion.discount;
          }
        }

        const totalCost =
          invoiceDetailCost - (invoiceDetailCost * discount) / 100;

        await prisma.invoiceDetail.create({
          data: {
            quantity: orderDetail.quantity,
            dishID: orderDetail.dishId,
            invoiceID: invoice.id,
            totalCost: totalCost,
            discount: discount,
            originalPrice: invoiceDetailCost / orderDetail.quantity,
            promotionName: promotionName,
            promotionAfterDishID: dish.promotion?.id,
          },
        });
      }

      //The reason for this part of code is to update the total cost
      // dude to the promotion after dish invoice
      // "So, the field finalTotalCost upper are useless, right?"
      // You are correct, they're just... there, there's number, but not really accurate
      //If there is a promotion after dish, then we have to recalculate the total cost
      // Recalculate total cost of invoice
      const invoiceDetails = await prisma.invoiceDetail.findMany({
        where: { invoiceID: invoice.id },
      });

      let recalculatedTotalCost = 0;
      for (const detail of invoiceDetails) {
        recalculatedTotalCost += detail.totalCost;
        console.log(
          "Recalculated total cost: ",
          recalculatedTotalCost,
          "Detail total cost: ",
          detail.totalCost
        );
      }

      const finalTotalCost =
        recalculatedTotalCost -
        (promotion.discount / 100) * recalculatedTotalCost;

      //This part of thd cost is to + point to the client
      //the client have 2 type of client, client and clientTemporary
      //client temporary is the client that haven't asign their phone number || client that haven't registered but want to have points
      // Find client by id in ClientTemporary and Client tables
      let pointsToAdd = 0;

      if (data.ClientID !== "noCustomer") {
        const clientTemporary = await prisma.clientTemporary.findUnique({
          where: { id: data.ClientID },
        });

        const client = clientTemporary
          ? null
          : await prisma.client.findUnique({
              where: { id: data.ClientID },
            });

        if (!clientTemporary && !client) {
          throw new Error("Client not found");
        }

        // Calculate points to add to client
        pointsToAdd = Math.floor(finalTotalCost / 10000);

        // Update client points
        if (clientTemporary) {
          await prisma.clientTemporary.update({
            where: { id: data.ClientID },
            data: { point: { increment: pointsToAdd } },
          });
        } else if (client) {
          await prisma.client.update({
            where: { id: data.ClientID },
            data: { point: { increment: pointsToAdd } },
          });
        }
      }

      // Update invoice with recalculated total cost and final total cost
      try {
        console.log(
          "invoice: ",
          invoice.id,
          "finalTotalCost: ",
          finalTotalCost
        );
        const updatedInvoice = await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            finalTotalCost: finalTotalCost,
            pointEarned: pointsToAdd,
            pointUsed: data.pointUsed || 0,
          },
        });
        console.log("Updated invoice: ", updatedInvoice);
      } catch (error) {
        "Error at invoice.service.js, line 160", console.log(error.message);
      }

      //addded later, add real client if exist into invoice
      const client = await prisma.client.findFirst({
        where: { id: data.ClientID },
      });
      if (client) {
        // Update invoice with the data.ClientID
        const updatedInvoice = await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            clientId: data.ClientID,
          },
        });
      }

      //IMPORTANT PART!!
      //finally delete the order detail
      for (const orderDetail of orderDetails) {
        await prisma.orderDetail.delete({ where: { id: orderDetail.id } });
      }
      //delete the order
      global.io.emit("orderDeleted", orderId);
      //update table status socket
      // console.log("Running log tableID at invoice.service.js. Table ID:", order.tableID);

      await prisma.order.delete({ where: { id: orderId } });

      // //change the table status to true
      // const UpdateTable = await prisma.table.update({
      //     where: { id: order.tableID },
      //     data: { tableStatus: true },
      // });
      try {
        const updatedTable = await prisma.table.update({
          where: { id: order.tableID },
          data: { tableStatus: true },
        });
        //why reconstructing the table? because in table.vue, which was written in the beginning, i messed up the table status, so i have to reconstruct it
        const reconstructedTable = {
          ...updatedTable,
          status: updatedTable.tableStatus,
        };
        global.io.emit("tableUpdate", reconstructedTable);
        // console.log("Running at invoice.service.js! Table status updated: ", updatedTable);
      } catch (error) {
        console.log("1", error);
      }

      return invoice;
    } catch (error) {
      console.log("2", error);
    }
  }

  // async createTrashInvoice(data){
  //   const invoice = prisma.Invoice.create{
  //     totalCost: 0,
  //   }
  // }

  //IMPORTAINT!!!! THIS FUNCTION COULD BE ERROR!!!!!
  //I DONT'T USE IT IN THE FRONTEND, SO I DON'T KNOW IF IT WORKS OR NOT
  //BUT IF THERE'S AN ERROR, IT"S BECAUSE OF include: { invoiceDetail: true },
  async getInvoiceById(id) {
    const [invoices, total] = await Promise.all([
      prisma.invoice.findFirst({
        where: { id: id },
        orderBy: {
          invoiceDate: "desc",
        },
        include: {
          PromotionAfterInvoice: true,
          Employee: {
            include: {
              person: true,
            },
          },
          Table: true,
          invoiceDetail_list: {
            include: {
              Dish: true,
              // explantion: The first Promotion is actually PromotionAfterDish, the later promotion is THE PROMOTION, THE OBJECT, which contain the name of the promotion.
              Promotion: {
                include: {
                  Promotion: true,
                },
              },
            },
          },
        },
      }),
      prisma.invoice.count(),
    ]);

    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      invoiceDate: invoice.invoiceDate,
      totalCost: invoice.totalCost,
      orderNote: invoice.orderNote,
      employeeID: invoice.employeeID,
      employeeName: invoice.Employee.person.name,
      tableID: invoice.tableID,
      tableNumber: invoice.Table.tableNumber,
      finalTotalCost: invoice.finalTotalCost,
      ClientID: invoice.clientId,

      // probably proper way
      // promotionID: invoice.promotionID,
      // promotionName: invoice.PromotionAfterInvoice?.Promotion.Promotion.promotionName ?? 'No promotion',
      //This is CHEATING, i have no time
      promotionName: invoice.promotionName,
      discount: invoice.discount,

      invoiceDetails: invoice.invoiceDetail_list.map((detail) => ({
        id: detail.id,
        dishName: detail.Dish.name,
        quantity: detail.quantity,
        totalCost: detail.totalCost,
        createAt: detail.createAt,
        salePerUnit: detail.salesPerUnit,
        discount: detail.discount,
        promotionName: detail.promotionName,
        originalPrice: detail.originalPrice,
        promotionAfterDishID: detail.promotionAfterDishID,
      })),
    }));

    return {
      data: formattedInvoices,
    };
  }

  async getAllInvoicesVIP() {
    return await prisma.invoice.findMany({});
  }

  async getAllInvoices(page = 1, limit = 5) {
    const skip = (page - 1) * limit;
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        skip,
        take: limit,
        orderBy: {
          invoiceDate: "desc",
        },
        include: {
          PromotionAfterInvoice: true,
          Employee: {
            include: {
              person: true,
            },
          },
          Table: true,
          invoiceDetail_list: {
            include: {
              Dish: true,
              // explantion: The first Promotion is actually PromotionAfterDish, the later promotion is THE PROMOTION, THE OBJECT, which contain the name of the promotion.
              Promotion: {
                include: {
                  Promotion: true,
                },
              },
            },
          },
        },
      }),
      prisma.invoice.count(),
    ]);

    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      invoiceDate: invoice.invoiceDate,
      totalCost: invoice.totalCost,
      orderNote: invoice.orderNote,
      employeeID: invoice.employeeID,
      employeeName: invoice.Employee.person.name,
      tableID: invoice.tableID,
      tableNumber: invoice.Table.tableNumber,
      finalTotalCost: invoice.finalTotalCost,
      pointEarned: invoice.pointEarned || 0, //if no have =0
      pointUsed: invoice.pointUsed || 0, //same as earned

      // probably proper way
      // promotionID: invoice.promotionID,
      // promotionName: invoice.PromotionAfterInvoice?.Promotion.Promotion.promotionName ?? 'No promotion',
      //This is CHEATING, i have no time
      promotionName: invoice.promotionName,
      discount: invoice.discount,

      invoiceDetails: invoice.invoiceDetail_list.map((detail) => ({
        id: detail.id,
        dishName: detail.Dish.name,
        quantity: detail.quantity,
        totalCost: detail.totalCost,
        createAt: detail.createAt,
        salePerUnit: detail.salesPerUnit,
        discount: detail.discount,
        promotionName: detail.promotionName,
        originalPrice: detail.originalPrice,
        promotionAfterDishID: detail.promotionAfterDishID,
      })),
    }));

    return {
      data: formattedInvoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTableAfterInvoice(invoiceId) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { table: true },
    });
    return invoice.table;
  }

  async updateInvoice(id, data) {
    const invoice = await prisma.invoice.update({
      where: { id },
      data,
    });
    return invoice;
  }

  async getEmlpoyeeAfterInvoice(invoiceId) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { employee: true },
    });
    return invoice.employee;
  }

  //get total income, return in totalincome {today, week, month}
  async getTotalIncome() {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Total income for the day
    try {
      const totalIncomeDay = await prisma.invoice.aggregate({
        _sum: { finalTotalCost: true },
        where: {
          invoiceDate: {
            gte: startOfDay,
            lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000), // End of the day
          },
        },
      });

      // Total income for the week
      const totalIncomeWeek = await prisma.invoice.aggregate({
        _sum: { finalTotalCost: true },
        where: {
          invoiceDate: {
            gte: startOfWeek,
            lt: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000), // End of the week
          },
        },
      });

      // Total income for the month
      const totalIncomeMonth = await prisma.invoice.aggregate({
        _sum: { finalTotalCost: true },
        where: {
          invoiceDate: {
            gte: startOfMonth,
            lt: new Date(today.getFullYear(), today.getMonth() + 1, 1), // Start of the next month
          },
        },
      });

      return {
        today: totalIncomeDay._sum.finalTotalCost || 0,
        week: totalIncomeWeek._sum.finalTotalCost || 0,
        month: totalIncomeMonth._sum.finalTotalCost || 0,
      };
    } catch (error) {
      console.log(error.message);
    }
  }

  async getRecentInvoice() {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000); // Calculate the timestamp for 30 minutes ago
      console.log(thirtyMinutesAgo);
      const invoices = await prisma.invoice.findMany({
        where: {
          invoiceDate: {
            gte: thirtyMinutesAgo, // Filter invoices created in the last 30 minutes
          },
        },
        orderBy: {
          invoiceDate: "desc",
        },

        include: {
          PromotionAfterInvoice: true,
          Employee: {
            include: {
              person: true,
            },
          },
          Table: true,
          invoiceDetail_list: {
            include: {
              Dish: true,
              // explantion: The first Promotion is actually PromotionAfterDish, the later promotion is THE PROMOTION, THE OBJECT, which contain the name of the promotion.
              Promotion: {
                include: {
                  Promotion: true,
                },
              },
            },
          },
        },
      });

      const formattedInvoices = invoices.map((invoice) => ({
        id: invoice.id,
        invoiceDate: invoice.invoiceDate,
        finalTotalCost: invoice.finalTotalCost,
      }));
      return {
        //because it's what the frontend wants (why wrapped in data? just my habbit lol)
        data: {
          formattedInvoices,
        },
      };
    } catch (error) {
      console.log(error.message);
    }
  }

  //WHY IS THIS FUNCTION HERE? IT SHOULD BE IN INVOICE DETAIL SERVICE
  //stop yapping, im lazy to make controller and route file just for this, stfu, aint no resfulApi here, only rest in pieces api
  async getTopDish() {
    // Calculate date ranges
    const todayStart = startOfDay(new Date());
    const weekStart = startOfWeek(new Date());
    const monthStart = startOfMonth(new Date());

    // Helper function to get top dishes for a given date range
    const getTopDishesForPeriod = async (dateFrom) => {
      const topDishes = await prisma.invoiceDetail.groupBy({
        by: ["dishID"],
        _count: {
          dishID: true,
        },
        where: {
          Invoice: {
            invoiceDate: {
              gte: dateFrom,
            },
          },
        },
        orderBy: {
          _count: {
            dishID: "desc",
          },
        },
        take: 3,
      });

      const dishIds = topDishes.map((d) => d.dishID);
      const dishes = await prisma.dish.findMany({
        where: {
          id: { in: dishIds },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const dishMap = dishes.reduce((acc, dish) => {
        acc[dish.id] = dish.name;
        return acc;
      }, {});

      return topDishes.map((d) => ({
        id: d.dishID,
        dishName: dishMap[d.dishID],
        count: d._count.dishID,
      }));
    };

    // Get top dishes for today, this week, and this month
    const [today, week, month] = await Promise.all([
      getTopDishesForPeriod(todayStart),
      getTopDishesForPeriod(weekStart),
      getTopDishesForPeriod(monthStart),
    ]);

    return {
      data: {
        today,
        week,
        month,
      },
    };
  }

  async getIncomeData() {
    const incomeData = {
      day: [],
      week: [],
      month: [],
      year: [],
    };

    const today = new Date();
    const startOfToday = startOfDay(today);
    const startOfThisWeek = startOfWeek(today);
    const startOfThisMonth = startOfMonth(today);
    const startOfThisYear = new Date(today.getFullYear(), 0, 1);

    console.log(
      "Today, start of today, start of this week, start of this month, start of this year: ",
      today,
      startOfToday,
      startOfThisWeek,
      startOfThisMonth,
      startOfThisYear
    );

    // Helper function to get income data for a given period
    //not used
    const getIncomeDataForPeriod = async (startDate, endDate, timeUnit) => {
      const incomeDataPoints = await prisma.invoice.groupBy({
        by: [timeUnit],
        _sum: {
          finalTotalCost: true,
        },
        where: {
          invoiceDate: {
            gte: startDate,
            lt: endDate,
          },
        },
        orderBy: {
          [timeUnit]: "asc",
        },
      });

      const expenseDataPoints = await prisma.expense.groupBy({
        by: [timeUnit],
        _sum: {
          expenseMoney: true,
        },
        where: {
          createAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        orderBy: {
          [timeUnit]: "asc",
        },
      });

      const ingredientCostDataPoints = await prisma.importInvoice.groupBy({
        by: [timeUnit],
        _sum: {
          totalExpense: true,
        },
        where: {
          createAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        orderBy: {
          [timeUnit]: "asc",
        },
      });

      return incomeDataPoints.map((dataPoint, index) => ({
        timeUnit: dataPoint[timeUnit],
        income: dataPoint._sum.finalTotalCost || 0,
        expense: expenseDataPoints[index]?._sum.expenseMoney || 0,
        ingredientCost: ingredientCostDataPoints[index]?._sum.totalExpense || 0,
      }));
    };

    // Get income data for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(startOfToday);
      date.setDate(date.getDate() - i);
      const income = await prisma.invoice.aggregate({
        _sum: { finalTotalCost: true },
        where: {
          invoiceDate: {
            gte: startOfDay(date),
            lt: startOfDay(new Date(date.getTime() + 24 * 60 * 60 * 1000)),
          },
        },
      });
      const expense = await prisma.expense.aggregate({
        _sum: { expenseMoney: true },
        where: {
          createAt: {
            gte: startOfDay(date),
            lt: startOfDay(new Date(date.getTime() + 24 * 60 * 60 * 1000)),
          },
        },
      });
      const ingredientCost = await prisma.importInvoice.aggregate({
        _sum: { totalExpense: true },
        where: {
          createAt: {
            gte: startOfDay(date),
            lt: startOfDay(new Date(date.getTime() + 24 * 60 * 60 * 1000)),
          },
        },
      });
      incomeData.day.push({
        timeUnit: date.toISOString().split("T")[0],
        income: income._sum.finalTotalCost || 0,
        expense: expense._sum.expenseMoney || 0,
        ingredientCost: ingredientCost._sum.totalExpense || 0,
      });
    }

    // Get income data for the last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const date = new Date(startOfThisWeek);
      date.setDate(date.getDate() - i * 7);
      const income = await prisma.invoice.aggregate({
        _sum: { finalTotalCost: true },
        where: {
          invoiceDate: {
            gte: startOfWeek(date),
            lt: startOfWeek(new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000)),
          },
        },
      });
      const expense = await prisma.expense.aggregate({
        _sum: { expenseMoney: true },
        where: {
          createAt: {
            gte: startOfWeek(date),
            lt: startOfWeek(new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000)),
          },
        },
      });
      const ingredientCost = await prisma.importInvoice.aggregate({
        _sum: { totalExpense: true },
        where: {
          createAt: {
            gte: startOfWeek(date),
            lt: startOfWeek(new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000)),
          },
        },
      });
      incomeData.week.push({
        timeUnit: `Week ${12 - i}`,
        income: income._sum.finalTotalCost || 0,
        expense: expense._sum.expenseMoney || 0,
        ingredientCost: ingredientCost._sum.totalExpense || 0,
      });
    }

    // Get income data for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(startOfThisMonth);
      date.setMonth(date.getMonth() - i);
      const income = await prisma.invoice.aggregate({
        _sum: { finalTotalCost: true },
        where: {
          invoiceDate: {
            gte: startOfMonth(date),
            lt: startOfMonth(
              new Date(date.getFullYear(), date.getMonth() + 1, 1)
            ),
          },
        },
      });
      const expense = await prisma.expense.aggregate({
        _sum: { expenseMoney: true },
        where: {
          createAt: {
            gte: startOfMonth(date),
            lt: startOfMonth(
              new Date(date.getFullYear(), date.getMonth() + 1, 1)
            ),
          },
        },
      });
      const ingredientCost = await prisma.importInvoice.aggregate({
        _sum: { totalExpense: true },
        where: {
          createAt: {
            gte: startOfMonth(date),
            lt: startOfMonth(
              new Date(date.getFullYear(), date.getMonth() + 1, 1)
            ),
          },
        },
      });
      incomeData.month.push({
        timeUnit: date.toISOString().split("T")[0].slice(0, 7),
        income: income._sum.finalTotalCost || 0,
        expense: expense._sum.expenseMoney || 0,
        ingredientCost: ingredientCost._sum.totalExpense || 0,
      });
    }

    // Get income data for each year
    const currentYear = new Date().getFullYear();

    // Get the year of the first invoice
    const firstInvoice = await prisma.invoice.findFirst({
      orderBy: {
        invoiceDate: "asc",
      },
      select: {
        invoiceDate: true,
      },
    });

    if (firstInvoice) {
      const firstYear = new Date(firstInvoice.invoiceDate).getFullYear();

      // Add a mock data point for the year before the first year with income = 0, because the chart library requires at least 2 data points
      if (firstYear === currentYear) {
        incomeData.year.push({
          timeUnit: (firstYear - 1).toString(),
          income: 0,
          expense: 0,
          ingredientCost: 0,
        });
      }

      for (let year = firstYear; year <= currentYear; year++) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);
        const income = await prisma.invoice.aggregate({
          _sum: { finalTotalCost: true },
          where: {
            invoiceDate: {
              gte: startDate,
              lt: endDate,
            },
          },
        });
        const expense = await prisma.expense.aggregate({
          _sum: { expenseMoney: true },
          where: {
            createAt: {
              gte: startDate,
              lt: endDate,
            },
          },
        });
        const ingredientCost = await prisma.importInvoice.aggregate({
          _sum: { totalExpense: true },
          where: {
            createAt: {
              gte: startDate,
              lt: endDate,
            },
          },
        });
        incomeData.year.push({
          timeUnit: year.toString(),
          income: income._sum.finalTotalCost || 0,
          expense: expense._sum.expenseMoney || 0,
          ingredientCost: ingredientCost._sum.totalExpense || 0,
        });
      }
    }

    return incomeData;
  }

  async customGetIncomeData(startDay, endDate, step) {
    try {
      const incomeData = {
        day: [],
      };
      step = parseInt(step); // Ensure step is an integer

      const startDate = parseISO(startDay);
      const endDateObj = parseISO(endDate);
      const startOfEndDate = startOfDay(endDateObj);
      console.log(
        "Start date, end date, start of end date: ",
        startDate,
        endDateObj,
        startOfEndDate,
        step
      );

      // Get income data for each range of days from startDay to endDate with the specified step
      for (
        let date = new Date(startDate);
        date <= startOfEndDate;
        date.setDate(date.getDate() + step)
      ) {
        const rangeStart = new Date(date);
        const rangeEnd = new Date(date);
        rangeEnd.setDate(rangeEnd.getDate() + step - 1);

        if (rangeEnd > startOfEndDate) {
          rangeEnd.setDate(startOfEndDate.getDate());
        }

        const income = await prisma.invoice.aggregate({
          _sum: { finalTotalCost: true },
          where: {
            invoiceDate: {
              gte: startOfDay(rangeStart),
              lt: startOfDay(
                new Date(rangeEnd.getTime() + 24 * 60 * 60 * 1000)
              ),
            },
          },
        });
        const expense = await prisma.expense.aggregate({
          _sum: { expenseMoney: true },
          where: {
            createAt: {
              gte: startOfDay(rangeStart),
              lt: startOfDay(
                new Date(rangeEnd.getTime() + 24 * 60 * 60 * 1000)
              ),
            },
          },
        });
        const ingredientCost = await prisma.importInvoice.aggregate({
          _sum: { totalExpense: true },
          where: {
            createAt: {
              gte: startOfDay(rangeStart),
              lt: startOfDay(
                new Date(rangeEnd.getTime() + 24 * 60 * 60 * 1000)
              ),
            },
          },
        });

        incomeData.day.push({
          timeUnit: `${rangeStart.getDate()}-${rangeEnd.getDate()}/${rangeStart.getMonth() + 1}/${rangeStart.getFullYear()}`,
          income: income._sum.finalTotalCost || 0,
          expense: expense._sum.expenseMoney || 0,
          ingredientCost: ingredientCost._sum.totalExpense || 0,
        });
      }

      return incomeData;
    } catch (error) {
      console.log(error.message);
    }
  }

  async createInvoicesForAllOrders() {
    try {
      // Fetch all orders
      const orders = await prisma.order.findMany();

      // Fetch all clients
      const clients = await prisma.client.findMany();

      // Check if there are any clients
      if (clients.length === 0) {
        throw new Error("No clients found");
      }

      // Loop through each order and create an invoice
      for (const order of orders) {
        // Select a random client
        const randomClient =
          clients[Math.floor(Math.random() * clients.length)];

        // Prepare data for createInvoice method
        const data = {
          OrderID: order.id,
          ClientID: randomClient.id,
          pointUsed: 0,
        };

        // Call createInvoice method
        await this.createInvoice(data);
      }
    } catch (error) {
      console.log("Error creating invoices for all orders:", error.message);
    }
  }

  async getAllInvoicesHaveClientID() {
    const invoices = await prisma.invoice.findMany({
      where: {
        clientId: {
          not: null,
        },
      },
      orderBy: {
        invoiceDate: "desc",
      },
      include: {
        PromotionAfterInvoice: true,
        Table: true,
        invoiceDetail_list: {
          include: {
            Dish: true,
            Promotion: {
              include: {
                Promotion: true,
              },
            },
          },
        },
      },
    });

    return invoices;
  }
}

module.exports = new InvoiceService();
