import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { THEME_COLORS, BACKEND_URL } from '../../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;
const MIN_CHART_WIDTH = CHART_WIDTH * 0.5;
const MAX_CHART_WIDTH = CHART_WIDTH * 2;

export default function MonthlyIncomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [chartWidth, setChartWidth] = useState(CHART_WIDTH);

  // Animation values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    fetchMonthlyStats();
    fetchMonthlyData();
  }, [selectedMonth]);

  const fetchMonthlyStats = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const month = selectedMonth.getMonth() + 1;
      const year = selectedMonth.getFullYear();
      const response = await axios.get(`${BACKEND_URL}/api/appointments/stats/monthly-income?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Lỗi khi lấy thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const month = selectedMonth.getMonth() + 1;
      const year = selectedMonth.getFullYear();
      const response = await axios.get(`${BACKEND_URL}/api/appointments/stats/monthly-data?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMonthlyData(response.data.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu theo tháng:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getMonthName = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const changeMonth = (increment) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(selectedMonth.getMonth() + increment);
    setSelectedMonth(newDate);
    setShowMonthPicker(false);
  };

  const chartData = {
    labels: monthlyData.map(item => `${item.day}`),
    datasets: [{
      data: monthlyData.map(item => item.totalIncome),
    }],
  };

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startScale = scale.value;
    },
    onActive: (event, ctx) => {
      scale.value = Math.min(Math.max(ctx.startScale * event.scale, 0.5), 2);
      const newWidth = CHART_WIDTH * scale.value;
      runOnJS(setChartWidth)(Math.min(Math.max(newWidth, MIN_CHART_WIDTH), MAX_CHART_WIDTH));
    },
    onEnd: () => {
      savedScale.value = scale.value;
    },
  });

  const panHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    },
  });

  const chartStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const MonthPickerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showMonthPicker}
      onRequestClose={() => setShowMonthPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn tháng</Text>
            <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
              <FontAwesome5 name="times" size={20} color={THEME_COLORS.dark} />
            </TouchableOpacity>
          </View>
          <View style={styles.monthPickerContainer}>
            <TouchableOpacity 
              style={styles.monthPickerButton}
              onPress={() => changeMonth(-1)}
            >
              <FontAwesome5 name="chevron-left" size={20} color={THEME_COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.selectedMonthText}>
              {getMonthName(selectedMonth)}
            </Text>
            <TouchableOpacity 
              style={styles.monthPickerButton}
              onPress={() => changeMonth(1)}
            >
              <FontAwesome5 name="chevron-right" size={20} color={THEME_COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME_COLORS.white} />
      <ScrollView
         contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            {/* Tháng và năm */}
            <TouchableOpacity 
              style={styles.monthYearContainer}
              onPress={() => setShowMonthPicker(true)}
            >
              <Text style={styles.monthYearText}>
                {getMonthName(selectedMonth)}
              </Text>
              <FontAwesome5 name="calendar-alt" size={20} color={THEME_COLORS.white} style={styles.calendarIcon} />
            </TouchableOpacity>

            {/* Biểu đồ thu nhập */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Thu nhập theo tháng</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <PanGestureHandler onGestureEvent={panHandler}>
                  <Animated.View>
                    <PinchGestureHandler onGestureEvent={pinchHandler}>
                      <Animated.View style={[styles.chartWrapper, chartStyle]}>
                        <LineChart
                          data={chartData}
                          width={Math.max(chartWidth, SCREEN_WIDTH * 1.5)}
                          height={250}
                          chartConfig={{
                            backgroundColor: THEME_COLORS.white,
                            backgroundGradientFrom: THEME_COLORS.white,
                            backgroundGradientTo: THEME_COLORS.white,
                            decimalPlaces: 0,
                            color: (opacity = 1) => THEME_COLORS.primary,
                            labelColor: (opacity = 1) => THEME_COLORS.dark,
                            propsForLabels: {
                              fontSize: 12,
                              fontWeight: 'bold',
                            },
                            propsForVerticalLabels: {
                              fontSize: 10,
                              rotation: 0,
                            },
                            propsForHorizontalLabels: {
                              fontSize: 10,
                            },
                            style: {
                              borderRadius: 16,
                            },
                            formatYLabel: (value) => {
                              return new Intl.NumberFormat('vi-VN', {
                                style: 'decimal',
                                maximumFractionDigits: 0
                              }).format(value) + 'đ';
                            },
                          }}
                          bezier
                          style={styles.chart}
                          withDots={true}
                          withInnerLines={true}
                          withOuterLines={true}
                          withVerticalLines={true}
                          withHorizontalLines={true}
                          withVerticalLabels={true}
                          withHorizontalLabels={true}
                          withShadow={false}
                          segments={4}
                          yAxisLabel=""
                          yAxisSuffix=""
                          yAxisInterval={1}
                          xAxisInterval={3}
                          hidePointsAtIndex={[]}
                          hideLegend={true}
                          fromZero={true}
                        />
                      </Animated.View>
                    </PinchGestureHandler>
                  </Animated.View>
                </PanGestureHandler>
              </ScrollView>
            </View>

            {/* Tổng thu nhập */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <FontAwesome5 name="money-bill-wave" size={24} color={THEME_COLORS.primary} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Tổng thu nhập</Text>
                <Text style={styles.statValue}>{formatCurrency(stats?.totalIncome || 0)}</Text>
              </View>
            </View>

            {/* Tổng số lịch hẹn */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <FontAwesome5 name="calendar" size={24} color={THEME_COLORS.primary} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Tổng số lịch hẹn</Text>
                <Text style={styles.statValue}>{stats?.totalAppointments || 0}</Text>
              </View>
            </View>

            {/* Số lịch hẹn hoàn thành */}
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: THEME_COLORS.lightGreen }]}>
                <FontAwesome5 name="calendar-check" size={24} color={THEME_COLORS.success} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Số lịch hẹn đã hoàn thành</Text>
                <Text style={[styles.statValue, { color: THEME_COLORS.success }]}>{stats?.completedAppointments || 0}</Text>
              </View>
            </View>

            {/* Số lịch hẹn đang chờ */}
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: THEME_COLORS.lightYellow }]}>
                <FontAwesome5 name="clock" size={24} color={THEME_COLORS.warning} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Số lịch hẹn đang chờ</Text>
                <Text style={[styles.statValue, { color: THEME_COLORS.warning }]}>{stats?.pendingAppointments || 0}</Text>
              </View>
            </View>

            {/* Số lịch hẹn hủy */}
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: THEME_COLORS.lightRed }]}>
                <FontAwesome5 name="calendar-times" size={24} color={THEME_COLORS.danger} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Số lịch hẹn đã hủy</Text>
                <Text style={[styles.statValue, { color: THEME_COLORS.danger }]}>{stats?.cancelledAppointments || 0}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      <MonthPickerModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.white,
  },
  content: {
    padding: 16,
    paddingBottom: 40, // thêm để tránh bị che dưới
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    padding: 10,
  },
  monthYearContainer: {
    backgroundColor: THEME_COLORS.primary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.white,
    marginRight: 10,
  },
  calendarIcon: {
    marginLeft: 10,
  },
  chartContainer: {
    backgroundColor: THEME_COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
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
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 10,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.white,
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
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
  statIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: THEME_COLORS.lightBlue,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: THEME_COLORS.gray,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
  },
  monthPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  monthPickerButton: {
    padding: 10,
  },
  selectedMonthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
  },
}); 