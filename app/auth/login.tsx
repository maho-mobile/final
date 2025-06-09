import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/CustomButton';
import { Card } from '@/components/Card';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isTablet = width >= 768;

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Kullanıcı adı gereklidir';
    }
    if (!password.trim()) {
      newErrors.password = 'Şifre gereklidir';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Hata', result.error || 'Giriş yapılamadı');
    }
  };

  const getTitleFontSize = () => {
    if (isTablet) return 36;
    if (isSmallScreen) return 28;
    return 32;
  };

  return (
    <ResponsiveContainer backgroundColor={colors.background}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[
            styles.title, 
            { 
              color: colors.text,
              fontSize: getTitleFontSize(),
            }
          ]}>
            Maaş Hesaplayıcı
          </Text>
          <Text style={[
            styles.subtitle, 
            { 
              color: colors.textSecondary,
              fontSize: isSmallScreen ? 14 : 16,
            }
          ]}>
            Hesabınıza giriş yapın
          </Text>
        </View>

        <Card>
          <CustomInput
            label="Kullanıcı Adı"
            value={username}
            onChangeText={setUsername}
            error={errors.username}
            placeholder="Kullanıcı adınızı girin"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <CustomInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            placeholder="Şifrenizi girin"
            secureTextEntry
          />

          <CustomButton
            title={isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.loginButton}
            fullWidth
          />

          <View style={styles.linkContainer}>
            <Text style={[
              styles.linkText, 
              { 
                color: colors.textSecondary,
                fontSize: isSmallScreen ? 12 : 14,
              }
            ]}>
              Hesabınız yok mu?{' '}
            </Text>
            <Link 
              href="/auth/register" 
              style={[
                styles.link, 
                { 
                  color: colors.primary,
                  fontSize: isSmallScreen ? 12 : 14,
                }
              ]}
            >
              Kayıt ol
            </Link>
          </View>
        </Card>
      </ScrollView>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  linkText: {
    fontFamily: 'Inter-Regular',
  },
  link: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
});