const express = require('express');
const {
  getStylists,
  getStylist, 
  createStylist,
  updateStylist,
  deleteStylist
} = require('../controllers/stylistController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes công khai
router.get('/', getStylists);
router.get('/:id', getStylist);

// Routes yêu cầu xác thực và phân quyền admin
router.post('/', protect, authorize, createStylist);
router.put('/:id', protect, authorize, updateStylist);
router.delete('/:id', protect, authorize, deleteStylist);

module.exports = router;