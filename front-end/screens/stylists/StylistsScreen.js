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
} from 'react-native';
import axios from 'axios';
import { BACKEND_URL, THEME_COLORS } from '../../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';

export default function StylistsScreen({ navigation }) {
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchStylists = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Đang gọi API:', `${BACKEND_URL}/api/stylists`);
      
      const response = await axios.get(`${BACKEND_URL}/api/stylists`);
      console.log('Phản hồi từ API:', response.data);
      
      if (response.data.success && response.data.data) {
        setStylists(response.data.data);
      } else {
        setError('Không có dữ liệu stylist');
      }
    } catch (error) {
      console.error('Chi tiết lỗi:', error.response || error);
      let errorMessage = 'Không thể tải danh sách stylist. ';
      
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
    fetchStylists();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStylists().finally(() => setRefreshing(false));
  }, []);

  const renderStylistItem = ({ item }) => (
    <TouchableOpacity
      style={styles.stylistCard}
      onPress={() => navigation.navigate('StylistDetail', { stylist: item })}
    >
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/150' }}
        style={styles.avatar}
      />
      <View style={styles.stylistInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <FontAwesome5 name="star" solid size={14} color={THEME_COLORS.primary} />
          <Text style={styles.rating}>{item.rating || '5.0'}</Text>
          <Text style={styles.reviews}>({item.reviews || '0'} đánh giá)</Text>
        </View>
        <View style={styles.specialtyContainer}>
          {item.specialties?.map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.experience}>
          {item.experience} năm kinh nghiệm
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME_COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={stylists}
          renderItem={renderStylistItem}
          keyExtractor={(item) => item._id?.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Không có stylist nào
            </Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  stylistCard: {
    backgroundColor: THEME_COLORS.white,
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  stylistInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    color: THEME_COLORS.dark,
    marginLeft: 5,
    marginRight: 5,
  },
  reviews: {
    fontSize: 14,
    color: THEME_COLORS.gray,
  },
  specialtyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  specialtyTag: {
    backgroundColor: THEME_COLORS.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: THEME_COLORS.primary,
  },
  experience: {
    fontSize: 14,
    color: THEME_COLORS.gray,
  },
  errorText: {
    textAlign: 'center',
    color: THEME_COLORS.error,
    margin: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: THEME_COLORS.gray,
    margin: 20,
  },
}); 