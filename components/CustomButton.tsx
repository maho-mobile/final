import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isTablet = width >= 768;

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
      minHeight: 44, // Minimum touch target
    };

    const sizeStyles = {
      small: { 
        paddingHorizontal: isSmallScreen ? 12 : 16, 
        paddingVertical: isSmallScreen ? 6 : 8,
        minHeight: 36,
      },
      medium: { 
        paddingHorizontal: isSmallScreen ? 16 : 20, 
        paddingVertical: isSmallScreen ? 10 : 12,
        minHeight: 44,
      },
      large: { 
        paddingHorizontal: isSmallScreen ? 20 : 24, 
        paddingVertical: isSmallScreen ? 14 : 16,
        minHeight: 52,
      },
    };

    const variantStyles = {
      primary: { backgroundColor: colors.primary },
      secondary: { backgroundColor: colors.accent },
      outline: { 
        backgroundColor: 'transparent', 
        borderWidth: 2, 
        borderColor: colors.primary 
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontFamily: 'Inter-Medium',
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeStyles = {
      small: { fontSize: isSmallScreen ? 12 : 14 },
      medium: { fontSize: isSmallScreen ? 14 : 16 },
      large: { fontSize: isSmallScreen ? 16 : 18 },
    };

    const variantStyles = {
      primary: { color: '#FFFFFF' },
      secondary: { color: '#FFFFFF' },
      outline: { color: colors.primary },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};