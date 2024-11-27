// CommentController.js
const CommentService = require('../services/comment.service');
const ApiError = require("../api-error");

class CommentController {
  async createComment(req, res, next) {
    try {
      const newComment = await CommentService.createComment(req.body);
      res.status(201).json(newComment);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }

  async getCommentsByDishId(req, res,next) {
    try {
      const Comments = await CommentService.getCommentsByDishId(req.params.dishId);
      res.status(200).json(Comments);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }
  async getAllComments(req, res) {
    try {
      const Comments = await CommentService.getAllComments();
      res.status(200).json(Comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getCommentById(req, res,next) {
    const { CommentId } = req.params;
    try {
      const Comment = await CommentService.getCommentById(CommentId);
      if (!Comment) {
        return res.status(404).json({ Comment: 'Tin nhắn không tìm thấy' });
      }
      res.status(200).json(Comment);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }

  async updateComment(req, res, next) {
    const { CommentId } = req.params;
    const CommentData = req.body;
    try {
      const updatedComment = await CommentService.updateComment(CommentId, CommentData);
      res.status(200).json(updatedComment);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }

  async deleteComment(req, res, next) {
    const { CommentId } = req.params;
    try {
      await CommentService.deleteComment(CommentId);
      res.status(204).send(); // Xóa thành công, không trả về nội dung
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }
}

module.exports = new CommentController();
