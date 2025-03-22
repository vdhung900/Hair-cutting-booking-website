import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import { THEME_COLORS, BACKEND_URL } from '../../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'user']);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  const LogoutConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showLogoutModal}
      onRequestClose={() => setShowLogoutModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Đăng xuất</Text>
          <Text style={styles.modalMessage}>Bạn có chắc chắn muốn đăng xuất?</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowLogoutModal(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.logoutModalButton]}
              onPress={() => {
                setShowLogoutModal(false);
                handleLogout();
              }}
            >
              <Text style={styles.logoutModalButtonText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Image
            source={
              user.avatar
              ? { uri: user.avatar.startsWith('http') 
                  ? user.avatar 
                  : `${BACKEND_URL}${user.avatar}` }
              : require('../../assets/images/default-avatar.png')
            }
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.name || 'Người dùng'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <FontAwesome5 name="user-edit" size={20} color={THEME_COLORS.primary} />
            <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
            <FontAwesome5 name="chevron-right" size={16} color={THEME_COLORS.gray} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              console.log('Đang chuyển đến màn hình đổi mật khẩu...');
              navigation.navigate('ChangePassword');
            }}
          >
            <FontAwesome5 name="key" size={20} color={THEME_COLORS.primary} />
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
            <FontAwesome5 name="chevron-right" size={16} color={THEME_COLORS.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('History')}
          >
            <FontAwesome5 name="calendar-alt" size={20} color={THEME_COLORS.primary} />
            <Text style={styles.menuText}>Lịch sử đặt lịch</Text>
            <FontAwesome5 name="chevron-right" size={16} color={THEME_COLORS.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome5 name="bell" size={20} color={THEME_COLORS.primary} />
            <Text style={styles.menuText}>Thông báo</Text>
            <FontAwesome5 name="chevron-right" size={16} color={THEME_COLORS.gray} />
          </TouchableOpacity>

          {user?.role === 'admin' && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('MonthlyIncome')}
            >
              <FontAwesome5 name="chart-line" size={20} color={THEME_COLORS.primary} />
              <Text style={styles.menuText}>Thống kê thu nhập</Text>
              <FontAwesome5 name="chevron-right" size={16} color={THEME_COLORS.gray} />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
          >
            <FontAwesome5 name="sign-out-alt" size={20} color={THEME_COLORS.white} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      <LogoutConfirmationModal />
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: THEME_COLORS.primary,
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.white,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: THEME_COLORS.white,
    opacity: 0.8,
  },
  section: {
    backgroundColor: THEME_COLORS.white,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.light,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: THEME_COLORS.dark,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.danger,
    margin: 30,
    padding: 15,
    borderRadius: 10,
  },
  logoutText: {
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
  cancelButton: {
    backgroundColor: THEME_COLORS.light,
  },
  cancelButtonText: {
    color: THEME_COLORS.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutModalButton: {
    backgroundColor: THEME_COLORS.danger,
  },
  logoutModalButtonText: {
    color: THEME_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 