const Slot = require('../models/Slot');
const Appointment = require('../models/Appointment');

// @desc    Thêm khung giờ mới
// @route   POST /api/slots
// @access  Private/Admin
exports.createSlot = async (req, res) => {
  try {
    const { start_time, end_time, stylistId } = req.body;
    
    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc'
      });
    }

    const conflictSlot = await Slot.findOne({
      stylistId,
      $or: [
        {
          start_time: { $lt: end_time },
          end_time: { $gt: start_time }
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
      start_time,
      end_time, 
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
      .sort({ start_time: 1 });

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
    const { start_time, end_time, available, stylistId } = req.body;
    
    // Kiểm tra thời gian hợp lệ
    if (start_time && end_time) {
      if (new Date(start_time) >= new Date(end_time)) {
        return res.status(400).json({
          success: false,
          message: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc'
        });
      }
    }

    // Tạo object chứa các trường cần update
    const updateFields = {};
    if (start_time) updateFields.start_time = start_time;
    if (end_time) updateFields.end_time = end_time;
    if (typeof available !== 'undefined') updateFields.available = available;
    if (stylistId) updateFields.stylistId = stylistId;

    const slot = await Slot.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { 
        new: true,
        runValidators: true 
      }
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

// @desc    Lấy danh sách các slot trống của stylist theo ngày
// @route   GET /api/slots/available
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { stylistId, date } = req.query;

    if (!stylistId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp stylistId và date'
      });
    }

    // Chuyển đổi date string thành Date object và điều chỉnh múi giờ
    const selectedDate = new Date(date);
    const vietnamOffset = 7 * 60; // Độ lệch múi giờ Việt Nam (7 giờ)
    selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset() + vietnamOffset);
    selectedDate.setHours(0, 0, 0, 0);

    // Tạo ngày kết thúc (cuối ngày)
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);

    console.log('Tìm slots cho stylist:', stylistId);
    console.log('Ngày bắt đầu (Vietnam time):', selectedDate);
    console.log('Ngày kết thúc (Vietnam time):', endDate);

    // Tìm tất cả các slots đã được đặt trong ngày của stylist đó
    const bookedSlots = await Slot.find({
      stylistId: stylistId,
      start_time: {
        $gte: selectedDate,
        $lte: endDate
      },
      available: false
    });

    console.log('Số lượng slots đã đặt:', bookedSlots.length);

    res.status(200).json({
      success: true,
      data: bookedSlots
    });

  } catch (error) {
    console.error('Lỗi khi lấy danh sách slot trống:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách slot trống',
      error: error.message
    });
  }
};