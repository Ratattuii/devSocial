import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const theme = {
  colors: {
    primary: '#667eea',
    primaryLight: '#764ba2',
    primaryDark: '#4c63d2',
    
    secondary: '#f093fb',
    secondaryLight: '#f5576c',
    secondaryDark: '#e91e63',
    
    accent: '#ff6b6b',
    accentLight: '#ff8e8e',
    accentDark: '#ff5252',
    
    background: '#0a0a0a',
    surface: '#1a1a1a',
    surfaceVariant: '#2a2a2a',
    
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      tertiary: '#808080',
      inverse: '#000000',
    },
    
    success: '#00d4aa',
    warning: '#ffa726',
    error: '#ff5252',
    info: '#2196f3',
    
    border: '#333333',
    borderLight: '#404040',
    
    gradients: {
      primary: ['#667eea', '#764ba2'],
      secondary: ['#f093fb', '#f5576c'],
      accent: ['#ff6b6b', '#ffa726'],
      surface: ['#1a1a1a', '#2a2a2a'],
      dark: ['#0a0a0a', '#1a1a1a'],
      glass: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  borderRadius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    round: 50,
    full: 9999,
  },
  
  typography: {
    h1: {
      fontSize: 36,
      fontWeight: '800',
      lineHeight: 44,
      letterSpacing: -1,
    },
    h2: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
      letterSpacing: -0.8,
    },
    h3: {
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 36,
      letterSpacing: -0.6,
    },
    h4: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
      letterSpacing: -0.4,
    },
    h5: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
      letterSpacing: -0.2,
    },
    h6: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
      letterSpacing: 0.5,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 18,
      letterSpacing: 0.3,
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 12,
    },
    extraLarge: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.6,
      shadowRadius: 32,
      elevation: 16,
    },
    glow: {
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
  },
  
  dimensions: {
    screenWidth,
    screenHeight,
  },
};

export default theme;
