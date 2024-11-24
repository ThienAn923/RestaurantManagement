// RoomController.js
const RoomService = require('../services/roomChat.service');
const ApiError = require("../api-error");

class RoomController {
  // Tạo một phòng mới
  async createRoom(req, res, next) {
    try {
      const roomData = req.body;
      const newRoom = await RoomService.createRoom(roomData);
      res.status(201).json(newRoom);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }

  // Lấy tất cả các phòng
  async getAllRooms(req, res, next) {
    try {
      const rooms = await RoomService.getAllRooms();
      res.status(200).json(rooms);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }

  // Lấy phòng theo ID
  async getRoomById(req, res,next) {
    try {
      const room = await RoomService.getRoomById(req.params.roomId);
      if (!room) {
        return res.status(404).json({ message: 'Phòng không tìm thấy' });
      }
      res.status(200).json(room);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }

  // Cập nhật thông tin phòng
  async updateRoom(req, res, next) {
    const roomData = req.body;
    try {
      const updatedRoom = await RoomService.updateRoom(req.params.roomId, roomData);
      res.status(200).json(updatedRoom);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }

  // Xóa phòng
  async deleteRoom(req, res, next) {
    try {
      await RoomService.deleteRoom(req.params.roomId);
      res.status(204).send(); // Xóa thành công, không trả về nội dung
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }
}

module.exports = new RoomController();
