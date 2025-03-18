import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { THEME_COLORS, BACKEND_URL } from '../../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BannerSlider from '../../components/BannerSlider';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkLoginStatus();
    fetchServices();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserName(user.name || '');
      } else {
        setIsLoggedIn(false);
        setUserName('');
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user:', error);
      setIsLoggedIn(false);
      setUserName('');
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/services`);
      if (response.data.success) {
        setServices(response.data.data);
      }
      setLoading(false);
    } catch (err) {
      setError('Không thể tải dữ liệu dịch vụ');
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 1, icon: 'gift', title: 'Ưu đãi' },
    { id: 2, icon: 'star', title: 'Shine Member' },
    { id: 3, icon: 'shield-alt', title: 'Cam kết' },
    { id: 4, icon: 'location-arrow', title: 'Địa chỉ Salon' },
  ];

  const renderServiceItem = (service) => (
    <TouchableOpacity
      key={service._id}
      style={styles.serviceItem}
      onPress={() => navigation.navigate('ServiceDetail', { service: service })}
    >
      <Image 
        source={{ 
          uri: service.service_images[0].image_url.startsWith('http') 
            ? service.service_images[0].image_url 
            : `${BACKEND_URL}/public/images/services/${service.service_images[0].image_url}`,
          cache: 'force-cache'
        }}
        style={styles.serviceImage}
        resizeMode="cover"
      />
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{service.service_name}</Text>
        {service.service_price && (
          <Text style={styles.servicePrice}>Giá từ {service.service_price.toLocaleString('vi-VN')}đ</Text>
        )}
        <Text style={styles.learnMore}>Tìm hiểu thêm →</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text>{error}</Text>
        <TouchableOpacity onPress={fetchServices} style={styles.retryButton}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={THEME_COLORS.primary} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image 
            source={require('../../assets/images/default-avatar.png')}
            style={styles.avatar}
          />
          <View style={styles.userTexts}>
            <Text style={styles.userName}>{userName}</Text>
            <TouchableOpacity onPress={() => isLoggedIn ? navigation.navigate('Profile') : navigation.navigate('Login')}>
              <Text style={styles.memberStatus}>
                {isLoggedIn ? 'Xem thông tin tài khoản' : 'Đăng ký ngay →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome5 name="bell" size={20} color={THEME_COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BannerSlider />
        {/* Menu Items */}
        <View style={styles.menuGrid}>
          {menuItems.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.menuIconContainer}>
                <FontAwesome5 name={item.icon} size={24} color={THEME_COLORS.primary} />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>        

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>DỊCH VỤ TÓC</Text>
          <View style={styles.servicesGrid}>
            {services.map(renderServiceItem)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME_COLORS.light,
  },
  header: {
    backgroundColor: THEME_COLORS.primary,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userTexts: {
    flex: 1,
  },
  userName: {
    color: THEME_COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberStatus: {
    color: THEME_COLORS.white,
    opacity: 0.8,
    fontSize: 12,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: THEME_COLORS.white,
    borderRadius: 15,
  },
  menuItem: {
    width: '25%',
    alignItems: 'center',
    padding: 10,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  menuText: {
    fontSize: 12,
    textAlign: 'center',
    color: THEME_COLORS.dark,
  },
  ratingSection: {
    backgroundColor: THEME_COLORS.white,
    margin: 10,
    borderRadius: 15,
    padding: 15,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  ratingText: {
    flex: 1,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 5,
  },
  ratingSubtitle: {
    fontSize: 12,
    color: THEME_COLORS.gray,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  star: {
    marginHorizontal: 5,
  },
  banner: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  servicesSection: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 15,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: THEME_COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  serviceImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  serviceInfo: {
    padding: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    color: THEME_COLORS.primary,
    fontWeight: '500',
  },
  learnMore: {
    fontSize: 12,
    color: THEME_COLORS.gray,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: THEME_COLORS.white,
    fontWeight: '500',
  },
}); 