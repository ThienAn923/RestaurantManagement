// MessageController.js
const MessageService = require('../services/messageChat.service');
const ApiError = require("../api-error");

class MessageController {
  // Tạo một tin nhắn mới
  async createMessage(req, res, next) {
    try {
      const newMessage = await MessageService.createMessage(req.body);
      res.status(201).json(newMessage);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }

  // Lấy tất cả tin nhắn trong một phòng
  async getMessagesByRoomId(req, res,next) {
    try {
      const messages = await MessageService.getMessagesByRoomId(req.params.id);
      res.status(200).json(messages);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }

  // Lấy tin nhắn theo ID
  async getMessageById(req, res,next) {
    const { messageId } = req.params;
    try {
      const message = await MessageService.getMessageById(messageId);
      if (!message) {
        return res.status(404).json({ message: 'Tin nhắn không tìm thấy' });
      }
      res.status(200).json(message);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }

  // Cập nhật tin nhắn
  async updateMessage(req, res, next) {
    const { messageId } = req.params;
    const messageData = req.body;
    try {
      const updatedMessage = await MessageService.updateMessage(messageId, messageData);
      res.status(200).json(updatedMessage);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }
  async getAllMessages(req, res) {
    try {
      const message = await MessageService.getAllMessages();
      res.status(200).json(message);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  // Xóa tin nhắn
  async deleteMessage(req, res, next) {
    const { messageId } = req.params;
    try {
      await MessageService.deleteMessage(messageId);
      res.status(204).send(); // Xóa thành công, không trả về nội dung
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }
}

module.exports = new MessageController();
