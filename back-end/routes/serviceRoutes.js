const express = require('express');
const {
  getServices,
  getService,
  createService, 
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes công khai
router.get('/', getServices);
router.get('/:id', getService);

// Routes yêu cầu xác thực và phân quyền admin
router.post('/', protect, authorize, createService);
router.put('/:id', protect, authorize, updateService);
router.delete('/:id', protect, authorize, deleteService);

module.exports = router;