import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import axios from 'axios';
import { BACKEND_URL, THEME_COLORS } from '../../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function AppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response:', response.data);
      
      if (Array.isArray(response.data)) {
        setAppointments(response.data);
      } else {
        setError('Không có lịch hẹn nào');
      }
    } catch (error) {
      let errorMessage = 'Không thể tải danh sách lịch hẹn. ';
      if (error.response) {
        errorMessage += error.response.data?.message || 'Lỗi server';
      } else if (error.request) {
        errorMessage += 'Không thể kết nối đến server';
      } else {
        errorMessage += error.message;
      }
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: errorMessage,
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Thêm listener để refresh data khi focus vào màn hình
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAppointments();
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAppointments().finally(() => setRefreshing(false));
  }, []);

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

  const renderAppointmentItem = ({ item }) => {
    // Format thời gian theo múi giờ Việt Nam
    const appointmentTime = new Date(item.slotId?.start_time);
    const vietnamTime = new Date(appointmentTime.getTime() + 7 * 60 * 60 * 1000);
    const formattedTime = vietnamTime.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const formattedDate = vietnamTime.toLocaleDateString('vi-VN');

    return (
      <TouchableOpacity 
        style={styles.appointmentCard}
        onPress={() => navigation.navigate('AppointmentDetail', { appointment: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName}>{item.service_name}</Text>
          <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.service_des}
        </Text>

        <View style={styles.appointmentInfo}>
          <View style={styles.infoItem}>
            <FontAwesome5 name="calendar" size={14} color={THEME_COLORS.primary} />
            <Text style={styles.infoText}>
              {formattedDate} - {formattedTime}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <FontAwesome5 name="user-alt" size={14} color={THEME_COLORS.primary} />
            <Text style={styles.infoText}>
              {item.slotId?.stylistId?.name || 'Chưa có stylist'}
            </Text>
          </View>

          {item.notes && (
            <View style={styles.infoItem}>
              <FontAwesome5 name="sticky-note" size={14} color={THEME_COLORS.primary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME_COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Lịch hẹn của bạn</Text>
            <Text style={styles.headerSubtitle}>Quản lý các cuộc hẹn</Text>
          </View>
        </View>
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item._id?.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="calendar-times" size={50} color={THEME_COLORS.gray} />
              <Text style={styles.emptyText}>
                Bạn chưa có lịch hẹn nào
              </Text>
              <TouchableOpacity 
                style={styles.emptyBookButton}
                onPress={() => navigation.navigate('Booking')}
              >
                <Text style={styles.emptyBookButtonText}>Đặt lịch ngay</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.light,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: THEME_COLORS.white,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME_COLORS.gray,
  },
  newBookingButton: {
    backgroundColor: THEME_COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 45,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: THEME_COLORS.gray,
    marginTop: 10,
    marginBottom: 20,
  },
  emptyBookButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 2,
  },
  emptyBookButtonText: {
    color: THEME_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentCard: {
    backgroundColor: THEME_COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    flex: 1,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
  },
  statusText: {
    color: THEME_COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: THEME_COLORS.gray,
    marginBottom: 10,
  },
  appointmentInfo: {
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.light,
    paddingTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  infoText: {
    fontSize: 14,
    color: THEME_COLORS.gray,
    marginLeft: 8,
  },
  errorText: {
    textAlign: 'center',
    color: THEME_COLORS.error,
    margin: 20,
  }
}); 