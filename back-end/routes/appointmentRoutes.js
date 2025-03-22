const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createAppointment,
    cancelAppointment,
    getAppointments,
    adminGetAppointmentById,
    adminUpdateAppointment,
    adminDeleteAppointment,
    getMonthlyIncome,
    getMonthlyData,
    confirmAppointment
} = require('../controllers/appointmentController');

// Đặt lịch hẹn mới
router.post('/', protect, createAppointment);

// Hủy lịch hẹn
router.put('/:id/cancel', protect, cancelAppointment);

// Xác nhận lịch hẹn (Admin only)
router.put('/:id/confirm', protect, authorize, confirmAppointment);

// Lấy danh sách lịch hẹn
router.get('/', protect, getAppointments);

// Lấy thông tin một lịch hẹn
router.get('/:id', protect, authorize, adminGetAppointmentById);

// Cập nhật thông tin lịch hẹn
router.put('/:id', protect, authorize, adminUpdateAppointment);

// Hủy lịch hẹn
router.delete('/:id', protect, authorize, adminDeleteAppointment);

// Lấy thống kê thu nhập hàng tháng (Admin only)
router.get('/stats/monthly-income', protect, authorize, getMonthlyIncome);

// Lấy dữ liệu thu nhập theo tháng (Admin only)
router.get('/stats/monthly-data', protect, authorize, getMonthlyData);

module.exports = router; 