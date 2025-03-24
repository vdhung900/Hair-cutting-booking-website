const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Slot = require('../models/Slot');
const Stylist = require('../models/Stylist');

// @desc    Tạo lịch hẹn mới
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    const { serviceId, stylistId, selectedTime, notes } = req.body;

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

    // Tạo thời gian bắt đầu và kết thúc cho slot
    const startTime = new Date(selectedTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Thêm 1 giờ

    // Kiểm tra xem slot đã tồn tại chưa
    const existingSlot = await Slot.findOne({
      start_time: startTime,
      end_time: endTime,
      stylistId: stylistId,
      available: true
    });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: 'Khung giờ này đã được đặt'
      });
    }

    // Tạo slot mới
    const slot = new Slot({
      start_time: startTime,
      end_time: endTime,
      stylistId: stylistId,
      available: false
    });
    await slot.save();

    // Tạo lịch hẹn mới
    const appointment = new Appointment({
      userId: req.user.id,
      slotId: slot._id,
      serviceId,
      notes,
      service_name: service.service_name,
      service_des: service.service_description,
    });

    // Lưu lịch hẹn
    await appointment.save();

    // Populate thông tin chi tiết
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('userId', 'name email')
      .populate('serviceId', 'service_name service_price')
      .populate('slotId', 'start_time end_time stylistId')
      .populate({
        path: 'slotId',
        populate: {
          path: 'stylistId',
          select: 'name experience'
        }
      });

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Lỗi khi tạo lịch hẹn:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi tạo lịch hẹn',
      error: error.message 
    });
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

    // Xóa slot
    await Slot.findByIdAndDelete(appointment.slotId);

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
      .populate('userId', 'name email phone')
      .populate('serviceId', 'service_name service_price')
      .populate({
        path: 'slotId',
        populate: {
          path: 'stylistId',
          select: 'name experience'
        }
      })
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
      // Xóa slot cũ
      await Slot.findByIdAndDelete(appointment.slotId);

      // Tạo slot mới
      const newSlot = new Slot({
        _id: slotId,
        available: false
      });
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
      await Slot.findByIdAndDelete(appointment.slotId);
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

    // Xóa slot
    await Slot.findByIdAndDelete(appointment.slotId);

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

// @desc    Lấy thống kê thu nhập hàng tháng
// @route   GET /api/appointments/stats/monthly-income
// @access  Private (Admin only)
exports.getMonthlyIncome = async (req, res) => {
  try {
    // Lấy tháng và năm từ query params hoặc sử dụng tháng và năm hiện tại
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Tạo ngày bắt đầu và kết thúc của tháng
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Lấy tất cả lịch hẹn trong tháng
    const appointments = await Appointment.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('serviceId', 'service_price');

    // Tính toán các thống kê
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;
    
    // Tính tổng thu nhập từ các lịch hẹn hoàn thành
    const totalIncome = appointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + (apt.serviceId?.service_price || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        month,
        year,
        totalIncome,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        pendingAppointments
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê thu nhập:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thống kê thu nhập',
      error: error.message
    });
  }
};

// @desc    Lấy dữ liệu thu nhập theo tháng
// @route   GET /api/appointments/stats/monthly-data
// @access  Private (Admin only)
exports.getMonthlyData = async (req, res) => {
  try {
    // Lấy tháng và năm từ query params hoặc sử dụng tháng và năm hiện tại
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Tạo ngày bắt đầu và kết thúc của tháng
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Lấy tất cả lịch hẹn trong tháng
    const appointments = await Appointment.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('serviceId', 'service_price');

    // Tính tổng thu nhập cho mỗi ngày trong tháng
    const dailyData = [];
    const daysInMonth = endDate.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, month - 1, day);
      const dayEnd = new Date(year, month - 1, day, 23, 59, 59);

      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.createdAt);
        return aptDate >= dayStart && aptDate <= dayEnd;
      });

      const dayIncome = dayAppointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.serviceId?.service_price || 0), 0);

      dailyData.push({
        day,
        totalIncome: dayIncome
      });
    }

    res.status(200).json({
      success: true,
      data: dailyData
    });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu theo tháng:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy dữ liệu theo tháng',
      error: error.message
    });
  }
};

// @desc    Xác nhận lịch hẹn (Admin only)
// @route   PUT /api/appointments/:id/confirm
// @access  Private (Admin only)
exports.confirmAppointment = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền xác nhận lịch hẹn'
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn'
      });
    }

    // Kiểm tra trạng thái lịch hẹn
    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác nhận lịch hẹn đang ở trạng thái chờ xác nhận'
      });
    }

    // Cập nhật trạng thái lịch hẹn
    appointment.status = 'confirmed';
    await appointment.save();

    // Populate thông tin chi tiết
    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('userId', 'name email')
      .populate('serviceId', 'service_name service_price')
      .populate('slotId', 'start_time end_time stylistId')
      .populate({
        path: 'slotId',
        populate: {
          path: 'stylistId',
          select: 'name experience'
        }
      });

    res.status(200).json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Lỗi khi xác nhận lịch hẹn:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xác nhận lịch hẹn',
      error: error.message
    });
  }
}; 