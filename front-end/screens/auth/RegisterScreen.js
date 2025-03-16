import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { THEME_COLORS, BACKEND_URL } from '../../constants/Config';
import axios from 'axios';
import { FontAwesome5 } from '@expo/vector-icons';
import Toast from '../../components/Toast';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'error') => {
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

  const handleRegister = async () => {
    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
        showToast('Vui lòng điền đầy đủ thông tin');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        showToast('Mật khẩu xác nhận không khớp');
        return;
      }

      setLoading(true);

      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      setLoading(false);
      
      // Hiển thị thông báo thành công
      showToast('Đăng ký tài khoản thành công!', 'success');
      
      // Chuyển sang màn đăng nhập sau 2 giây
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error) {
      setLoading(false);
      showToast(error.response?.data?.message || 'Đăng ký không thành công');
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <FontAwesome5 name="user" size={20} color={THEME_COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Họ và tên"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  placeholderTextColor={THEME_COLORS.gray}
                />
              </View>

              <View style={styles.inputContainer}>
                <FontAwesome5 name="envelope" size={20} color={THEME_COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={THEME_COLORS.gray}
                />
              </View>

              <View style={styles.inputContainer}>
                <FontAwesome5 name="phone" size={20} color={THEME_COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                  placeholderTextColor={THEME_COLORS.gray}
                />
              </View>

              <View style={styles.inputContainer}>
                <FontAwesome5 name="lock" size={20} color={THEME_COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={THEME_COLORS.gray}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <FontAwesome5 
                    name={showPassword ? "eye" : "eye-slash"} 
                    size={20} 
                    color={THEME_COLORS.gray} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <FontAwesome5 name="lock" size={20} color={THEME_COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor={THEME_COLORS.gray}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <FontAwesome5 
                    name={showConfirmPassword ? "eye" : "eye-slash"} 
                    size={20} 
                    color={THEME_COLORS.gray} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={THEME_COLORS.white} />
                ) : (
                  <Text style={styles.registerButtonText}>Đăng Ký</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginButtonText}>
                  Đã có tài khoản? <Text style={styles.loginHighlight}>Đăng nhập ngay</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.primary,
  },
  content: {
    flex: 1,
    backgroundColor: THEME_COLORS.white,
    overflow: 'hidden',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: THEME_COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 20,
    paddingRight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.light,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: THEME_COLORS.dark,
  },
  eyeIcon: {
    padding: 10,
  },
  registerButton: {
    backgroundColor: THEME_COLORS.primary,
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  registerButtonText: {
    color: THEME_COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  loginButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginButtonText: {
    color: THEME_COLORS.gray,
    fontSize: 16,
  },
  loginHighlight: {
    color: THEME_COLORS.primary,
    fontWeight: 'bold',
  },
}); 