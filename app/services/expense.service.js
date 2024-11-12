const prisma = require('../../prisma/client');

class expenseService{
    async createExpense(data){
        try{
            return await prisma.Expense.create({data});
        }catch(error){
            throw error;
        }
    }

    async getExpenseById(id){
        try{
            return await prisma.Expense.findUnique({where: {id}});
        }catch(error){
            throw error;
        }
    }

    //no sort yet
    async getAllExpenses(page = 1, limit = 5, sortColumn = 'createAt', sortOrder = 'desc', search = '') {
        const skip = (page - 1) * limit;
        const orderBy = {};
        // Validate sortColumn to prevent potential SQL injection
        const allowedColumns = ['expenseName', 'expenseMoney', 'createAt'];
        if (allowedColumns.includes(sortColumn)) {
            orderBy[sortColumn] = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';
        } else {
            orderBy.createAt = 'asc'; // Default sorting
        }

        let where;
        if (search) {
            where = { isDeleted: false, expenseName: { contains: search, mode: 'insensitive' } };
        }else{
            where = {isDeleted: false};
        }

        const [data, total] = await Promise.all([
            prisma.Expense.findMany({
            where,
            skip,
            take: limit,
            orderBy,
        }),
            //count total data of the input condition   
            prisma.Expense.count({ where }),
        ]);

        return {
        data,
        total,
        page,
        limit,
        search,
        totalPages: Math.ceil(total / limit),
        };
    }

    //might unused
    async getAllExpensesREAL(){
        try{
            return await prisma.expense.findMany();
        }catch(error){
            throw error;
        }
    }

    async updateExpense(id, data){
        try{
            return await prisma.expense.update({where: {id}, data});
        }catch(error){
            throw error;
        }
    }

    async deleteExpense(id){
        try{
            return await prisma.expense.update({where: {id}, data: {isDeleted: true}}); 
        }catch(error){
            throw error;
        }
    }

}

module.exports = new expenseService();