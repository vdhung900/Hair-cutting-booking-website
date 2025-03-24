import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { BACKEND_URL, THEME_COLORS } from '../../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function BookingScreen({ route, navigation }) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedService, setSelectedService] = useState(route.params?.service || null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Thêm state để lưu trữ ngày được chọn tạm thời trong modal
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  
  // Tạo mảng các ngày trong tuần
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  
  // Tạo danh sách các khung giờ cố định
  const timeSlots = [
    { id: 1, time: '09:00' },
    { id: 2, time: '10:00' },
    { id: 3, time: '11:00' },
    { id: 4, time: '12:00' },
    { id: 5, time: '13:00' },
    { id: 6, time: '14:00' },
    { id: 7, time: '15:00' },
    { id: 8, time: '16:00' },
    { id: 9, time: '17:00' },
    { id: 10, time: '18:00' },
    { id: 11, time: '19:00' },
  ];
  
  // Hàm tạo lịch cho tháng hiện tại
  const generateCalendarDays = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Thêm các ngày từ tháng trước
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({ date: prevDate, disabled: true });
    }
    
    // Thêm các ngày trong tháng
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      days.push({
        date: currentDate,
        disabled: currentDate < today 
      });
    }
    
    return days;
  };

  // Xử lý khi chọn ngày
  const handleSelectDate = (date) => {
    if (!date.disabled) {
      setTempSelectedDate(date.date);
    }
  };

  // Xử lý khi xác nhận chọn ngày
  const handleConfirmDate = () => {
    setSelectedDate(tempSelectedDate);
    setShowDatePicker(false);
    setSelectedSlot(null);
  };

  useEffect(() => {
    fetchServices();
    fetchStylists();
  }, []);

  useEffect(() => {
    if (selectedStylist && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedStylist, selectedDate]);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/services`);
      if (response.data.success && response.data.data) {
        setServices(response.data.data);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách dịch vụ');
    }
  };

  const fetchStylists = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/stylists`);
      if (response.data.success && response.data.data) {
        setStylists(response.data.data);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách stylist');
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      console.log('Fetching slots for stylist:', selectedStylist?._id);
      console.log('Selected date:', selectedDate);

      const response = await axios.get(`${BACKEND_URL}/api/slots/available`, {
        params: {
          stylistId: selectedStylist?._id,
          date: selectedDate.toISOString()
        }
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        const bookedTimes = response.data.data.map(slot => {
          const startTime = new Date(slot.start_time);
          // Chuyển đổi về múi giờ Việt Nam để hiển thị
          const vietnamTime = new Date(startTime.getTime() + 7 * 60 * 60 * 1000);
          return vietnamTime.getHours().toString().padStart(2, '0') + ':00';
        });

        console.log('Booked times (Vietnam):', bookedTimes);
        
        // Đánh dấu các slot đã được đặt
        const allSlots = timeSlots.map(slot => ({
          ...slot,
          isBooked: bookedTimes.includes(slot.time)
        }));
        
        setAvailableSlots(allSlots);
      } else {
        console.error('Failed to fetch slots:', response.data.message);
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể lấy danh sách slot trống'
        });
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      Toast.show({
        type: 'error', 
        text1: 'Lỗi',
        text2: error.response?.data?.message || 'Đã có lỗi xảy ra khi lấy danh sách slot trống'
      });
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedStylist || !selectedSlot || !selectedDate) {
      Alert.alert('Thông báo', 'Vui lòng chọn đầy đủ thông tin đặt lịch');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      // Tạo datetime từ ngày và giờ đã chọn
      const [hours, minutes] = selectedSlot.time.split(':');
      const appointmentTime = new Date(selectedDate);
      
      // Điều chỉnh múi giờ Việt Nam (UTC+7)
      const vietnamOffset = 7 * 60; // 7 giờ * 60 phút
      appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      // Điều chỉnh về múi giờ UTC trước khi gửi lên server
      appointmentTime.setMinutes(appointmentTime.getMinutes() - vietnamOffset);

      const response = await axios.post(
        `${BACKEND_URL}/api/appointments`,
        {
          serviceId: selectedService._id,
          stylistId: selectedStylist._id,
          selectedTime: appointmentTime.toISOString(),
          notes: notes.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Hiển thị Toast thông báo thành công
        Toast.show({
          type: 'success',
          text1: 'Đặt lịch thành công!',
          text2: 'Chúng tôi sẽ liên hệ với bạn sớm nhất.',
          visibilityTime: 2000,
        });

        // Reset form và fetch lại data
        setSelectedSlot(null);
        setNotes('');
        await fetchAvailableSlots();

        // Chờ Toast hiển thị xong rồi mới chuyển màn hình
        setTimeout(() => {
          navigation.navigate('AppointmentsScreen');
        }, 2000);
      }
    } catch (error) {
      let message = 'Không thể đặt lịch. ';
      if (error.response) {
        message += error.response.data?.message || 'Vui lòng thử lại sau.';
      }
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: message,
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Chọn dịch vụ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn dịch vụ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {services.map((service) => (
              <TouchableOpacity
                key={service._id}
                style={[
                  styles.serviceCard,
                  selectedService?._id === service._id && styles.selectedCard
                ]}
                onPress={() => setSelectedService(service)}
              >
                <Text 
                  style={[
                    styles.serviceName,
                    selectedService?._id === service._id && styles.selectedText
                  ]}
                >
                  {service.service_name}
                </Text>
                <Text 
                  style={[
                    styles.servicePrice,
                    selectedService?._id === service._id && styles.selectedText
                  ]}
                >
                  {service.service_price?.toLocaleString('vi-VN')}đ
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chọn stylist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn stylist</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {stylists.map((stylist) => (
              <TouchableOpacity
                key={stylist._id}
                style={[
                  styles.stylistCard,
                  selectedStylist?._id === stylist._id && styles.selectedCard
                ]}
                onPress={() => {
                  setSelectedStylist(stylist);
                  setSelectedSlot(null);
                }}
              >
                {stylist.avatar && (
                  <Image
                    source={{ uri: stylist.avatar }}
                    style={styles.stylistAvatar}
                  />
                )}
                <Text 
                  style={[
                    styles.stylistName,
                    selectedStylist?._id === stylist._id && styles.selectedText
                  ]}
                >
                  {stylist.name}
                </Text>
                <Text 
                  style={[
                    styles.stylistExperience,
                    selectedStylist?._id === stylist._id && styles.selectedText
                  ]}
                >
                  {stylist.experience} năm kinh nghiệm
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chọn ngày */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn ngày</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <FontAwesome5 name="calendar-alt" size={20} color={THEME_COLORS.primary} />
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('vi-VN')}
            </Text>
          </TouchableOpacity>

          {/* Modal chọn ngày */}
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chọn ngày</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <FontAwesome5 name="times" size={20} color={THEME_COLORS.dark} />
                  </TouchableOpacity>
                </View>

                {/* Hiển thị tháng và năm */}
                <View style={styles.monthYearContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      const newDate = new Date(tempSelectedDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setTempSelectedDate(newDate);
                    }}
                  >
                    <FontAwesome5 name="chevron-left" size={20} color={THEME_COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.monthYearText}>
                    {`Tháng ${tempSelectedDate.getMonth() + 1}, ${tempSelectedDate.getFullYear()}`}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newDate = new Date(tempSelectedDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setTempSelectedDate(newDate);
                    }}
                  >
                    <FontAwesome5 name="chevron-right" size={20} color={THEME_COLORS.primary} />
                  </TouchableOpacity>
                </View>

                {/* Hiển thị các ngày trong tuần */}
                <View style={styles.weekDaysContainer}>
                  {daysOfWeek.map((day, index) => (
                    <Text key={index} style={styles.weekDayText}>{day}</Text>
                  ))}
                </View>

                {/* Hiển thị lịch */}
                <View style={styles.calendarContainer}>
                  {generateCalendarDays(
                    tempSelectedDate.getMonth(),
                    tempSelectedDate.getFullYear()
                  ).map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayButton,
                        day.disabled && styles.disabledDay,
                        tempSelectedDate.toDateString() === day.date.toDateString() && styles.selectedDay
                      ]}
                      onPress={() => handleSelectDate(day)}
                      disabled={day.disabled}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          day.disabled && styles.disabledDayText,
                          tempSelectedDate.toDateString() === day.date.toDateString() && styles.selectedDayText
                        ]}
                      >
                        {day.date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Nút xác nhận */}
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmDate}
                >
                  <Text style={styles.confirmButtonText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {/* Chọn giờ */}
        {selectedStylist && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn giờ</Text>
            <View style={styles.timeContainer}>
              {availableSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeButton,
                    selectedSlot?.id === slot.id && styles.selectedTime,
                    slot.isBooked && styles.bookedTime
                  ]}
                  onPress={() => !slot.isBooked && setSelectedSlot(slot)}
                  disabled={slot.isBooked}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedSlot?.id === slot.id && styles.selectedTimeText,
                      slot.isBooked && styles.bookedTimeText
                    ]}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Ghi chú */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Nhập ghi chú cho lịch hẹn (không bắt buộc)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Nút đặt lịch */}
        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedService || !selectedStylist || !selectedSlot) && styles.disabledButton
          ]}
          onPress={handleBooking}
          disabled={!selectedService || !selectedStylist || !selectedSlot || loading}
        >
          {loading ? (
            <ActivityIndicator color={THEME_COLORS.white} />
          ) : (
            <>
              <FontAwesome5 name="calendar-check" size={20} color={THEME_COLORS.white} />
              <Text style={styles.bookButtonText}>Xác nhận đặt lịch</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.light,
  },
  scrollView: {
    flex: 1,
    marginBottom: 60,
  },
  section: {
    backgroundColor: THEME_COLORS.white,
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 15,
  },
  serviceCard: {
    backgroundColor: THEME_COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 150,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  stylistCard: {
    backgroundColor: THEME_COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 120,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  stylistAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  stylistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 5,
    textAlign: 'center',
  },
  stylistExperience: {
    fontSize: 12,
    color: THEME_COLORS.primary,
    textAlign: 'center',
  },
  selectedCard: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
    borderWidth: 2,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 14,
    color: THEME_COLORS.primary,
  },
  selectedText: {
    color: THEME_COLORS.white,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.white,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    color: THEME_COLORS.dark,
    marginLeft: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeButton: {
    backgroundColor: THEME_COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '23%',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedTime: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
    borderWidth: 2,
  },
  bookedTime: {
    backgroundColor: THEME_COLORS.gray,
    borderColor: THEME_COLORS.gray,
    borderWidth: 2,
  },
  timeText: {
    fontSize: 14,
    color: THEME_COLORS.dark,
  },
  selectedTimeText: {
    color: THEME_COLORS.white,
  },
  bookedTimeText: {
    color: THEME_COLORS.white,
    fontWeight: 'bold',
  },
  notesInput: {
    backgroundColor: THEME_COLORS.white,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 20,
    minHeight: 100,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.primary,
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
    marginLeft: 30,
    marginRight: 30,
    borderRadius: 10,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: THEME_COLORS.gray,
  },
  bookButtonText: {
    color: THEME_COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: THEME_COLORS.white,
    borderRadius: 15,
    padding: 20,
    width: Math.min(400, Dimensions.get('window').width - 40),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
  },
  monthYearContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    margin: 1,
  },
  dayText: {
    fontSize: 14,
    color: THEME_COLORS.dark,
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledDayText: {
    color: THEME_COLORS.gray,
  },
  selectedDay: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
    borderWidth: 2,
  },
  selectedDayText: {
    color: THEME_COLORS.white,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: THEME_COLORS.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: THEME_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 