// dish.service.js
const prisma = require('../../prisma/client'); // Go up two directories from 'service' to 'project' then into 'prisma'

class CostService {
  async createCost(data) {
    return await prisma.cost.create({ data });
  }

  async getCostAfterDish(dishId){
    return await prisma.cost.findMany({
        where: {dishId}
    });
  }

  async getNewestCost(dishId) {
    return await prisma.cost.findFirst({
      where: { dishId },
      orderBy: {
        timeChange: 'desc', // Assuming you have a field `timeChange` to track when the cost was added
      },
    });
  }
}


module.exports = new CostService();

