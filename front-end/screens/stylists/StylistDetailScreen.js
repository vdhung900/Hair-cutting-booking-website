import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { THEME_COLORS } from '../../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';

export default function StylistDetailScreen({ route, navigation }) {
  const { stylist } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: stylist.avatar || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{stylist.name}</Text>
        <View style={styles.ratingContainer}>
          <FontAwesome5 name="star" solid size={16} color={THEME_COLORS.primary} />
          <Text style={styles.rating}>{stylist.rating || '5.0'}</Text>
          <Text style={styles.reviews}>({stylist.reviews || '0'} đánh giá)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chuyên môn</Text>
        <View style={styles.specialtyContainer}>
          {stylist.specialties?.map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kinh nghiệm</Text>
        <Text style={styles.experienceText}>
          {stylist.experience} năm kinh nghiệm trong nghề
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Giới thiệu</Text>
        <Text style={styles.description}>
          {stylist.description || 'Chưa có thông tin giới thiệu.'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch làm việc</Text>
        <View style={styles.scheduleContainer}>
          {stylist.schedule?.map((day, index) => (
            <View key={index} style={styles.scheduleItem}>
              <Text style={styles.dayText}>{day.day}</Text>
              <Text style={styles.timeText}>{day.time}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.bookButton}
        onPress={() => navigation.navigate('Booking', { stylist })}
      >
        <Text style={styles.bookButtonText}>Đặt lịch với stylist này</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.light,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: THEME_COLORS.white,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: THEME_COLORS.dark,
    marginLeft: 8,
    marginRight: 5,
  },
  reviews: {
    fontSize: 14,
    color: THEME_COLORS.gray,
  },
  section: {
    backgroundColor: THEME_COLORS.white,
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 15,
  },
  specialtyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyTag: {
    backgroundColor: THEME_COLORS.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  specialtyText: {
    fontSize: 14,
    color: THEME_COLORS.primary,
  },
  experienceText: {
    fontSize: 16,
    color: THEME_COLORS.gray,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: THEME_COLORS.gray,
    lineHeight: 24,
  },
  scheduleContainer: {
    backgroundColor: THEME_COLORS.light,
    borderRadius: 10,
    overflow: 'hidden',
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.white,
  },
  dayText: {
    fontSize: 16,
    color: THEME_COLORS.dark,
  },
  timeText: {
    fontSize: 16,
    color: THEME_COLORS.primary,
  },
  bookButton: {
    backgroundColor: THEME_COLORS.primary,
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: THEME_COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 