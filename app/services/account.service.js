const prisma = require("../../prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AccountService {
  async createDish(data) {
    return await prisma.account.create({ data });
  }

  async getAccountById(id) {
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        Person: {
          select: {
            id: true, // Include personId
            name: true,
          },
        },
      },
    });

    if (!account || !account.Person) {
      return null;
    }

    // Second query to get the employeeId using personId
    const employee = await prisma.employee.findFirst({
      where: { personId: account.Person.id },
      select: { id: true },
    });

    return {
      ...account,
      Person: {
        ...account.Person,
        Employee: employee ? { id: employee.id } : null,
      },
    };
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
  // This function will be complicated when look at, but just know that it return account -> person -> employee, that's all
  // The database was not build for account -> person -> employee, so i have to do this
  async getAccountByUsername(username) {
    // First query to get the personId and name
    const account = await prisma.account.findFirst({
      where: { accountUsername: username },
      include: {
        Person: {
          select: {
            id: true, // Include personId
            name: true,
          },
        },
      },
    });

    if (!account || !account.Person) {
      return null;
    }

    // Second query to get the employeeId using personId
    const employee = await prisma.employee.findFirst({
      where: { personId: account.Person.id },
      select: { id: true },
    });

    return {
      ...account,
      Person: {
        ...account.Person,
        Employee: employee ? { id: employee.id } : null,
      },
    };
  }

  async getAccountByUsernameForClient(username) {
    //lmao XD
    try {
      // First query to get the personId and name
      return await prisma.account.findFirst({
        where: { accountUsername: username },
        include: {
          Person: {
            select: {
              id: true, // Include personId
              name: true,
              clientId: true,
            },
          },
        },
      });
      // if (!account || !account.Person) {
      //   return null;
      // }

      // // Second query to get the employeeId using personId
      // const employee = await prisma.employee.findFirst({
      //   where: { personId: account.Person.id },
      //   select: { id: true },
      // });

      // return {
      //   ...account,
      //   Person: {
      //     ...account.Person,
      //     Employee: employee ? { id: employee.id } : null,
      //   },
      // };
    } catch (error) {
      console.log(`message ${error.message}`);
    }
  }

  async login(username, password) {
    const account = await this.getAccountByUsername(username);
    console.log(account);
    if (!account) {
      console.log("No account found for username:", username);
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      account.accountPassword
    );
    if (!isPasswordValid) {
      console.log("Invalid password for username:", username);
      return null;
    }

    const token = jwt.sign(
      {
        id: account.id, // Ensure this line is present
        username: account.accountUsername,
        authority: account.accountAuthority,
        name: account.Person.name,
        employeeId: account.Person.Employee.id, // Include EmployeeID in the token payload
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    return { token, account };
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  async loginClient(username, password) {
    try {
      console.log(`${username} + ${password}`);
      const account = await this.getAccountByUsernameForClient(username);
      // console.log("ACOUNTTTTTTTTTTTTTTTTTTTTTTTTT", account);
      if (!account) {
        console.log("No account found for username:", username);
        return null;
      }
      console.log(JSON.stringify(account));
      const isPasswordValid = await bcrypt.compare(
        password,
        account.accountPassword
      );
      if (!isPasswordValid) {
        console.log("Invalid password for username:", username);
        return null;
      }
      if (!account.isVerified) {
        return null;
      }
      const token = jwt.sign(
        {
          id: account.id, // Ensure this line is present
          username: account.accountUsername,
          authority: account.AccountAuthority,
          name: account.Person.name,
          clientId: account.Person.clientId, // Include EmployeeID in the token payload
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
      console.log("Token", token);
      return { token, account };
    } catch (error) {
      console.log(error.message);
      return "hello";
    }
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
