// src/components/LoadingSpinner.js

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

const LoadingSpinner = ({ message = 'Carregando...', size = 'medium' }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 48;
      default: return 32;
    }
  };

  const getMessageStyle = () => {
    switch (size) {
      case 'small': return styles.messageSmall;
      case 'large': return styles.messageLarge;
      default: return styles.messageMedium;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinnerContainer,
          {
            transform: [
              { rotate: spin },
              { scale: pulseValue }
            ],
            width: getSize(),
            height: getSize(),
          }
        ]}
      >
        <Ionicons 
          name="refresh" 
          size={getSize()} 
          color={theme.colors.primary} 
        />
      </Animated.View>
      
      {message && (
        <Animated.Text style={[getMessageStyle(), { opacity: pulseValue }]}>
          {message}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  messageSmall: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  
  messageMedium: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  
  messageLarge: {
    ...theme.typography.h6,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
