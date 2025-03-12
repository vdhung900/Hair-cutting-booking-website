const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getUsers,
  getUserById, 
  updateUser,
  deleteUser
} = require('../controllers/userController');

// Routes dành cho admin
router.get('/', protect, authorize, getUsers);
router.delete('/:id', protect, authorize, deleteUser);

// Routes cho user và admin
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);

module.exports = router; 