const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MessageService {
  // Tạo một tin nhắn mới
  async createMessage(messageData) {
    const message=  await prisma.message.create({
      data: messageData,
    });
    global.io.emit("messageCreated",message);
  }

  // Lấy tất cả tin nhắn trong một phòng
  async getMessagesByRoomId(roomId) {
     return await prisma.message.findMany({  
    });
  
  }
  async getAllMessages(){
    const messages =  await prisma.message.findMany({  
    });
    global.io.emit("messageInRoom",messages);
    return messages;  }
  // Lấy tin nhắn theo ID
  async getMessageById(messageId) {
    return await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        clientSender: true,
        employeeSender: true,
      },
    });
  }

  // Cập nhật tin nhắn
  async updateMessage(messageId, messageData) {
    return await prisma.message.update({
      where: { id: messageId },
      data: messageData,
    });
  }

  // Xóa tin nhắn
  async deleteMessage(messageId) {
    return await prisma.message.delete({
      where: { id: messageId },
    });
  }
}

module.exports = new MessageService();
