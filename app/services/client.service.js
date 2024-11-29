const e = require("express");
const prisma = require("../../prisma/client");
const bcrypt = require("bcrypt");

class ClientService {
  async createClient(data) {
    try {
      //profilePicture should be default by the "default avatar link"
      const {
        accountUsername,
        accountPassword,
        name,
        profilePicture,
        verificationToken,
        tokenExpiresAt,
        gender,
      } = data;

      //create a person
      const person = await prisma.person.create({
        data: {
          name: name,
          profilePicture: "",
        },
      });

      //create an client linked to that person
      console.log(person.id, gender);
      const client = await prisma.client.create({
        data: {
          phoneNumber: null,
          email: null,
          point: 0,
          personId: person.id,
          gender: true,
        },
      });
      console.log(client);
      console.log("I run here");

      await prisma.person.update({
        where: { id: person.id },
        data: { clientId: client.id }, // Gán clientId vào person
      });
      console.log("I run 2");
      const hashedPassword = await this.hashPassword(accountPassword);
      console.log("I run 3");
      const account = await prisma.account.create({
        data: {
          verificationToken: verificationToken,
          tokenExpiresAt: tokenExpiresAt,
          accountUsername: accountUsername,
          accountPassword: hashedPassword,
          AccountAuthority: 2,
          personId: person.id,
        },
      });
      console.log("Im running");

      return client;
    } catch (error) {
      console.log(error.message);
    }
  }
  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }
  async getClientById(id) {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        person: {
          include: {
            account: true,
          },
        },
      },
    });
  }

  async getAllClients(
    page = 1,
    limit = 5,
    sortColumn = "createAt",
    sortOrder = "desc",
    search = ""
  ) {
    try {
      let where = { isDeleted: false };
      if (search !== "") {
        where = {
          ...where,
          OR: [
            { phoneNumber: { contains: search, mode: "insensitive" } },
            { person: { name: { contains: search, mode: "insensitive" } } },
          ],
        };
      }
      let orderBy = {};
      if (sortColumn === "clientName") {
        orderBy = {
          person: {
            name: sortOrder,
          },
        };
      } else {
        orderBy = {
          [sortColumn]: sortOrder,
        };
      }

      const [clients, total] = await Promise.all([
        prisma.client.findMany({
          where,
          include: {
            person: {
              include: {
                account: true,
              },
            },
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.client.count({ where }),
      ]);
      return {
        data: clients,
        total,
        limit,
        page,
        totalPage: Math.ceil(total / limit),
      };
    } catch (error) {
      console.log(error);
    }
  }

  async updateClient(id, data) {
    console.log("bắt đầu cập nhật");
    const {
      name,
      profilePicture,
      point,
      email,
      phoneNumber,
      accountPassword,
      verificationToken,
      tokenExpiresAt,
    } = data;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        person: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    // Cập nhật thông tin người dùng (person)
    const person = await prisma.person.update({
      where: { id: client.personId },
      data: {
        name: name,
        profilePicture: profilePicture,
      },
    });

    // Cập nhật thông tin khách hàng
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        point: point,
        email: email,
        phoneNumber: phoneNumber,
      },
    });

    if (email) {
      const accountId = client.person.account[0].id;
      if (accountId) {
        console.log("cập nhật account");
        await prisma.account.update({
          where: { id: accountId },
          data: {
            accountPassword: accountPassword,
            verificationToken: verificationToken,
            tokenExpiresAt: tokenExpiresAt,
          },
        });
      }
    }

    return updatedClient;
  }

  async deleteClient(id) {
    // Soft delete (set isDeleted to true) for both Employee and related Person
    const client = await prisma.client.update({
      where: { id },
      data: { isDeleted: true },
    });

    // Soft delete related Person using personId from the Employee
    const person = await prisma.person.update({
      where: { id: client.personId },
      data: { isDeleted: true },
    });

    const account = await prisma.account.update({
      where: { id: client.accountId },
      data: { isDeleted: true },
    });

    return { client, person };
  }

  async banClient(id, reason) {
    console.log(id, reason);
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        person: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!client) {
      throw new Error("Client not found");
    } else {
      const account = await prisma.account.update({
        where: { id: client.person.account[0].id },
        data: { accountIsLocked: true, accountLockReason: reason },
      });
      return account;
    }
  }

  async unbanClient(id) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        person: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!client) {
      throw new Error("Client not found");
    } else {
      const account = await prisma.account.update({
        where: { id: client.person.account[0].id },
        data: { accountIsLocked: false, accountLockReason: null },
      });
      return account;
    }
  }
}

module.exports = new ClientService();
