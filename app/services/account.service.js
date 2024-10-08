const prisma = require('../../prisma/client');
// const bcrypt = require('bcrypt');
class AccountService {
  async createDish(data) {
    return await prisma.account.create({ data });
  }

  async getAccountById(id) {
    return await prisma.account.findUnique({
      where: { id },
    });
  }

  async getAllAccounts() {
    return await prisma.account.findMany({
      where: { isDeleted: false },
    });
  }

  async updateAccount(id, data) {
    return await prisma.account.update({
      where: { id },
      data,
    });
  }

  async deleteAccount(id) {
    // Soft delete (set isDeleted to true)
    return await prisma.account.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async getAccountByUsername(username) {
    return await prisma.account.findFirst({
        where: { accountUsername: username },
    });
  }
}


module.exports = new AccountService();

