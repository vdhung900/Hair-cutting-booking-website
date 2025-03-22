import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import { THEME_COLORS, BACKEND_URL } from '../../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function AppointmentDetailScreen({ route, navigation }) {
  const { appointment } = route.params;
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    try {
      const userRole = await AsyncStorage.getItem('userRole');
      console.log('User role from AsyncStorage:', userRole);
      setIsAdmin(userRole === 'admin');
      console.log('Is admin:', userRole === 'admin');
    } catch (error) {
      console.error('Lỗi khi kiểm tra vai trò:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return THEME_COLORS.warning;
      case 'confirmed':
        return THEME_COLORS.success;
      case 'cancelled':
        return THEME_COLORS.danger;
      case 'completed':
        return THEME_COLORS.primary;
      default:
        return THEME_COLORS.gray;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Không xác định';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return {
      date: vietnamTime.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: vietnamTime.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const handleCancelAppointment = () => {
    setShowCancelModal(true);
  };

  const handleConfirmAppointment = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      await axios.put(
        `${BACKEND_URL}/api/appointments/${appointment._id}/confirm`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã xác nhận lịch hẹn thành công',
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể xác nhận lịch hẹn. Vui lòng thử lại sau.',
      });
    } finally {
      setLoading(false);
    }
  };

  const CancelConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showCancelModal}
      onRequestClose={() => setShowCancelModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Xác nhận hủy lịch</Text>
          <Text style={styles.modalMessage}>Bạn có chắc chắn muốn hủy lịch hẹn này không?</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.keepButton]}
              onPress={() => setShowCancelModal(false)}
            >
              <Text style={styles.keepButtonText}>Giữ lại</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmCancelButton]}
              onPress={() => {
                setShowCancelModal(false);
                cancelAppointment();
              }}
            >
              <Text style={styles.confirmCancelButtonText}>Hủy lịch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const cancelAppointment = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      await axios.put(
        `${BACKEND_URL}/api/appointments/${appointment._id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã hủy lịch hẹn thành công',
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể hủy lịch hẹn. Vui lòng thử lại sau.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAppointment = () => {
    navigation.navigate('EditAppointment', { appointment });
  };

  const { date, time } = formatDateTime(appointment.slotId?.start_time);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Banner */}
        <View style={styles.banner}>

          <View style={styles.bannerOverlay}>
            <View style={[styles.statusTag, { backgroundColor: getStatusColor(appointment.status) }]}>
              <FontAwesome5 
                name={appointment.status === 'confirmed' ? 'check-circle' : 
                      appointment.status === 'cancelled' ? 'times-circle' : 
                      appointment.status === 'completed' ? 'check-double' : 'clock'} 
                size={16} 
                color={THEME_COLORS.white} 
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>{getStatusText(appointment.status)}</Text>
            </View>
          </View>
        </View>

        {/* Service Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin dịch vụ</Text>
          <View style={styles.serviceInfo}>
            <FontAwesome5 name="concierge-bell" size={40} color={THEME_COLORS.primary} style={styles.serviceIcon} />
            <View style={styles.serviceDetails}>
              <Text style={styles.serviceName}>{appointment.service_name}</Text>
              <Text style={styles.serviceDescription} numberOfLines={2}>
                {appointment.service_des}
              </Text>
            </View>
          </View>
        </View>

        {/* Appointment Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin lịch hẹn</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome5 name="calendar-alt" size={16} color={THEME_COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngày hẹn</Text>
              <Text style={styles.infoText}>{date}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome5 name="clock" size={16} color={THEME_COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Thời gian</Text>
              <Text style={styles.infoText}>{time}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome5 name="user-alt" size={16} color={THEME_COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Stylist</Text>
              <Text style={styles.infoText}>
                {appointment.slotId?.stylistId?.name || 'Chưa có stylist'}
              </Text>
            </View>
          </View>

          {appointment.notes && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <FontAwesome5 name="sticky-note" size={16} color={THEME_COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ghi chú</Text>
                <Text style={styles.infoText}>{appointment.notes}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton, styles.buttonFlex]}
                onPress={handleCancelAppointment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={THEME_COLORS.white} />
                ) : (
                  <>
                    <FontAwesome5 name="calendar-times" size={20} color={THEME_COLORS.white} />
                    <Text style={styles.actionButtonText}>Hủy lịch hẹn</Text>
                  </>
                )}
              </TouchableOpacity>

              {appointment.status === 'pending' && isAdmin && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.confirmButton, styles.buttonFlex]}
                  onPress={handleConfirmAppointment}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={THEME_COLORS.white} />
                  ) : (
                    <>
                      <FontAwesome5 name="check-circle" size={20} color={THEME_COLORS.white} />
                      <Text style={styles.actionButtonText}>Xác nhận</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <CancelConfirmationModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.light,
  },
  content: {
    flex: 1,
  },
  banner: {
    height: 75,
    position: 'relative',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    color: THEME_COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: THEME_COLORS.white,
    borderRadius: 15,
    padding: 15,
    margin: 5,
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: THEME_COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 15,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    marginRight: 15,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 14,
    color: THEME_COLORS.gray,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: THEME_COLORS.lightBlue,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: THEME_COLORS.gray,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 16,
    color: THEME_COLORS.dark,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonFlex: {
    flex: 1,
  },
  actionButtonsContainer: {
    padding: 15,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  confirmButton: {
    backgroundColor: THEME_COLORS.success,
  },
  cancelButton: {
    backgroundColor: THEME_COLORS.danger,
  },
  actionButtonText: {
    color: THEME_COLORS.white,
    fontSize: 16,
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
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: THEME_COLORS.dark,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  keepButton: {
    backgroundColor: THEME_COLORS.light,
  },
  keepButtonText: {
    color: THEME_COLORS.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmCancelButton: {
    backgroundColor: THEME_COLORS.danger,
  },
  confirmCancelButtonText: {
    color: THEME_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 