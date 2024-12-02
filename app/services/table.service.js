// table.service.js
const prisma = require("../../prisma/client"); // Go up two directories from 'service' to 'project' then into 'prisma'

class TableService {
  async createTable(data) {
    try {
      const existingTable = await prisma.table.findUnique({
        where: { tableNumber: data.tableNumber },
      });

      let table;
      if (existingTable) {
        table = await prisma.table.update({
          where: { tableNumber: data.tableNumber },
          data: {
            seatNumber: data.seatNumber,
            tableStatus: data.tableStatus,
            isDeleted: false, //ya know why? because if the user create the new table with the same number, the old table will be updated, but wont shows because it's deleted lmaooooo
          },
        });
        global.io.emit("tableUpdate", table);
        return table;
      } else {
        table = await prisma.table.create({ data });
        global.io.emit("tableAdd", table);
        return table;
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  async getTableById(id) {
    return await prisma.table.findUnique({
      where: { id },
    });
  }

  async getAllTables() {
    return await prisma.table.findMany({
      where: { isDeleted: false }, // Filter only available tablees
    });
  }

  async getUsableTables() {
    console.log("Running from getUsableTables in table.service.js");
    return await prisma.table.findMany({
      where: { isDeleted: false, tableStatus: true }, // Filter only available tables
    });
  }

  async updateTable(id, data) {
    try {
      console.log("Updating table");
      console.log(data.tableStatus);
      const noErrorStatus = data.tableStatus;
      const { numberOfSeats: seatNumber, status: tableStatus, ...rest } = data;
      //   console.log(numberOfSeats, status, rest);
      const updatedData = { ...rest, seatNumber, tableStatus };
      const updatedTable = await prisma.table.update({
        where: { id },
        data: {
          tableStatus: noErrorStatus,
          //   seatNumber: updatedTable.seatNumber,
        },
      });

      //why reconstructing the table? because in table.vue, which was written in the beginning, i messed up the table status, so i have to reconstruct it
      const reconstructedTable = {
        ...updatedTable,
        status: noErrorStatus,
      };
      global.io.emit("tableUpdate", reconstructedTable);
      return updatedTable;
    } catch (err) {
      console.log(err.message);
    }
  }

  async deleteTable(id) {
    // Soft delete (set isDeleted to true)
    return await prisma.table.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  //change status of table
  async changeStatus(id) {
    return await prisma.table.update({
      where: { id },
      data: { tableStatus: newStatus },
    });
  }
}

module.exports = new TableService();
