// table.service.js
const prisma = require('../../prisma/client'); // Go up two directories from 'service' to 'project' then into 'prisma'

class TableService {
    async createDish(data) {
        return await prisma.table.create({ data });
    }

    async getDishById(id) {
        return await prisma.table.findUnique({
        where: { id },
        });
    }

    async getAllTablees() {
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
            data: {tableStatus}
        })
    }
}


module.exports = new TableService();

