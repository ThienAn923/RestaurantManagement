// table.service.js
const prisma = require('../../prisma/client'); // Go up two directories from 'service' to 'project' then into 'prisma'

class TableService {
    async createTable(data) {
        return await prisma.table.create({ data });
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

    async updateTable(id, data) {
        return await prisma.table.update({
        where: { id },
        data,
        });
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

