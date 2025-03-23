import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { THEME_COLORS, BACKEND_URL } from '../../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ServiceDetailScreen({ route, navigation }) {
  const { service } = route.params;

  // Tạo mảng các bước quy trình (bỏ qua ảnh đầu tiên)
  const processSteps = service.service_images.slice(1);

  const renderProcessSteps = () => {
    const rows = [];
    for (let i = 0; i < processSteps.length; i += 2) {
      const row = (
        <View key={i} style={styles.processRow}>
          <View style={styles.processStep}>
            <Image
              source={{ 
                uri: processSteps[i].image_url.startsWith('http') 
                  ? processSteps[i].image_url 
                  : `${BACKEND_URL}/public/images/services/${processSteps[i].image_url}`,
              }}
              style={styles.processImage}
              resizeMode="cover"
            />
            <Text style={styles.processStepTitle}>{processSteps[i].image_title}</Text>
          </View>
          {i + 1 < processSteps.length && (
            <View style={styles.processStep}>
              <Image
                source={{ 
                  uri: processSteps[i + 1].image_url.startsWith('http') 
                    ? processSteps[i + 1].image_url 
                    : `${BACKEND_URL}/public/images/services/${processSteps[i + 1].image_url}`,
                }}
                style={styles.processImage}
                resizeMode="cover"
              />
              <Text style={styles.processStepTitle}>{processSteps[i + 1].image_title}</Text>
            </View>
          )}
        </View>
      );
      rows.push(row);
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.content}>

            {/* Quy trình dịch vụ */}
            <View style={styles.processContainer}>
              <Text style={styles.processTitle}>Quy trình dịch vụ <Text style={styles.name}>{service.service_name}</Text></Text>
              <Text style={styles.processSubtitle}>Dịch vụ được thực hiện bởi các chuyên gia hàng đầu</Text>
              <View style={styles.processStepsContainer}>
                {renderProcessSteps()}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Nút đặt lịch */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => navigation.navigate('Booking', { service })}
          >
            <Text style={styles.bookButtonText}>ĐẶT LỊCH NGAY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME_COLORS.light,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 10,
  },
  mainImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.orangedark,
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: THEME_COLORS.white,
    padding: 12,
    borderRadius: 10,
    elevation: 2,
  },
  priceLabel: {
    fontSize: 15,
    color: THEME_COLORS.gray,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
    marginLeft: 8,
  },
  descriptionContainer: {
    backgroundColor: THEME_COLORS.white,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: THEME_COLORS.gray,
    lineHeight: 20,
  },
  processContainer: {
    backgroundColor: THEME_COLORS.white,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  processTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  processSubtitle: {
    fontSize: 13,
    color: THEME_COLORS.gray,
    marginBottom: 15,
    textAlign: 'center',
  },
  processStepsContainer: {
    width: '100%',
  },
  processRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  processStep: {
    width: (width - 50) / 2,
    alignItems: 'center',
  },
  processImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 6,
  },
  processStepTitle: {
    fontSize: 13,
    color: THEME_COLORS.dark,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  footer: {
    padding: 15,
    backgroundColor: THEME_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bookButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: THEME_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 