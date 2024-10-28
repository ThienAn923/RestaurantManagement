const prisma = require('../../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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


  //will make username become unique later lmao
  async getAccountByUsername(username) {
    return await prisma.account.findFirst({
        where: { accountUsername: username },
    });
  }

  async login(username, password) {
    const account = await this.getAccountByUsername(username);
    if (!account) {
        console.log('No account found for username:', username);
        return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, account.accountPassword);
    if (!isPasswordValid) {
        console.log('Invalid password for username:', username);
        return null;
    }

    const token = jwt.sign(
        { 
            id: account.id,  // Ensure this line is present
            username: account.accountUsername, 
            authority: account.accountAuthority 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );

    return { token, account };
}

  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  // Update createAccount method to hash the password
  async createAccount(data) {
    const hashedPassword = await this.hashPassword(data.accountPassword);
    return await prisma.account.create({
      data: {
        ...data,
        accountPassword: hashedPassword,
      },
    });
  }
}


module.exports = new AccountService();

