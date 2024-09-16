// dish.service.js
const prisma = require('../../prisma/client'); // Go up two directories from 'service' to 'project' then into 'prisma'

class DishTypeService {
  async createDishType(data) {
    return await prisma.DishType.create({ data });
  }

  async getDishTypeById(id) {
    return await prisma.DishType.findUnique({
      where: { id },
      include: { costs: true }, // Include costs if needed
    });
  }

  async getAllDishTypes() {
    return await prisma.DishType.findMany({
      where: { isDeleted: false },
    });
  }

  async updateDishType(id, data) {
    return await prisma.DishType.update({
      where: { id },
      data,
    });
  }

  async deleteDishType(id) {
    // Soft delete (set isDeleted to true)
    return await prisma.DishType.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}


module.exports = new DishTypeService();