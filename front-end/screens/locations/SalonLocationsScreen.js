import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { THEME_COLORS } from '../../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';

export default function SalonLocationsScreen({ navigation }) {
  const salonInfo = {
    name: "Shine - Cắt tóc nam",
    address: "26 Cụm 1, Thôn 3, Thạch Thất, Hà Nội 100000, Việt Nam",
    phone: "1900272737",
    openHours: "9:00 - 20:00",
    rating: 4.8,
  };

  const openDirections = () => {
    const address = encodeURIComponent(salonInfo.address);
    const url = Platform.select({
      ios: `maps://0,0?q=${address}`,
      android: `https://www.google.com/maps/search/?api=1&query=${address}`,
      default: `https://maps.app.goo.gl/Qk5oWvQ1TRHeZ8v17`,
    });
    Linking.openURL(url);
  };

  const callSalon = () => {
    Linking.openURL(`tel:${salonInfo.phone}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME_COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="chevron-left" size={20} color={THEME_COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa chỉ Salon</Text>
      </View>

      {/* Static Map Image */}
      <View style={styles.mapContainer}>
        <Image 
          source={require('../../assets/images/map-placeholder.png')}
          style={styles.mapImage}
          resizeMode="cover"
        />
      </View>

      {/* Salon Info */}
      <ScrollView style={styles.infoContainer}>
        <Text style={styles.salonName}>{salonInfo.name}</Text>
        <View style={styles.ratingContainer}>
          <FontAwesome5 name="star" solid size={16} color={THEME_COLORS.primary} />
          <Text style={styles.rating}>{salonInfo.rating}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <FontAwesome5 name="map-marker-alt" size={16} color={THEME_COLORS.primary} />
          <Text style={styles.infoText}>{salonInfo.address}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <FontAwesome5 name="clock" size={16} color={THEME_COLORS.primary} />
          <Text style={styles.infoText}>Giờ mở cửa: {salonInfo.openHours}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.directionButton} onPress={openDirections}>
            <FontAwesome5 name="directions" size={20} color={THEME_COLORS.white} />
            <Text style={styles.buttonText}>Chỉ đường</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.callButton} onPress={callSalon}>
            <FontAwesome5 name="phone" size={20} color={THEME_COLORS.white} />
            <Text style={styles.buttonText}>Gọi điện</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 30,
  },
  mapContainer: {
    height: 300,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    padding: 20,
  },
  salonName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rating: {
    fontSize: 16,
    color: THEME_COLORS.dark,
    marginLeft: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: THEME_COLORS.dark,
    marginLeft: 10,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  directionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.primary,
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.success,
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  buttonText: {
    color: THEME_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
}); 