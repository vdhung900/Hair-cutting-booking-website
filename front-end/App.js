import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { THEME_COLORS } from './constants/Config';
import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

// Import các màn hình
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import HomeScreen from './screens/home/HomeScreen';
import ServicesScreen from './screens/services/ServicesScreen';
import ServiceDetailScreen from './screens/services/ServiceDetailScreen';
import StylistsScreen from './screens/stylists/StylistsScreen';
import StylistDetailScreen from './screens/stylists/StylistDetailScreen';
import AppointmentsScreen from './screens/appointments/AppointmentsScreen';
import BookingScreen from './screens/appointments/BookingScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import ChangePasswordScreen from './screens/profile/ChangePasswordScreen';
import EditProfileScreen from './screens/profile/EditProfileScreen';
import CommitmentScreen from './screens/commitment/CommitmentScreen';
import SalonLocationsScreen from './screens/locations/SalonLocationsScreen';
import AppointmentDetailScreen from './screens/appointments/AppointmentDetailScreen';
import MonthlyIncomeScreen from './screens/admin/MonthlyIncomeScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Custom tab bar button cho nút Đặt lịch
function CustomTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={{
        top: -10,
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onPress={onPress}
    >
      <View style={{
        width: 65,
        height: 65,
        borderRadius: 45,
        backgroundColor: THEME_COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 5,
          left: 10,
          right: 10,
          backgroundColor: THEME_COLORS.white,
          borderRadius: 15,
          height: 60,
          paddingBottom: 5,
          paddingHorizontal: 5,
          ...styles.shadow
        },
        tabBarActiveTintColor: THEME_COLORS.primary,
        tabBarInactiveTintColor: THEME_COLORS.gray,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 0,
        }
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="home" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          tabBarLabel: 'Dịch vụ',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="cut" size={18} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          tabBarLabel: '',
          tabBarLabelStyle: {
            color: THEME_COLORS.primary,
            fontSize: 12,
            marginTop: 8,
          },
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="calendar" size={22} color={THEME_COLORS.white} />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} />
          )
        }}
      />
      <Tab.Screen
        name="History"
        component={AppointmentsScreen}
        options={{
          tabBarLabel: 'Lịch sử cắt',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="clock" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Tài khoản',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user-circle" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: THEME_COLORS.primary,
            },
            headerTintColor: THEME_COLORS.white,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ title: 'Đăng ký' }}
          />
          <Stack.Screen 
            name="Main" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ServiceDetail"
            component={ServiceDetailScreen}
            options={{
              title: 'Chi tiết dịch vụ',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="StylistDetail"
            component={StylistDetailScreen}
            options={{ title: 'Chi tiết stylist' }}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ title: 'Đổi mật khẩu' }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ title: 'Chỉnh sửa thông tin' }}
          />
          <Stack.Screen
            name="Commitment"
            component={CommitmentScreen}
            options={{ title: 'Cam kết dịch vụ' }}
          />
          <Stack.Screen
            name="Stylist"
            component={StylistsScreen}
            options={{ title: 'Đội ngũ Stylist' }}
          />
          <Stack.Screen
            name="SalonLocations"
            component={SalonLocationsScreen}
            options={{ title: 'Địa chỉ Salon' }}
          />
          <Stack.Screen
            name="AppointmentDetail"
            component={AppointmentDetailScreen}
            options={{ title: 'Chi tiết lịch hẹn' }}
          />
          <Stack.Screen 
            name="MonthlyIncome" 
            component={MonthlyIncomeScreen}
            options={{ title: 'Thống kê thu nhập' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: THEME_COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5
  }
}); 