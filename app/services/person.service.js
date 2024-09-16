const prisma = require('../../prisma/client');

class PersonService {
  async createDish(data) {
    return await prisma.person.create({ data });
  }

  async getPersonById(id) {
    return await prisma.person.findUnique({
      where: { id },
    });
  }

  async getAllPerson() {
    return await prisma.person.findMany({
      where: { isDeleted: false },
    });
  }

  async updatePerson(id, data) {
    return await prisma.person.update({
      where: { id },
      data,
    });
  }

  async deletePerson(id) {
    // Soft delete (set isDeleted to true)
    return await prisma.person.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}


module.exports = new PersonService();

