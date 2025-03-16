import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { THEME_COLORS, BACKEND_URL } from '../../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from '../../components/Toast';

const ChangePasswordScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

  const handleChangePassword = async () => {
    try {
      // Kiểm tra validation
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        showToast('Vui lòng điền đầy đủ thông tin', 'error');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        showToast('Mật khẩu mới không khớp', 'error');
        return;
      }

      if (formData.newPassword.length < 6) {
        showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
        return;
      }

      setLoading(true);

      // Lấy thông tin user từ AsyncStorage
      const userStr = await AsyncStorage.getItem('user');
      console.log('User data from AsyncStorage:', userStr);
      
      if (!userStr) {
        showToast('Không tìm thấy thông tin người dùng', 'error');
        return;
      }

      const user = JSON.parse(userStr);
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token from AsyncStorage:', token);
      console.log('User ID:', user._id);

      if (!user._id || !token) {
        showToast('Vui lòng đăng nhập lại', 'error');
        return;
      }

      console.log('Sending request to:', `${BACKEND_URL}/api/users/${user._id}/change-password`);
      const response = await axios.put(
        `${BACKEND_URL}/api/users/${user._id}/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Response from server:', response.data);

      if (response.data.success) {
        showToast('Đổi mật khẩu thành công!', 'success');
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        showToast(response.data.message || 'Không thể đổi mật khẩu', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error.response?.data || error.message);
      showToast(
        error.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại sau',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.currentPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, currentPassword: text }))}
                secureTextEntry={!showPasswords.current}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => toggleShowPassword('current')}
              >
                <FontAwesome5
                  name={showPasswords.current ? 'eye' : 'eye-slash'}
                  size={18}
                  color={THEME_COLORS.gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.newPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, newPassword: text }))}
                secureTextEntry={!showPasswords.new}
                placeholder="Nhập mật khẩu mới"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => toggleShowPassword('new')}
              >
                <FontAwesome5
                  name={showPasswords.new ? 'eye' : 'eye-slash'}
                  size={18}
                  color={THEME_COLORS.gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                secureTextEntry={!showPasswords.confirm}
                placeholder="Nhập lại mật khẩu mới"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => toggleShowPassword('confirm')}
              >
                <FontAwesome5
                  name={showPasswords.confirm ? 'eye' : 'eye-slash'}
                  size={18}
                  color={THEME_COLORS.gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={THEME_COLORS.white} />
            ) : (
              <>
                <FontAwesome5 name="key" size={16} color={THEME_COLORS.white} />
                <Text style={styles.saveButtonText}>Đổi mật khẩu</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      {toast.visible && (
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      )}
    </View>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.light,
  },
  form: {
    backgroundColor: THEME_COLORS.white,
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: THEME_COLORS.dark,
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.gray,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.primary,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: THEME_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  }
}); 