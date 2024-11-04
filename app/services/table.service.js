// table.service.js
const prisma = require('../../prisma/client'); // Go up two directories from 'service' to 'project' then into 'prisma'

class TableService {
    async createTable(data) {
        const table = await prisma.table.create({ data });
        global.io.emit("tableAdd",table)
        console.log(table);
        return table;
        
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
        console.log("Updating table");
        const {numberOfSeats: seatNumber, status: tableStatus, ... rest} = data;
        const updatedData = { ...rest, seatNumber, tableStatus };
        const updatedTable = await prisma.table.update({
            where: { id },
            data: updatedData,
        });
        
        //why reconstructing the table? because in table.vue, which was written in the beginning, i messed up the table status, so i have to reconstruct it
        const reconstructedTable = { ...updatedTable, status: updatedTable.tableStatus };
        global.io.emit("tableUpdate",reconstructedTable);
        return updatedTable;
    }

    async deleteTable(id) {
        // Soft delete (set isDeleted to true)
        return await prisma.table.update({
        where: { id },
        data: { isDeleted: true },
        });
    }

    //change status of table
    async changeStatus(id){
        return await prisma.table.update({
            where: {id},
            data: {tableStatus: newStatus}
        })
    }
}


module.exports = new TableService();

