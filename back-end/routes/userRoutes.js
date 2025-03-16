const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { 
  getUsers,
  getUserById, 
  updateUser,
  deleteUser,
  changePassword
} = require('../controllers/userController');

// Routes dành cho admin
router.get('/', protect, authorize, getUsers);
router.delete('/:id', protect, authorize, deleteUser);

// Routes cho user và admin
router.get('/:id', protect, getUserById);
router.put('/:id', protect, upload.single('avatar'), updateUser);

// Route đổi mật khẩu
router.put('/:id/change-password', protect, changePassword);

module.exports = router; 