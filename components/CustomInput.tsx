import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
}

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getInputPadding = () => {
    if (isSmallScreen) return { paddingHorizontal: 12, paddingVertical: 10 };
    return { paddingHorizontal: 16, paddingVertical: 12 };
  };

  const getFontSize = () => {
    return isSmallScreen ? 14 : 16;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[
          styles.label, 
          { 
            color: colors.text,
            fontSize: isSmallScreen ? 12 : 14,
          }
        ]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
            color: colors.text,
            fontSize: getFontSize(),
            minHeight: 44, // Minimum touch target
            ...getInputPadding(),
          },
          style,
        ]}
        placeholderTextColor={colors.textSecondary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && (
        <Text style={[
          styles.error, 
          { 
            color: colors.error,
            fontSize: isSmallScreen ? 10 : 12,
          }
        ]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    fontFamily: 'Inter-Regular',
  },
  error: {
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
});