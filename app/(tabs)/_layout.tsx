import { Tabs } from 'expo-router';
import { Platform, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Chrome as Home, Building2, Settings, ChartBar as BarChart3 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375 || height < 667;
const isTablet = width >= 768;

export default function TabLayout() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const getTabBarHeight = () => {
    if (Platform.OS === 'ios') {
      return isSmallScreen ? 75 : 85;
    }
    return isSmallScreen ? 55 : 65;
  };

  const getPaddingBottom = () => {
    if (Platform.OS === 'ios') {
      return isSmallScreen ? 15 : 25;
    }
    return 5;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: getTabBarHeight(),
          paddingBottom: getPaddingBottom(),
          paddingTop: 5,
          paddingHorizontal: isTablet ? 20 : 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: isSmallScreen ? 10 : 12,
          fontFamily: 'Inter-Medium',
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ size, color }) => (
            <Home size={isSmallScreen ? 20 : size} color={color} />
          ),
        }}
      />
      {user?.role === 'company' && (
        <Tabs.Screen
          name="employees"
          options={{
            title: 'Çalışanlar',
            tabBarIcon: ({ size, color }) => (
              <Building2 size={isSmallScreen ? 20 : size} color={color} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="results"
        options={{
          title: 'Sonuçlar',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={isSmallScreen ? 20 : size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ size, color }) => (
            <Settings size={isSmallScreen ? 20 : size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}