const Stylist = require('../models/Stylist');

// @desc    Lấy tất cả stylist
// @route   GET /api/stylists
// @access  Public
exports.getStylists = async (req, res) => {
  try {
    const stylists = await Stylist.find();
    res.status(200).json({
      success: true,
      data: stylists
    });
  } catch (err) {
    res.status(400).json({
      success: false, 
      message: err.message
    });
  }
};

// @desc    Lấy chi tiết một stylist
// @route   GET /api/stylists/:id
// @access  Public
exports.getStylist = async (req, res) => {
  try {
    const stylist = await Stylist.findById(req.params.id);

    if (!stylist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy stylist'
      });
    }

    res.status(200).json({
      success: true,
      data: stylist
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Tạo stylist mới
// @route   POST /api/stylists
// @access  Private/Admin
exports.createStylist = async (req, res) => {
  try {
    const stylist = await Stylist.create(req.body);

    res.status(201).json({
      success: true,
      data: stylist
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Cập nhật stylist
// @route   PUT /api/stylists/:id
// @access  Private/Admin
exports.updateStylist = async (req, res) => {
  try {
    const stylist = await Stylist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!stylist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy stylist'
      });
    }

    res.status(200).json({
      success: true,
      data: stylist
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Xóa stylist
// @route   DELETE /api/stylists/:id
// @access  Private/Admin
exports.deleteStylist = async (req, res) => {
  try {
    const stylist = await Stylist.findByIdAndDelete(req.params.id);

    if (!stylist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy stylist'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stylist đã bị xóa'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
