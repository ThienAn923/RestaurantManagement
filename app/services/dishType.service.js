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

  async getAllDishTypesREAL() {
    return await prisma.DishType.findMany({
      where: { isDeleted: false },
    });
  }

  // //testing pinia
  // async getAllDishTypes(page = 1, limit = 5) {
  //   const skip = (page - 1) * limit;
  //   const [dishTypes, total] = await Promise.all([
  //     prisma.DishType.findMany({
  //       where: { isDeleted: false },
  //       skip,
  //       take: limit,
  //       orderBy: { DishTypeName: 'asc' },
  //     }),
  //     prisma.DishType.count({ where: { isDeleted: false } }),
  //   ]);

  //   return {
  //     dishTypes,
  //     total,
  //     page,
  //     limit,
  //     totalPages: Math.ceil(total / limit),
  //   };
  // }

  // //testing pinia with sort
  async getAllDishTypes(page = 1, limit = 5, sortColumn = 'DishTypeName', sortOrder = 'asc', search = '', filter = 'AllStatus', ) {
    // console.log(sortColumn);
    const skip = (page - 1) * limit;
    const orderBy = {};
    
    // Validate sortColumn to prevent potential SQL injection
    const allowedColumns = ['DishTypeName', 'DishTypeDescription', 'DishTypeAvailable', 'createAt', 'updateAt'];
    if (allowedColumns.includes(sortColumn)) {
        orderBy[sortColumn] = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';
    } else {
        orderBy.createAt = 'asc'; // Default sorting
    }

    //if the string is not AllStatus, or true, this will have a value of false, if string is "true" this will have a value of true
    //if the string is AllStatus, this will have a value of AllStatus
    let where;
    if (filter !== 'AllStatus' || search !== '') {
        where = {
            isDeleted: false, 
            AND: [
                ...(filter !== 'AllStatus' ? [{ DishTypeAvailable: filter }] : []),
                ...(search !== '' ? [
                    {
                        OR: [
                            { DishTypeName: { contains: search } },
                            
                        ]
                    }
                ] : [])
            ]
        };
    }else where = { isDeleted: false };

      // console.log(filter)

    const [data, total] = await Promise.all([
        prisma.DishType.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
              id: true,
              DishTypeName: true,
              DishTypeDescription: true,
              DishTypeAvailable: true,
              createAt: true,
              updateAt: true,
          },
        }),
        //count total data of the input condition   
        prisma.DishType.count({ where }),
    ]);

    return {
        data,
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