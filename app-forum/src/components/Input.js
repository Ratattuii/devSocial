

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedValue = new Animated.Value(value ? 1 : 0);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: theme.animations.duration.fast,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: theme.animations.duration.fast,
        useNativeDriver: false,
      }).start();
    }
  };

  const animatedLabelStyle = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -24],
        }),
      },
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.85],
        }),
      },
    ],
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.text.secondary, theme.colors.primary],
    }),
  };

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return 'transparent';
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.Text style={[styles.label, animatedLabelStyle]}>
        {label}
      </Animated.Text>
      
      <View style={[
        styles.inputContainer,
        { borderColor: getBorderColor() },
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        disabled && styles.inputContainerDisabled
      ]}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            disabled && styles.inputDisabled
          ]}
          placeholder={isFocused ? placeholder : ''}
          placeholderTextColor={theme.colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...props}
        />
        
        {secureTextEntry && (
          <Animated.View style={styles.passwordToggle}>
            <Animated.View
              style={[
                styles.passwordIcon,
                { opacity: showPassword ? 1 : 0.5 }
              ]}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.colors.text.secondary}
                onPress={() => setShowPassword(!showPassword)}
              />
            </Animated.View>
          </Animated.View>
        )}
        
        {error && (
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
          </View>
        )}
      </View>
      
      {error && (
        <Animated.Text style={styles.errorText}>
          {error}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  
  label: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    position: 'absolute',
    top: 20,
    left: theme.spacing.md,
    zIndex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xs,
  },
  
  inputContainer: {
    borderWidth: 2,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.medium,
    borderColor: 'transparent',
  },
  
  inputContainerFocused: {
    ...theme.shadows.large,
    borderWidth: 2,
    ...theme.shadows.glow,
  },
  
  inputContainerError: {
    borderColor: theme.colors.error,
    ...theme.shadows.glow,
  },
  
  inputContainerDisabled: {
    backgroundColor: theme.colors.surfaceVariant,
    opacity: 0.6,
  },
  
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  
  inputDisabled: {
    color: theme.colors.text.tertiary,
  },
  
  passwordToggle: {
    paddingHorizontal: theme.spacing.sm,
  },
  
  passwordIcon: {
    padding: theme.spacing.xs,
  },
  
  errorIcon: {
    paddingHorizontal: theme.spacing.sm,
  },
  
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});

export default Input;
