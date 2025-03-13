const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createAppointment,
    cancelAppointment,
    getAppointments,
    adminGetAppointmentById,
    adminUpdateAppointment,
    adminDeleteAppointment
} = require('../controllers/appointmentController');

// Đặt lịch hẹn mới
router.post('/', protect, createAppointment);

// Hủy lịch hẹn
router.put('/:id/cancel', protect, cancelAppointment);

// Lấy danh sách lịch hẹn
router.get('/', protect, getAppointments);

// Lấy thông tin một lịch hẹn
router.get('/:id', protect, authorize, adminGetAppointmentById);

// Cập nhật thông tin lịch hẹn
router.put('/:id', protect, authorize, adminUpdateAppointment);

// Hủy lịch hẹn
router.delete('/:id', protect, authorize, adminDeleteAppointment);

module.exports = router; 