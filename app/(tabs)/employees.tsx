import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/CustomButton';
import { Card } from '@/components/Card';
import { Employee, DailyEarning } from '@/types';
import { getEmployees, setEmployees } from '@/utils/storage';
import { formatCurrency } from '@/utils/calculations';
import { UserPlus, User, Plus, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isTablet = width >= 768;

export default function EmployeesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [employees, setEmployeesState] = useState<Employee[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dailyAmount, setDailyAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    if (user) {
      const userEmployees = await getEmployees(user.id);
      setEmployeesState(userEmployees);
    }
  };

  const addEmployee = async () => {
    if (!newEmployeeName.trim()) {
      Alert.alert('Hata', 'Çalışan adı gereklidir');
      return;
    }

    if (employees.some(emp => emp.name.toLowerCase() === newEmployeeName.toLowerCase())) {
      Alert.alert('Hata', 'Bu isimde bir çalışan zaten mevcut');
      return;
    }

    setIsLoading(true);

    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: newEmployeeName.trim(),
      dailyEarnings: [],
      userId: user!.id,
    };

    const updatedEmployees = [...employees, newEmployee];
    setEmployeesState(updatedEmployees);
    
    if (user) {
      await setEmployees(user.id, updatedEmployees);
    }

    setNewEmployeeName('');
    setIsLoading(false);
    Alert.alert('Başarılı', 'Çalışan eklendi');
  };

  const addEarningToEmployee = async () => {
    if (!selectedEmployee) {
      Alert.alert('Hata', 'Çalışan seçin');
      return;
    }

    if (!dailyAmount.trim() || isNaN(Number(dailyAmount))) {
      Alert.alert('Hata', 'Geçerli bir miktar girin');
      return;
    }

    const amount = Number(dailyAmount);
    if (amount <= 0) {
      Alert.alert('Hata', 'Miktar sıfırdan büyük olmalıdır');
      return;
    }

    const existingEarning = selectedEmployee.dailyEarnings.find(e => e.date === selectedDate);
    if (existingEarning) {
      Alert.alert('Hata', 'Bu tarih için zaten kazanç girişi yapılmış');
      return;
    }

    setIsLoading(true);

    const newEarning: DailyEarning = {
      id: Date.now().toString(),
      date: selectedDate,
      amount,
      employeeId: selectedEmployee.id,
    };

    const updatedEmployees = employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        return {
          ...emp,
          dailyEarnings: [...emp.dailyEarnings, newEarning],
        };
      }
      return emp;
    });

    setEmployeesState(updatedEmployees);
    
    if (user) {
      await setEmployees(user.id, updatedEmployees);
    }

    setDailyAmount('');
    setSelectedEmployee(null);
    setIsLoading(false);
    Alert.alert('Başarılı', 'Günlük kazanç eklendi');
  };

  if (user?.role !== 'company') {
    return (
      <ResponsiveContainer backgroundColor={colors.background}>
        <View style={styles.errorContainer}>
          <Text style={[
            styles.errorText, 
            { 
              color: colors.text,
              fontSize: isSmallScreen ? 14 : 16,
            }
          ]}>
            Bu sayfa yalnızca firma hesapları için kullanılabilir.
          </Text>
        </View>
      </ResponsiveContainer>
    );
  }

  const getTitleFontSize = () => {
    if (isTablet) return 32;
    if (isSmallScreen) return 24;
    return 28;
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
            Çalışan Yönetimi
          </Text>
          <Text style={[
            styles.subtitle, 
            { 
              color: colors.textSecondary,
              fontSize: isSmallScreen ? 14 : 16,
            }
          ]}>
            Çalışanlarınızı ve kazançlarını yönetin
          </Text>
        </View>

        <Card>
          <View style={styles.cardHeader}>
            <UserPlus size={isSmallScreen ? 20 : 24} color={colors.primary} />
            <Text style={[
              styles.cardTitle, 
              { 
                color: colors.text,
                fontSize: isSmallScreen ? 16 : 18,
              }
            ]}>
              Yeni Çalışan Ekle
            </Text>
          </View>

          <CustomInput
            label="Çalışan Adı"
            value={newEmployeeName}
            onChangeText={setNewEmployeeName}
            placeholder="Çalışan adını girin"
          />

          <CustomButton
            title={isLoading ? 'Ekleniyor...' : 'Çalışan Ekle'}
            onPress={addEmployee}
            disabled={isLoading}
            fullWidth
          />
        </Card>

        {employees.length > 0 && (
          <Card>
            <View style={styles.cardHeader}>
              <Plus size={isSmallScreen ? 20 : 24} color={colors.accent} />
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

            <Text style={[
              styles.sectionLabel, 
              { 
                color: colors.text,
                fontSize: isSmallScreen ? 12 : 14,
              }
            ]}>
              Çalışan Seçin
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.employeeSelector}
              contentContainerStyle={styles.employeeSelectorContent}
            >
              {employees.map((employee) => (
                <TouchableOpacity
                  key={employee.id}
                  style={[
                    styles.employeeButton,
                    {
                      backgroundColor: selectedEmployee?.id === employee.id ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setSelectedEmployee(employee)}
                >
                  <Text
                    style={[
                      styles.employeeButtonText,
                      {
                        color: selectedEmployee?.id === employee.id ? '#FFFFFF' : colors.text,
                        fontSize: isSmallScreen ? 12 : 14,
                      },
                    ]}
                  >
                    {employee.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedEmployee && (
              <View style={styles.earningInputs}>
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
                  placeholder="Kazancı girin"
                  keyboardType="numeric"
                />

                <CustomButton
                  title={isLoading ? 'Ekleniyor...' : 'Kazanç Ekle'}
                  onPress={addEarningToEmployee}
                  disabled={isLoading}
                  fullWidth
                />
              </View>
            )}
          </Card>
        )}

        {employees.length > 0 && (
          <Card>
            <View style={styles.cardHeader}>
              <User size={isSmallScreen ? 20 : 24} color={colors.success} />
              <Text style={[
                styles.cardTitle, 
                { 
                  color: colors.text,
                  fontSize: isSmallScreen ? 16 : 18,
                }
              ]}>
                Çalışan Listesi
              </Text>
            </View>

            {employees.map((employee) => {
              const totalEarnings = employee.dailyEarnings.reduce((sum, earning) => sum + earning.amount, 0);
              return (
                <View key={employee.id} style={styles.employeeItem}>
                  <View style={styles.employeeInfo}>
                    <Text style={[
                      styles.employeeName, 
                      { 
                        color: colors.text,
                        fontSize: isSmallScreen ? 14 : 16,
                      }
                    ]}>
                      {employee.name}
                    </Text>
                    <Text style={[
                      styles.employeeStats, 
                      { 
                        color: colors.textSecondary,
                        fontSize: isSmallScreen ? 12 : 14,
                      }
                    ]}>
                      {employee.dailyEarnings.length} gün çalıştı
                    </Text>
                  </View>
                  <Text style={[
                    styles.employeeEarnings, 
                    { 
                      color: colors.accent,
                      fontSize: isSmallScreen ? 14 : 16,
                    }
                  ]}>
                    {formatCurrency(totalEarnings)}
                  </Text>
                </View>
              );
            })}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
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
  sectionLabel: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 8,
  },
  employeeSelector: {
    marginBottom: 16,
  },
  employeeSelectorContent: {
    paddingRight: 16,
  },
  employeeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  employeeButtonText: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
  },
  earningInputs: {
    marginTop: 16,
  },
  employeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    minHeight: 60,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  employeeStats: {
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  employeeEarnings: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    textAlign: 'right',
  },
});