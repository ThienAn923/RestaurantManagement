const prisma = require('../../prisma/account');

class AccountService {
  async createDish(data) {
    return await prisma.account.create({ data });
  }

  async getAccountById(id) {
    return await prisma.account.findUnique({
      where: { id },
    });
  }

  async getAllAccount() {
    return await prisma.account.findMany({
      where: { isDeleted: false },
      include: { costs: true },
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
}


module.exports = new AccountService();

