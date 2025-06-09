import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
}

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isTablet = width >= 768;

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  padding = true 
}) => {
  const { colors } = useTheme();

  const getCardPadding = () => {
    if (isTablet) return 24;
    if (isSmallScreen) return 16;
    return 20;
  };

  const getMarginBottom = () => {
    if (isSmallScreen) return 12;
    return 16;
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          shadowColor: colors.text,
          marginBottom: getMarginBottom(),
        },
        padding && { padding: getCardPadding() },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});