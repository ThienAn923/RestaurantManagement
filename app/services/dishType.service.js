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

  // async getAllDishTypes() {
  //   return await prisma.DishType.findMany({
  //     where: { isDeleted: false },
  //   });
  // }

  //testing pinia
  async getAllDishTypes(page = 1, limit = 5) {
    const skip = (page - 1) * limit;
    const [dishTypes, total] = await Promise.all([
      prisma.DishType.findMany({
        where: { isDeleted: false },
        skip,
        take: limit,
        orderBy: { DishTypeName: 'asc' },
      }),
      prisma.DishType.count({ where: { isDeleted: false } }),
    ]);

    return {
      dishTypes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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