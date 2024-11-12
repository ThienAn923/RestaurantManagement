const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTableStatus() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tables = await prisma.table.findMany({ where: { isDeleted: false } });

    const updatePromises = tables.map(async (table) => {
      const orders = await prisma.order.findMany({
        where: {
          tableID: table.id,
          forDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      const tableStatus = orders.length > 0 ? false : true;
      return prisma.table.update({
        where: { id: table.id },
        data: { tableStatus },
      });
    });

    await Promise.all(updatePromises);
    console.log('Table status updated successfully');
  } catch (error) {
    console.error('Error updating table status:', error);
  }
}

module.exports = { updateTableStatus };