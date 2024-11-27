const prisma = require('../../prisma/client');
const bcrypt = require('bcrypt');

class ClientService {
    async createClient(data) {
        //profilePicture should be default by the "default avatar link"
        const { accountUsername,accountPassword,name, profilePicture,verificationToken, tokenExpiresAt, gender} = data;
    
        //create a person
        const person = await prisma.person.create({
            data: {
                name: name,
                profilePicture: "",
            }
        });

        //create an client linked to that person
        const client = await prisma.client.create({
            data: {
                phoneNumber: "",
                email: "",
                point: 0,
                personId: person.id,
                gender: gender
            }
        });
        
        await prisma.person.update({
            where: { id: person.id },
            data: { clientId: client.id } // Gán clientId vào person
        });
        const hashedPassword = await this.hashPassword(accountPassword);
        const account = await prisma.account.create({
            data: {
                verificationToken: verificationToken,
                tokenExpiresAt: tokenExpiresAt,
                accountUsername: accountUsername,
                accountPassword: hashedPassword,
                AccountAuthority: 2, 
                personId: person.id,
            }
        });
       
        return client;
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
                    account: true
                  }
                }
              }
        });
    }

   async getAllClients() {
  return await prisma.client.findMany({
    where: {
      isDeleted: false
    },
    include: {
      person: {
        include: {
          account: true
        }
      }
    }
  });
}

async updateClient(id, data) {
    console.log("bắt đầu cập nhật");
    const { name, profilePicture, point, email , phoneNumber,accountPassword, verificationToken, tokenExpiresAt} = data;

    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            person: {
                include: {
                    account: true
                }
            }
        }
    });

    if (!client) {
        throw new Error('Client not found');
    }

    // Cập nhật thông tin người dùng (person)
    const person = await prisma.person.update({
        where: { id: client.personId },
        data: {
            name: name,
            profilePicture: profilePicture,
        }
    });

    // Cập nhật thông tin khách hàng
    const updatedClient = await prisma.client.update({
        where: { id },
        data: {
            point: point,
            email: email,
            phoneNumber: phoneNumber
        }
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
                    tokenExpiresAt: tokenExpiresAt
                }
            });
        }
    }
    


    return updatedClient;
}

    async deleteClient(id) {
        // Soft delete (set isDeleted to true) for both Employee and related Person
        const client = await prisma.client.update({
        where: { id },
            data: { isDeleted: true},
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
}


module.exports = new ClientService();

