

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

const LoadingSpinner = ({ message = 'Carregando...', size = 'medium' }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const glowValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(glowValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();
    glowAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const getSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 64;
      default: return 48;
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
        <LinearGradient
          colors={theme.colors.gradients.primary}
          style={[
            styles.spinnerGradient,
            {
              width: getSize(),
              height: getSize(),
              borderRadius: getSize() / 2,
            }
          ]}
        >
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: glowOpacity,
                width: getSize() + 20,
                height: getSize() + 20,
                borderRadius: (getSize() + 20) / 2,
              }
            ]}
          />
          <Ionicons 
            name="infinite" 
            size={getSize() * 0.6} 
            color={theme.colors.text.primary} 
          />
        </LinearGradient>
      </Animated.View>
      
      {message && (
        <Animated.Text 
          style={[
            getMessageStyle(), 
            { 
              opacity: pulseValue,
              transform: [{ scale: pulseValue }]
            }
          ]}
        >
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
    backgroundColor: theme.colors.background,
  },
  
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  spinnerGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
  },
  
  glowEffect: {
    position: 'absolute',
    backgroundColor: theme.colors.primary,
    ...theme.shadows.glow,
  },
  
  messageSmall: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  messageMedium: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  messageLarge: {
    ...theme.typography.h6,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoadingSpinner;
