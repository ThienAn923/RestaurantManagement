const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class BookingService {
  async createBooking(data) {
    try {
      // In ra đối tượng data để kiểm tra
      console.log("Booking data: ", data);

      // Kiểm tra và lấy các giá trị từ đối tượng data
      const { tableId, startTime, endTime, numberOfPeople, clientId } = data;

      // Kiểm tra các giá trị quan trọng
      if (!tableId || !startTime || !endTime || !clientId) {
        throw new Error("Missing required booking information");
      }

      const booking = await prisma.booking.create({
        data: {
          tableID: tableId, // Chắc chắn là tableID
          timeStart: new Date(startTime), // Chuyển đổi thời gian thành Date
          timeEnd: new Date(endTime), // Chuyển đổi thời gian thành Date
          numberOfPeople: numberOfPeople,
          clientID: clientId,
        },
      });

      // Cập nhật trạng thái bàn (đã đặt)
      await prisma.table.update({
        where: { id: tableId },
        data: { tableStatus: false }, // Thay đổi trạng thái bàn thành "đã được đặt"
      });

      return booking;
    } catch (error) {
      error.message;
    }
  }

  // Lấy thông tin đặt bàn theo id
  async getBookingById(id) {
    return await prisma.booking.findUnique({
      where: { id },
      include: {
        table: true,
        client: true,
      },
    });
  }

  // Lấy danh sách các booking
  async getAllBookings() {
    return await prisma.booking.findMany({
      include: {
        Table: true, // Bao gồm thông tin của bảng table
        Client: true, // Bao gồm thông tin của khách hàng
      },
    });
  }
}

module.exports = new BookingService();
