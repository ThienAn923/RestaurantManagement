const prisma = require('../../prisma/client');

class ClientService {
    async createClient(data) {
        //profilePicture should be default by the "default avatar link"
        const { name, profilePicture, point } = data;
    
        //create a person
        const person = await prisma.person.create({
            data: {
                name: name,
                profilePicture: profilePicture,
            }
        });

        //create an client linked to that person
        const client = await prisma.client.create({
            data: {
                point,
                personId: person.id,
            }
        });

        const account = await prisma.account.create({
            data: {
                accountUsername: name,
                accountPassword: '123456',
                accountAuthory: 2,  //2 for clients
            }
        });

        return client;
    }

    async getClientById(id) {
        return await prisma.client.findUnique({
            where: { id },
            include:{
                person: true,
                account: true,
            },
        });
    }

    async getAllClient() {
        return await prisma.client.findMany({
        where: { isDeleted: false },
        include:{
            person: true,
            account: true,
        },
        });
    }

    async updateClient(id, data) {
        const { name, profilePicture, point, accountUsername, accountPassword} = data;
        const client = await prisma.client.findUnique({
            where: { id },
            include: { person: true,
            account: true,
         }, // Include person, account details
        });

        if (!client) {
            throw new Error('Employee not found');
        }

        await prisma.person.update({
            where: { id: client.personId },
            data: {
            name: name,
            profilePicture: profilePicture,
            }
        });

        const updatedClient = await prisma.client.update({
            where: { id },
            data: {
                point: point,
            }
        });

        const updatedAccount = await prisma.account.update({
            where: { id: client.accountId },
            data: {
                accountUsername: accountUsername,
                accountPassword: accountPassword,
            }
        });

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
}


module.exports = new ClientService();

