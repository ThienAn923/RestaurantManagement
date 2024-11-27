const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RatingService {
  // Tạo đánh giá mới
  async createRating(ratingData) {
    return await prisma.rating.create({
      data: ratingData,
    });
  }

  // Lấy danh sách đánh giá theo dishId
  async getRatingsByDishId(dishId) {
    return await prisma.rating.findMany({
      where: {
        dishID: dishId,
        isDeleted: false, // Lọc những đánh giá chưa bị xóa
      },
    });
  }

  // Lấy đánh giá theo id
  async getRatingById(ratingId) {
    return await prisma.rating.findUnique({
      where: { id: ratingId },
      include: {
        Client: true, // Bao gồm thông tin của client
        Dish: true,   // Bao gồm thông tin của dish     
      },
    });
  }
  async getAllRatings(){
    return await prisma.rating.findMany({});
  }
  // Cập nhật đánh giá
  async updateRating(ratingId, ratingData) {
    return await prisma.rating.update({
      where: { id: ratingId },
      data: ratingData,
    });
  }

  // Xóa đánh giá
  async deleteRating(ratingId) {
    return await prisma.rating.update({
      where: { id: ratingId },
      data: { isDeleted: true }, // Đánh dấu là đã xóa thay vì xóa thật sự
    });
  }
}

module.exports = new RatingService();
