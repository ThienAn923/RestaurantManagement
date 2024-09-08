// dish.service.js
const prisma = require('../../prisma/client'); // Go up two directories from 'service' to 'project' then into 'prisma'

class DishService {
  async createDish(data) {
    return await prisma.dish.create({ data });
  }

  async getDishById(id) {
    return await prisma.dish.findUnique({
      where: { id },
      include: { costs: true }, // Include costs if needed
    });
  }

  async getAllDishes() {
    return await prisma.dish.findMany({
      where: { isDeleted: false }, // Filter only available dishes
      include: { costs: true }, // Optionally include costs
    });
  }

  async updateDish(id, data) {
    return await prisma.dish.update({
      where: { id },
      data,
    });
  }

  async deleteDish(id) {
    // Soft delete (set isDeleted to true)
    return await prisma.dish.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}


module.exports = new DishService();

