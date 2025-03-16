import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { THEME_COLORS, BACKEND_URL } from '../../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from '../../components/Toast';

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null,
  });
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    loadUserData();
    requestPermissions();
  }, []);

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

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast(
          'Ứng dụng cần quyền truy cập thư viện ảnh để thay đổi ảnh đại diện',
          'warning'
        );
      }
    }
  };

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          avatar: user.avatar || null,
        });
      }
    } catch (error) {
      showToast('Không thể tải thông tin người dùng', 'error');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setUserData(prev => ({ ...prev, avatar: result.assets[0].uri }));
      }
    } catch (error) {
      showToast('Không thể chọn ảnh. Vui lòng thử lại', 'error');
    }
  };

  const handleSave = async () => {
    if (!userData.name.trim()) {
      showToast('Vui lòng nhập họ tên', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      
      if (!token || !user?._id) {
        showToast('Vui lòng đăng nhập lại', 'error');
        return;
      }

      // Tạo form data nếu có ảnh mới
      let formData = new FormData();
      formData.append('name', userData.name);
      formData.append('phone', userData.phone);
      
      // Kiểm tra nếu có ảnh mới và là local file
      if (userData.avatar && !userData.avatar.startsWith('http')) {
        console.log('Preparing image for upload:', userData.avatar);
        const filename = userData.avatar.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        const imageUri = Platform.OS === 'android' ? userData.avatar : userData.avatar.replace('file://', '');
        console.log('Image URI after platform check:', imageUri);
        
        const imageFile = {
          uri: imageUri,
          type: type,
          name: filename
        };
        console.log('Image file object:', imageFile);
        formData.append('avatar', imageFile);
      }

      // Log formData một cách an toàn
      try {
        console.log('FormData entries:');
        for (let pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }
      } catch (error) {
        console.log('Cannot log FormData:', error);
      }
      
      const response = await axios.put(
        `${BACKEND_URL}/api/users/${user._id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
        }
      );

      console.log('Server response:', response.data);

      if (response.data) {
        // Cập nhật thông tin user trong AsyncStorage
        const updatedUser = {
          ...user,
          name: response.data.name,
          phone: response.data.phone,
          avatar: response.data.avatar ? `${BACKEND_URL}${response.data.avatar}` : null
        };
        console.log('Updated user data:', updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Cập nhật state ngay lập tức
        setUserData(prev => ({
          ...prev,
          name: updatedUser.name,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar
        }));
        
        showToast('Cập nhật thông tin thành công', 'success');
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      showToast(
        error.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              userData.avatar
                ? { uri: userData.avatar.startsWith('http') 
                    ? userData.avatar 
                    : `${BACKEND_URL}${userData.avatar}` }
                : require('../../assets/images/default-avatar.png')
            }
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage}>
            <FontAwesome5 name="camera" size={16} color={THEME_COLORS.white} />
            <Text style={styles.changeAvatarText}>Đổi ảnh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={userData.name}
              onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
              placeholder="Nhập họ và tên"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userData.email}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={userData.phone}
              onChangeText={(text) => setUserData(prev => ({ ...prev, phone: text }))}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={THEME_COLORS.white} />
            ) : (
              <>
                <FontAwesome5 name="save" size={16} color={THEME_COLORS.white} />
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: THEME_COLORS.light,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: THEME_COLORS.white,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeAvatarText: {
    color: THEME_COLORS.white,
    marginLeft: 8,
    fontSize: 14,
  },
  form: {
    backgroundColor: THEME_COLORS.white,
    marginTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: THEME_COLORS.dark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME_COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: THEME_COLORS.light,
    color: THEME_COLORS.gray,
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