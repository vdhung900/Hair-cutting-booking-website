const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createSlot,
  getSlots,
  getSlotById,
  updateSlot,
  deleteSlot,
  getAvailableSlots
} = require('../controllers/slotController');

// Route để lấy danh sách slot trống (đặt lên đầu)
router.get('/available', getAvailableSlots);

// Thêm khung giờ mới
router.post('/', protect, authorize, createSlot);

// Lấy danh sách khung giờ
router.get('/', protect, getSlots);

// Lấy thông tin một khung giờ
router.get('/:id', protect, getSlotById);

// Cập nhật thông tin khung giờ
router.put('/:id', protect, authorize, updateSlot);

// Xóa khung giờ
router.delete('/:id', protect, authorize, deleteSlot);

module.exports = router; 