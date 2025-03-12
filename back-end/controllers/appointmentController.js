const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Stylist = require('../models/Stylist');
const Slot = require('../models/Slot');

// @desc    Tạo lịch hẹn mới
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    const { stylistId, slotId, serviceId, notes } = req.body;

    // Kiểm tra xem slot có tồn tại và còn trống không
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        message: 'Không tìm thấy khung giờ này'
      });
    }
    
    if (!slot.isAvailable) {
      return res.status(400).json({
        message: 'Khung giờ này đã được đặt'
      });
    }

    // Kiểm tra service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ'
      });
    }

    // Kiểm tra stylist
    const stylist = await Stylist.findById(stylistId);
    if (!stylist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy stylist'
      });
    }

    // Tạo lịch hẹn mới
    const appointment = new Appointment({
      userId: req.user.id,
      stylistId,
      slotId,
      serviceId,
      date,
      time,
      notes,
      service_name: service.service_name,
      service_des: service.service_description,
      stylist_name: stylist.name
    });

    // Cập nhật trạng thái slot
    slot.isAvailable = false;
    await slot.save();

    // Lưu lịch hẹn
    await appointment.save();

    // Populate thông tin chi tiết
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('userId', 'name email')
      .populate('stylistId', 'name email')
      .populate('serviceId', 'name price')
      .populate('slotId', 'startTime endTime');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Hủy lịch hẹn
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn'
      });
    }

    // Kiểm tra xem người dùng có sở hữu lịch hẹn này không
    if (appointment.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền hủy lịch hẹn này'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Cập nhật trạng thái slot
    const slot = await Slot.findById(appointment.slotId);
    if (slot) {
      slot.isAvailable = true;
      await slot.save();
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Lấy danh sách lịch hẹn
exports.getAppointments = async (req, res) => {
  try {
    let query = {};
    
    // Nếu là user thường, chỉ lấy lịch hẹn của họ
    if (req.user.role !== 'admin') {
      query = { userId: req.user.id };
    }

    const appointments = await Appointment.find(query)
      .populate('userId', 'name email')
      .populate('stylistId', 'name email')
      .populate('serviceId', 'name price')
      .populate('slotId', 'startTime endTime')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy thông tin một lịch hẹn của admin
exports.adminGetAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('stylistId', 'name email')
      .populate('serviceId', 'name price')
      .populate('slotId', 'startTime endTime');

    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền truy cập lịch hẹn này' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật thông tin lịch hẹn của admin
exports.adminUpdateAppointment = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Kiểm tra quyền cập nhật
    if (req.user.role !== 'admin' && appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền cập nhật lịch hẹn này' });
    }

    // Cập nhật trạng thái slot nếu hủy lịch hẹn
    if (status === 'cancelled' && appointment.status !== 'cancelled') {
      const slot = await Slot.findById(appointment.slotId);
      if (slot) {
        slot.isAvailable = true;
        await slot.save();
      }
    }

    appointment.status = status || appointment.status;
    appointment.notes = notes || appointment.notes;
    
    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('userId', 'name email')
      .populate('stylistId', 'name email')
      .populate('serviceId', 'name price')
      .populate('slotId', 'startTime endTime');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hủy lịch hẹn của admin
exports.adminDeleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Kiểm tra quyền xóa
    if (req.user.role !== 'admin' && appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền xóa lịch hẹn này' });
    }

    // Cập nhật trạng thái slot
    const slot = await Slot.findById(appointment.slotId);
    if (slot) {
      slot.isAvailable = true;
      await slot.save();
    }

    await appointment.remove();

    res.json({ message: 'Đã hủy lịch hẹn thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 