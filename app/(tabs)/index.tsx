import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/CustomButton';
import { Card } from '@/components/Card';
import { DailyEarning } from '@/types';
import { getIndividualEarnings, setIndividualEarnings } from '@/utils/storage';
import { formatCurrency } from '@/utils/calculations';
import { Plus, Calendar, TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isTablet = width >= 768;

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<DailyEarning[]>([]);
  const [dailyAmount, setDailyAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    if (user) {
      const userEarnings = await getIndividualEarnings(user.id);
      setEarnings(userEarnings);
    }
  };

  const addEarning = async () => {
    if (!dailyAmount.trim() || isNaN(Number(dailyAmount))) {
      Alert.alert('Hata', 'Geçerli bir miktar girin');
      return;
    }

    const amount = Number(dailyAmount);
    if (amount <= 0) {
      Alert.alert('Hata', 'Miktar sıfırdan büyük olmalıdır');
      return;
    }

    const existingEarning = earnings.find(e => e.date === selectedDate);
    if (existingEarning) {
      Alert.alert('Hata', 'Bu tarih için zaten kazanç girişi yapılmış');
      return;
    }

    setIsLoading(true);

    const newEarning: DailyEarning = {
      id: Date.now().toString(),
      date: selectedDate,
      amount,
    };

    const updatedEarnings = [...earnings, newEarning];
    setEarnings(updatedEarnings);
    
    if (user) {
      await setIndividualEarnings(user.id, updatedEarnings);
    }

    setDailyAmount('');
    setIsLoading(false);
    Alert.alert('Başarılı', 'Günlük kazanç eklendi');
  };

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);

  const getTitleFontSize = () => {
    if (isTablet) return 32;
    if (isSmallScreen) return 24;
    return 28;
  };

  const getSubtitleFontSize = () => {
    if (isSmallScreen) return 14;
    return 16;
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
            Merhaba, {user?.firstName}!
          </Text>
          <Text style={[
            styles.subtitle, 
            { 
              color: colors.textSecondary,
              fontSize: getSubtitleFontSize(),
            }
          ]}>
            {user?.role === 'individual' ? 'Bireysel Hesap' : 'Firma Hesabı'}
          </Text>
        </View>

        {user?.role === 'individual' && (
          <>
            <Card>
              <View style={styles.cardHeader}>
                <Plus size={isSmallScreen ? 20 : 24} color={colors.primary} />
                <Text style={[
                  styles.cardTitle, 
                  { 
                    color: colors.text,
                    fontSize: isSmallScreen ? 16 : 18,
                  }
                ]}>
                  Günlük Kazanç Ekle
                </Text>
              </View>

              <CustomInput
                label="Tarih"
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
              />

              <CustomInput
                label="Günlük Kazanç (₺)"
                value={dailyAmount}
                onChangeText={setDailyAmount}
                placeholder="Kazancınızı girin"
                keyboardType="numeric"
              />

              <CustomButton
                title={isLoading ? 'Ekleniyor...' : 'Kazanç Ekle'}
                onPress={addEarning}
                disabled={isLoading}
                fullWidth
              />
            </Card>

            <Card>
              <View style={styles.cardHeader}>
                <TrendingUp size={isSmallScreen ? 20 : 24} color={colors.accent} />
                <Text style={[
                  styles.cardTitle, 
                  { 
                    color: colors.text,
                    fontSize: isSmallScreen ? 16 : 18,
                  }
                ]}>
                  Özet
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[
                  styles.summaryLabel, 
                  { 
                    color: colors.textSecondary,
                    fontSize: isSmallScreen ? 14 : 16,
                  }
                ]}>
                  Toplam Gün:
                </Text>
                <Text style={[
                  styles.summaryValue, 
                  { 
                    color: colors.text,
                    fontSize: isSmallScreen ? 14 : 16,
                  }
                ]}>
                  {earnings.length}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[
                  styles.summaryLabel, 
                  { 
                    color: colors.textSecondary,
                    fontSize: isSmallScreen ? 14 : 16,
                  }
                ]}>
                  Toplam Kazanç:
                </Text>
                <Text style={[
                  styles.summaryValue, 
                  { 
                    color: colors.accent,
                    fontSize: isSmallScreen ? 14 : 16,
                  }
                ]}>
                  {formatCurrency(totalEarnings)}
                </Text>
              </View>
            </Card>

            {earnings.length > 0 && (
              <Card>
                <View style={styles.cardHeader}>
                  <Calendar size={isSmallScreen ? 20 : 24} color={colors.success} />
                  <Text style={[
                    styles.cardTitle, 
                    { 
                      color: colors.text,
                      fontSize: isSmallScreen ? 16 : 18,
                    }
                  ]}>
                    Son Kazançlar
                  </Text>
                </View>
                
                {earnings
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((earning) => (
                    <View key={earning.id} style={styles.earningItem}>
                      <Text style={[
                        styles.earningDate, 
                        { 
                          color: colors.textSecondary,
                          fontSize: isSmallScreen ? 12 : 14,
                        }
                      ]}>
                        {new Date(earning.date).toLocaleDateString('tr-TR')}
                      </Text>
                      <Text style={[
                        styles.earningAmount, 
                        { 
                          color: colors.text,
                          fontSize: isSmallScreen ? 14 : 16,
                        }
                      ]}>
                        {formatCurrency(earning.amount)}
                      </Text>
                    </View>
                  ))
                }
              </Card>
            )}
          </>
        )}

        {user?.role === 'company' && (
          <Card>
            <View style={styles.cardHeader}>
              <Building2 size={isSmallScreen ? 20 : 24} color={colors.primary} />
              <Text style={[
                styles.cardTitle, 
                { 
                  color: colors.text,
                  fontSize: isSmallScreen ? 16 : 18,
                }
              ]}>
                Firma Paneli
              </Text>
            </View>
            <Text style={[
              styles.companyInfo, 
              { 
                color: colors.textSecondary,
                fontSize: isSmallScreen ? 14 : 16,
              }
            ]}>
              Çalışanlarınızı yönetmek için "Çalışanlar" sekmesini kullanın.
              Maaş hesaplamalarını görmek için "Sonuçlar" sekmesine göz atın.
            </Text>
          </Card>
        )}
      </ScrollView>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  earningItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  earningDate: {
    fontFamily: 'Inter-Regular',
  },
  earningAmount: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  companyInfo: {
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    textAlign: 'center',
  },
});