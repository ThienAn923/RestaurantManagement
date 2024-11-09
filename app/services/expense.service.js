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
    async getAllExpenses(page, limit){
        try{
            return await prisma.expense.findMany({skip: (page-1)*limit, take: limit});
        }catch(error){
            throw error;
        }
    }

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
            return await prisma.expense.delete({where: {id}});
        }catch(error){
            throw error;
        }
    }

}

module.exports = new expenseService();