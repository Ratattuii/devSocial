

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (variant === 'primary') {
      baseStyle.push(styles.primary);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondary);
    } else if (variant === 'outline') {
      baseStyle.push(styles.outline);
    } else if (variant === 'danger') {
      baseStyle.push(styles.danger);
    } else if (variant === 'glass') {
      baseStyle.push(styles.glass);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`${size}Text`]];
    
    if (variant === 'outline') {
      baseTextStyle.push(styles.outlineText);
    } else if (variant === 'glass') {
      baseTextStyle.push(styles.glassText);
    }
    
    if (disabled) {
      baseTextStyle.push(styles.disabledText);
    }
    
    return baseTextStyle;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? theme.colors.primary : theme.colors.text.primary} 
        />
      );
    }
    
    return (
      <Text style={[getTextStyle(), textStyle]}>
        {title}
      </Text>
    );
  };

  const getGradientColors = () => {
    if (variant === 'primary') return theme.colors.gradients.primary;
    if (variant === 'secondary') return theme.colors.gradients.secondary;
    if (variant === 'danger') return theme.colors.gradients.accent;
    return theme.colors.gradients.primary;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {(variant === 'primary' || variant === 'secondary' || variant === 'danger') && !disabled ? (
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        renderContent()
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  
  gradient: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  
  primary: {
    backgroundColor: theme.colors.primary,
  },
  
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  
  danger: {
    backgroundColor: theme.colors.error,
  },
  
  glass: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
  },
  
  small: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 40,
  },
  
  medium: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 52,
  },
  
  large: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 60,
  },
  
  disabled: {
    backgroundColor: theme.colors.text.tertiary,
    borderColor: theme.colors.text.tertiary,
    opacity: 0.5,
  },
  
  text: {
    ...theme.typography.button,
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  outlineText: {
    color: theme.colors.primary,
  },
  
  glassText: {
    color: theme.colors.text.primary,
  },
  
  disabledText: {
    color: theme.colors.text.tertiary,
  },
  
  smallText: {
    ...theme.typography.buttonSmall,
  },
  
  mediumText: {
    ...theme.typography.button,
  },
  
  largeText: {
    ...theme.typography.h6,
  },
});

export default Button;
