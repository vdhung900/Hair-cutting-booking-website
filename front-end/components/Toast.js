import React, { useEffect } from 'react';
import { Animated, Text, StyleSheet, View, Platform } from 'react-native';
import { THEME_COLORS } from '../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';

const Toast = ({ visible, message, type = 'success', onHide }) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.delay(2000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible]);

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          icon: 'check-circle'
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          icon: 'times-circle'
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          icon: 'exclamation-circle'
        };
      default:
        return {
          backgroundColor: '#2196F3',
          icon: 'info-circle'
        };
    }
  };

  const toastStyle = getToastStyle();

  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity, backgroundColor: toastStyle.backgroundColor }
      ]}
    >
      <FontAwesome5 name={toastStyle.icon} size={20} color="white" />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
    textAlign: 'center',
  },
});

export default Toast; 