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
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { THEME_COLORS, BACKEND_URL } from '../../constants/Config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setError('Vui lòng nhập đầy đủ thông tin');
        return;
      }

      setLoading(true);
      setError('');

      console.log('Đang gửi yêu cầu đăng nhập đến:', `${BACKEND_URL}/api/auth/login`);
      
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email,
        password,
      });

      console.log('Phản hồi từ server:', response.data);

      if (response.data.token) {
        console.log('Login response:', response.data);
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        await AsyncStorage.setItem('userRole', response.data.user.role);
        console.log('Saved user role:', response.data.user.role);
        
        // Chuyển hướng đến Main tab navigator
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        setError('Đăng nhập không thành công');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.topSection}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Đặt lịch cắt tóc ngay</Text>
        </View>

        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <FontAwesome5 name="exclamation-circle" size={20} color={THEME_COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <FontAwesome5 name="envelope" size={20} color={THEME_COLORS.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email của bạn"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={THEME_COLORS.gray}
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome5 name="lock" size={20} color={THEME_COLORS.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
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

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={THEME_COLORS.white} />
            ) : (
              <>
                <FontAwesome5 name="sign-in-alt" size={20} color={THEME_COLORS.white} />
                <Text style={styles.loginButtonText}>Đăng Nhập</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>
              Chưa có tài khoản? <Text style={styles.registerHighlight}>Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.white,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: height * 0.04,
    paddingBottom: height * 0.02,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: THEME_COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.errorLight,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: THEME_COLORS.error,
    marginLeft: 10,
    flex: 1,
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
  loginButton: {
    backgroundColor: THEME_COLORS.primary,
    flexDirection: 'row',
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: {
    color: THEME_COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerButtonText: {
    color: THEME_COLORS.gray,
    fontSize: 16,
  },
  registerHighlight: {
    color: THEME_COLORS.primary,
    fontWeight: 'bold',
  },
}); 