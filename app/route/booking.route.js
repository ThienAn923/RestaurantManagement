// routes/booking.route.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

// Route để tạo đặt bàn
router.post('/book', bookingController.bookTable);

// Route để lấy thông tin đặt bàn theo ID
router.get('/:id', bookingController.getBooking);

// Route để lấy tất cả booking
router.get('/', bookingController.getAllBookings);

module.exports = router;
