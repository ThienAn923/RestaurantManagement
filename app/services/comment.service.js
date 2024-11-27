const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CommentService {
  // Tạo đánh giá mới
  async createComment(CommentData) {
    return await prisma.comment.create({
      data: CommentData,
    });
  }

  // Lấy danh sách đánh giá theo dishId
  async getCommentsByDishId(dishId) {
    return await prisma.comment.findMany({
      where: {
        dishID: dishId,
        isDeleted: false, // Lọc những đánh giá chưa bị xóa
      },
    });
  }

  // Lấy đánh giá theo id
  async getCommentById(CommentId) {
    return await prisma.comment.findUnique({
      where: { id: CommentId },
    });
  }
  async getAllComments(){
    return await prisma.comment.findMany({});
  }
  // Cập nhật đánh giá
  async updateComment(CommentId, CommentData) {
    return await prisma.comment.update({
      where: { id: CommentId }, 
      data: CommentData,
    });
  }

  // Xóa đánh giá
  async deleteComment(CommentId) {
    return await prisma.comment.update({
      where: { id: CommentId },
      data: { isDeleted: true }, // Đánh dấu là đã xóa thay vì xóa thật sự
    });
  }
}

module.exports = new CommentService();
