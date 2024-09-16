// dish.service.js
const prisma = require('../../prisma/client'); // Go up two directories from 'service' to 'project' then into 'prisma'

class DishService {
  async createDish(data) {
    const { DishName, DishDescription, imageLinks, Cost, DishType, ingredients } = data;
    const dish = await prisma.dish.create({
      data: {
        DishName,
        DishDescription,
        dishType: DishType,
      
      },
    });

    const cost = await prisma.cost.create({ 
      data: {
        Cost,
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

    for (const ingredientId of ingredients) {
      await prisma.dishIngredient.create({
        data: {
          dishId: dish.id,
          ingredientId,
        },
      });
    }

    return dish;

  }

  async getDishById(id) {
    return await prisma.dish.findUnique({
      where: { id },
      include: { 
        costs: true,
        images: true,
        dishIngredients: {
          include: { ingredient: true },
        },
      },
    });
  }

  async getAllDishes() {
    return await prisma.dish.findMany({
      where: { isDeleted: false }, // Filter only available dishes
      include: { 
        costs: true,
        images: true,
        dishIngredients: {
          include: { ingredient: true },
        },
      }, // Optionally include costs
    });
  }

  async updateDish(id, data) {
    const { DishName, DishDescription, imageLinks, Cost, DishType, ingredients } = data;
    const dish = await prisma.dish.update({
      where: { id },
      data: {
        DishName,
        DishDescription,
        dishType: DishType,
      },
    });

    const cost = await prisma.cost.create({ 
      data: {
        Cost,
        dishId: dish.id,
      },
    });

    for (const imageLink of imageLinks) {
        await prisma.image.create({
            data: {
                Link: imageLink,
                dishId: dish.id,
            },
        });
    }

    // Update ingredients
    for (const ingredientId of ingredients) {
      await prisma.dishIngredient.create({
        data: {
          dishId: dish.id,
          ingredientId,
        },
      });
    }

    return dish;
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
      include: { ingredient: true },
    });
  }
}


module.exports = new DishService();

