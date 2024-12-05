const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class IngredientTypeService {
  async createIngredientType(data) {
    return await prisma.ingredientType.create({ data });
  }

  async getIngredientTypeById(id) {
    return await prisma.ingredientType.findUnique({
      where: { id },
    });
  }

  async getAllIngredientTypesVIP() {
    return await prisma.ingredientType.findMany({
      where: { isDeleted: false },
      //I will select only the needed part in the future, now, i don't have time (to debug if there is an error)
      // select: {
      //     id: true,
      //     ingredientTypeName: true,
      // },
    });
  }

  //pinia
  async getAllIngredientTypes(
    page = 1,
    limit = 5,
    sortColumn = "createAt",
    sortOrder = "asc",
    search = ""
  ) {
    // console.log(search); //test if search is working
    const skip = (page - 1) * limit;
    const orderBy = {};

    // Validate sortColumn to prevent potential SQL injection
    const allowedColumns = [
      "ingredientTypeName",
      "ingredientTypeDescription",
      "createAt",
    ];
    if (allowedColumns.includes(sortColumn)) {
      orderBy[sortColumn] = sortOrder.toLowerCase() === "desc" ? "desc" : "asc";
    } else {
      orderBy.createAt = "asc"; // Default sorting
    }

    let where = {
      isDeleted: false,
    };

    if (search !== "") {
      where = {
        ...where,
        AND: [{ ingredientTypeName: { contains: search } }],
      };
    }

    const [data, total] = await Promise.all([
      prisma.ingredientType.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          ingredientTypeName: true,
          ingredientTypeDescription: true,
          isDeleted: true,
          createAt: true,
          updateAt: true,
        },
      }),
      //count total data of the input condition
      prisma.ingredientType.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      search,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateIngredientType(id, data) {
    return await prisma.ingredientType.update({
      where: { id },
      data,
    });
  }

  async deleteIngredientType(id) {
    await prisma.ingredient.updateMany({
      where: { ingredientTypeID: id },
      data: { isDeleted: true },
    });
    return await prisma.ingredientType.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}

module.exports = new IngredientTypeService();
