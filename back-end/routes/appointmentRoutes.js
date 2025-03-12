const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

// Đặt lịch hẹn mới
router.post('/', protect, appointmentController.createAppointment);

// Hủy lịch hẹn
router.put('/:id/cancel', protect, appointmentController.cancelAppointment);

// Lấy danh sách lịch hẹn
router.get('/', protect, appointmentController.getAppointments);

// Lấy thông tin một lịch hẹn
router.get('/:id', protect, appointmentController.adminGetAppointmentById);

// Cập nhật thông tin lịch hẹn
router.put('/:id', protect, appointmentController.adminUpdateAppointment);

// Hủy lịch hẹn
router.delete('/:id', protect, appointmentController.adminDeleteAppointment);

module.exports = router; 