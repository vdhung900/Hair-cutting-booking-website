import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { BACKEND_URL, THEME_COLORS } from '../../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ServicesScreen({ navigation }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Đang gọi API:', `${BACKEND_URL}/api/services`);
      
      const response = await axios.get(`${BACKEND_URL}/api/services`);
      console.log('Phản hồi từ API:', response.data);
      
      if (response.data.success && response.data.data) {
        setServices(response.data.data);
      } else {
        setError('Không có dữ liệu dịch vụ');
      }
    } catch (error) {
      console.error('Chi tiết lỗi:', error.response || error);
      let errorMessage = 'Không thể tải danh sách dịch vụ. ';
      
      if (error.response) {
        errorMessage += `Lỗi ${error.response.status}: ${error.response.data?.message || 'Không có phản hồi từ server'}`;
      } else if (error.request) {
        errorMessage += 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchServices().finally(() => setRefreshing(false));
  }, []);

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetail', { service: item })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ 
            uri: item.service_images[0].image_url.startsWith('http') 
              ? item.service_images[0].image_url 
              : `${BACKEND_URL}/public/images/services/${item.service_images[0].image_url}`,
            cache: 'force-cache'
          }}
          style={styles.serviceImage}
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.service_category}</Text>
        </View>
        <View style={styles.genderBadge}>
          <FontAwesome5 
            name={item.service_by_gender === 'Nam' ? 'mars' : 'venus'} 
            size={12} 
            color={THEME_COLORS.white} 
          />
          <Text style={styles.genderText}>{item.service_by_gender}</Text>
        </View>
      </View>
      
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName} numberOfLines={1}>
          {item.service_name}
        </Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {item.service_description}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Giá:</Text>
          <Text style={styles.servicePrice}>
            {item.service_price?.toLocaleString('vi-VN')}đ
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('ServiceDetail', { service: item })}
        >
          <FontAwesome5 name="calendar-plus" size={14} color={THEME_COLORS.white} />
          <Text style={styles.bookButtonText}>Đặt lịch</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Dịch vụ của chúng tôi</Text>
            <Text style={styles.headerSubtitle}>Chọn dịch vụ phù hợp với bạn</Text>
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => {/* Thêm chức năng lọc sau */}}
          >
            <FontAwesome5 name="filter" size={16} color={THEME_COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <FontAwesome5 name="exclamation-circle" size={50} color={THEME_COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item._id?.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="inbox" size={50} color={THEME_COLORS.gray} />
              <Text style={styles.emptyText}>
                Không có dịch vụ nào
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.light,
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
  filterButton: {
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
    paddingBottom: 100,
  },
  serviceCard: {
    backgroundColor: THEME_COLORS.white,
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: THEME_COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  genderBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderText: {
    color: THEME_COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  serviceInfo: {
    padding: 15,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: THEME_COLORS.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  priceLabel: {
    fontSize: 14,
    color: THEME_COLORS.gray,
    marginRight: 5,
  },
  servicePrice: {
    fontSize: 18,
    color: THEME_COLORS.primary,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: THEME_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: THEME_COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    color: THEME_COLORS.error,
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: THEME_COLORS.gray,
    marginTop: 10,
    fontSize: 16,
  },
}); 