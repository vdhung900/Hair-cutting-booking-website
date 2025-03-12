const Slot = require('../models/Slot');

// @desc    Thêm khung giờ mới
// @route   POST /api/slots
// @access  Private/Admin
exports.createSlot = async (req, res) => {
  try {
    const { startTime, endTime, stylistId } = req.body;
    
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc'
      });
    }

    const conflictSlot = await Slot.findOne({
      stylistId,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictSlot) {
      return res.status(400).json({
        success: false,
        message: 'Khung giờ này đã bị trùng với một khung giờ khác'
      });
    }

    const slot = await Slot.create({
      startTime,
      endTime, 
      stylistId
    });

    res.status(201).json({
      success: true,
      data: slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy danh sách khung giờ
// @route   GET /api/slots
// @access  Public 
exports.getSlots = async (req, res) => {
  try {
    const slots = await Slot.find()
      .populate('stylistId', 'name email')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy thông tin một khung giờ
// @route   GET /api/slots/:id
// @access  Public
exports.getSlotById = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id)
      .populate('stylistId', 'name email');
    
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khung giờ'
      });
    }
    
    res.status(200).json({
      success: true,
      data: slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cập nhật thông tin khung giờ
// @route   PUT /api/slots/:id
// @access  Private/Admin
exports.updateSlot = async (req, res) => {
  try {
    const { startTime, endTime, isAvailable } = req.body;
    
    if (startTime && endTime) {
      if (new Date(startTime) >= new Date(endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc'
        });
      }
    }

        const slot = await Slot.findByIdAndUpdate(
            req.params.id,
            { startTime, endTime, isAvailable },
            { new: true }
        ).populate('stylistId', 'name email');

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khung giờ'
      });
    }

    res.status(200).json({
      success: true,
      data: slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Xóa khung giờ
// @route   DELETE /api/slots/:id
// @access  Private/Admin
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khung giờ'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã xóa khung giờ thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};