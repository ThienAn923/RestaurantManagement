const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class RoomService {
  // Tạo một phòng mới
  async createRoom(roomData) {
    return await prisma.room.create({
      data: roomData,
    });
  }

  async getAllRooms() {
    return await prisma.room.findMany({});
  }

  // Lấy phòng theo ID
  async getRoomById(roomId) {
    return await prisma.room.findUnique({
      where: { id: roomId },
    });
  }
  async getRoomByClientID(clientID) {
    return await prisma.room.findFirst({
      where: { clientId: clientID },
    });
  }
  // Cập nhật thông tin phòng
  async updateRoom(roomId, roomData) {
    return await prisma.room.update({
      where: { id: roomId },
      data: roomData,
    });
  }

  // Xóa phòng
  async deleteRoom(roomId) {
    return await prisma.room.delete({
      where: { id: roomId },
    });
  }
}

module.exports = new RoomService();
