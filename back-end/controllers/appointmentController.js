const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Slot = require('../models/Slot');

// @desc    Tạo lịch hẹn mới
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    const { slotId, serviceId, notes } = req.body;

    // Kiểm tra xem slot có tồn tại và còn trống không
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        message: 'Không tìm thấy khung giờ này'
      });
    }
    
    if (!slot.available) {
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

    // Tạo lịch hẹn mới
    const appointment = new Appointment({
      userId: req.user.id,
      slotId,
      serviceId,
      slotId,
      notes,
      service_name: service.service_name,
      service_des: service.service_description,
    });

    // Cập nhật trạng thái slot
    slot.available = false;
    await slot.save();

    // Lưu lịch hẹn
    await appointment.save();

    // Populate thông tin chi tiết
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('userId', 'name email')
      .populate('serviceId', 'service_name service_price')
      .populate('slotId', 'start_time end_time stylistId')

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
    if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
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
      slot.available = true;
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
      .populate('serviceId', 'service_name service_price')
      .populate('slotId', 'start_time end_time stylistId')
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
      .populate('serviceId', 'service_name service_price')
      .populate('slotId', 'start_time end_time stylistId')

    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật thông tin lịch hẹn của admin
exports.adminUpdateAppointment = async (req, res) => {
  try {
    const { status, notes, slotId, serviceId } = req.body;
    
    // Tìm lịch hẹn cần cập nhật
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Nếu có cập nhật slot mới
    if (slotId && slotId !== appointment.slotId.toString()) {
      // Kiểm tra slot mới có tồn tại không
      const newSlot = await Slot.findById(slotId);
      if (!newSlot) {
        return res.status(404).json({ message: 'Không tìm thấy khung giờ này' });
      }

      // Kiểm tra slot mới có trống không
      if (!newSlot.available) {
        return res.status(400).json({ message: 'Khung giờ này đã được đặt' });
      }

      // Cập nhật trạng thái slot cũ thành trống
      const oldSlot = await Slot.findById(appointment.slotId);
      if (oldSlot) {
        oldSlot.available = true;
        await oldSlot.save();
      }

      // Cập nhật trạng thái slot mới thành đã đặt
      newSlot.available = false;
      await newSlot.save();

      appointment.slotId = slotId;
    }

    // Nếu có cập nhật service mới
    if (serviceId && serviceId !== appointment.serviceId.toString()) {
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
      }

      appointment.serviceId = serviceId;
      appointment.service_name = service.service_name;
      appointment.service_des = service.service_description;
    }

    // Cập nhật trạng thái slot nếu hủy lịch hẹn
    if (status === 'cancelled' && appointment.status !== 'cancelled') {
      const slot = await Slot.findById(appointment.slotId);
      if (slot) {
        slot.available = true;
        await slot.save();
      }
    }

    // Cập nhật các thông tin khác
    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;

    await appointment.save();

    // Trả về thông tin lịch hẹn đã cập nhật
    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('userId', 'name email')
      .populate('serviceId', 'service_name service_price')
      .populate('slotId', 'start_time end_time stylistId');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hủy lịch hẹn của admin
exports.adminDeleteAppointment = async (req, res) => {
  try {
    // Kiểm tra xem lịch hẹn có tồn tại không
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Kiểm tra và cập nhật trạng thái slot thành available
    const slot = await Slot.findById(appointment.slotId);
    if (slot) {
      slot.available = true;
      await slot.save();
    }

    // Xóa lịch hẹn khỏi database
    await Appointment.findByIdAndDelete(appointment._id);

    // Trả về thông báo thành công
    res.json({ 
      success: true,
      message: 'Đã hủy lịch hẹn thành công' 
    });

  } catch (error) {
    console.error('Lỗi khi xóa lịch hẹn:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi xóa lịch hẹn',
      error: error.message 
    });
  }
}; 