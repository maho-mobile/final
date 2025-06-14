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

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    role: 'individual' as 'company' | 'individual',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı gereklidir';
    }
    if (formData.password.length < 4) {
      newErrors.password = 'Şifre en az 4 karakter olmalıdır';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    const result = await register(formData);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Hata', result.error || 'Kayıt oluşturulamadı');
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
            Hesap Oluştur
          </Text>
          <Text style={[
            styles.subtitle, 
            { 
              color: colors.textSecondary,
              fontSize: isSmallScreen ? 14 : 16,
            }
          ]}>
            Yeni hesabınızı kayıt edin
          </Text>
        </View>

        <Card>
          <CustomInput
            label="Ad"
            value={formData.firstName}
            onChangeText={(value) => updateFormData('firstName', value)}
            error={errors.firstName}
            placeholder="Adınızı girin"
          />

          <CustomInput
            label="Soyad"
            value={formData.lastName}
            onChangeText={(value) => updateFormData('lastName', value)}
            error={errors.lastName}
            placeholder="Soyadınızı girin"
          />

          <CustomInput
            label="Kullanıcı Adı"
            value={formData.username}
            onChangeText={(value) => updateFormData('username', value)}
            error={errors.username}
            placeholder="Kullanıcı adınızı girin"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <CustomInput
            label="Şifre"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            error={errors.password}
            placeholder="Şifrenizi girin (en az 4 karakter)"
            secureTextEntry
          />

          <View style={styles.roleContainer}>
            <Text style={[
              styles.roleLabel, 
              { 
                color: colors.text,
                fontSize: isSmallScreen ? 12 : 14,
              }
            ]}>
              Hesap Türü
            </Text>
            <View style={styles.roleButtons}>
              <CustomButton
                title="Bireysel"
                onPress={() => updateFormData('role', 'individual')}
                variant={formData.role === 'individual' ? 'primary' : 'outline'}
                size="small"
                style={styles.roleButton}
              />
              <CustomButton
                title="Firma"
                onPress={() => updateFormData('role', 'company')}
                variant={formData.role === 'company' ? 'primary' : 'outline'}
                size="small"
                style={styles.roleButton}
              />
            </View>
          </View>

          <CustomButton
            title={isLoading ? 'Kayıt Oluşturuluyor...' : 'Kayıt Ol'}
            onPress={handleRegister}
            disabled={isLoading}
            style={styles.registerButton}
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
              Zaten hesabınız var mı?{' '}
            </Text>
            <Link 
              href="/auth/login" 
              style={[
                styles.link, 
                { 
                  color: colors.primary,
                  fontSize: isSmallScreen ? 12 : 14,
                }
              ]}
            >
              Giriş yap
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
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
  },
  registerButton: {
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