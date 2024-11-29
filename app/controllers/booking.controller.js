// controllers/booking.controller.js
const bookingService = require('../services/booking.service');

class BookingController {
  // Đặt bàn
  async bookTable(req, res) {
    const { tableId, startTime, endTime, numberOfPeople, clientId } = req.body;

    try {
      // Tạo booking mới
      const newBooking = await bookingService.createBooking({ tableId, startTime, endTime, numberOfPeople, clientId });

      return res.status(201).json({
        message: 'Đặt bàn thành công',
        booking: newBooking,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau!' });
    }
  }

  // Lấy thông tin đặt bàn theo ID
  async getBooking(req, res) {
    const { id } = req.params;

    try {
      const booking = await bookingService.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ message: 'Không tìm thấy đặt bàn với ID này.' });
      }

      return res.status(200).json(booking);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau!' });
    }
  }

  // Lấy danh sách tất cả booking
  async getAllBookings(req, res) {
    try {
      const bookings = await bookingService.getAllBookings();
      return res.status(200).json(bookings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau!' });
    }
  }
}

module.exports = new BookingController();
