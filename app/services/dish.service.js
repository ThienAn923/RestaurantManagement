// dish.service.js
const prisma = require("../../prisma/client"); // Go up two directories from 'service' to 'project' then into 'prisma'

class DishService {
  async createDish(data) {
    const { DishName, DishDescription, imageLinks, Cost, DishType } = data;
    const dish = await prisma.dish.create({
      data: {
        name: DishName,
        description: DishDescription,
        available: true,
        dishType: DishType,
        isDeleted: false,
      },
    });

    const cost = await prisma.cost.create({
      data: {
        cost: Cost,
        dishId: dish.id,
      },
    });

    // imageLinks = [
    // "https://example.com/image1.jpg",
    // "https://example.com/image2.jpg",
    // "https://example.com/image3.jpg"
    // ];
    for (const imageLink of imageLinks) {
      await prisma.image.create({
        data: {
          Link: imageLink,
          dishId: dish.id,
        },
      });
    }

    // for (const ingredientId of ingredients) {
    //   await prisma.dishIngredient.create({
    //     data: {
    //       dishId: dish.id,
    //       ingredientId,
    //     },
    //   });
    // }

    return dish;
  }
  async getDishById(id) {
    return await prisma.dish.findUnique({
      where: { id },
      include: {
        //get the fisrt cost order by createAt
        costs: { orderBy: { createAt: "desc" }, take: 1 },
        images: true,
        DishType: {
          select: { id: true, DishTypeName: true },
        },
        // dishIngredients: {
        //   include: { ingredient: true },
        // },
      },
    });
  }
  async getDishesByDishTypeId(id) {
    return await prisma.dish.findMany({
      where: {
        dishType: id,
      },
      include: {
        //get the fisrt cost order by createAt
        costs: { orderBy: { createAt: "desc" }, take: 1 },
        images: true,
        DishType: {
          select: { id: true, DishTypeName: true },
        },
        // dishIngredients: {
        //   include: { ingredient: true },
        // },
      },
    });
  }

  // async getAllDishes() {
  //   return await prisma.dish.findMany({
  //     where: { isDeleted: false }, // Filter only available dishes
  //     include: {
  //       costs: {orderBy: {createAt : 'desc'}, take:1,},
  //       images: true,
  //       DishType: {
  //         select: { id: true, DishTypeName: true },
  //       }
  //       // dishIngredients: {
  //       //   include: { ingredient: true },
  //       // },
  //     }, // Optionally include costs
  //   });
  // }

  async getAllDishes(
    page = 1,
    search = "",
    filter = "AllStatus",
    filterType = "AllType",
    sortColumn = "createAt",
    sortOrder = "desc"
  ) {
    let where;
    if (filter !== "AllStatus") filter = filter === "Available" ? true : false; //change filter to boolean

    if (filter !== "AllStatus" || search !== "" || filterType !== "AllType") {
      where = {
        isDeleted: false,
        //And condition combined filter and search, if filter is not AllStatus, add providerStatus to where
        //If search is not empty, add OR condition to where to search by providerName, providerEmail, providerPhoneNumber, providerStatus
        AND: [
          ...(filter !== "AllStatus" ? [{ available: filter }] : []),
          ...(filterType !== "AllType" ? [{ dishType: filterType }] : []),
          ...(search !== ""
            ? [
                {
                  OR: [
                    { name: { contains: search } },
                    //I will allow search by dishtype later
                    // { description: { contains: search } },
                  ],
                },
              ]
            : []),
        ],
      };
    } else where = { isDeleted: false };

    const [data, total] = await Promise.all([
      prisma.dish.findMany({
        where,
        orderBy: { [sortColumn]: sortOrder },
        include: {
          costs: { orderBy: { createAt: "desc" }, take: 1 },
          images: true,
          DishType: {
            select: { id: true, DishTypeName: true },
          },
        },
      }),
      prisma.Dish.count({ where }),
    ]);

    return {
      data,
      total,
    };
  }

  async updateDish(id, data) {
    try {
      const dish = await prisma.dish.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          available: data.available,
          dishType: data.DishType,
          available: data.available,
          updateAt: new Date(),

          isDeleted: false,
        },
      });

      const cost = await prisma.cost.create({
        data: {
          cost: data.cost,
          dishId: data.id,
        },
      });

      // Fetch existing images from the database for the given dish
      const existingImages = await prisma.image.findMany({
        where: { dishId: dish.id },
        select: { Link: true },
      });

      // Extract the links of existing images
      const existingImageLinks = existingImages.map((image) => image.Link);

      // Filter out the images that are already in the database
      const newImageLinks = data.imageLinks.filter(
        (imageLink) => !existingImageLinks.includes(imageLink)
      );

      // Identify and remove image links that are not found in the database
      const imageLinksToRemove = existingImageLinks.filter(
        (imageLink) => !data.imageLinks.includes(imageLink)
      );

      for (const imageLink of imageLinksToRemove) {
        await prisma.image.deleteMany({
          where: {
            Link: imageLink,
            dishId: dish.id,
          },
        });
      }

      // Create new records in the database for the filtered new images
      for (const imageLink of newImageLinks) {
        await prisma.image.create({
          data: {
            Link: imageLink,
            dishId: dish.id,
          },
        });
      }

      return { dish, cost };
    } catch (err) {
      console.log(err);
    }
  }

  async deleteDish(id) {
    // Soft delete (set isDeleted to true)
    return await prisma.dish.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async getIngredientsByDishId(dishId) {
    return await prisma.dishIngredient.findMany({
      where: { dishId },
      // include: { ingredient: true },
    });
  }
}

module.exports = new DishService();
