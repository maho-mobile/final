import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375 || height < 667;
const isTablet = width >= 768;

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  backgroundColor = '#FFFFFF',
}) => {
  const getContainerPadding = () => {
    if (isTablet) return 40;
    if (isSmallScreen) return 12;
    return 20;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.content, { paddingHorizontal: getContainerPadding() }]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
});