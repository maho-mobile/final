import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { Card } from '@/components/Card';
import { Employee, DailyEarning, TaxRates, SalaryCalculation } from '@/types';
import { getEmployees, getIndividualEarnings, getTaxRates } from '@/utils/storage';
import { calculateSalary, formatCurrency, formatNumber } from '@/utils/calculations';
import { ChartBar as BarChart3, DollarSign, TrendingUp, Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isTablet = width >= 768;

export default function ResultsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [individualEarnings, setIndividualEarnings] = useState<DailyEarning[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRates>({ tax: 10, retirement: 10, insurance: 5 });
  const [calculations, setCalculations] = useState<{ [key: string]: SalaryCalculation }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    const rates = await getTaxRates();
    setTaxRates(rates);

    if (user.role === 'company') {
      const userEmployees = await getEmployees(user.id);
      setEmployees(userEmployees);
      
      const employeeCalculations: { [key: string]: SalaryCalculation } = {};
      userEmployees.forEach(employee => {
        employeeCalculations[employee.id] = calculateSalary(employee.dailyEarnings, rates);
      });
      setCalculations(employeeCalculations);
    } else {
      const earnings = await getIndividualEarnings(user.id);
      setIndividualEarnings(earnings);
      
      const individualCalculation = calculateSalary(earnings, rates);
      setCalculations({ individual: individualCalculation });
    }
  };

  const getTotalCalculations = (): SalaryCalculation => {
    if (user?.role === 'individual') {
      return calculations.individual || {
        grossSalary: 0,
        taxDeduction: 0,
        retirementDeduction: 0,
        insuranceDeduction: 0,
        totalDeductions: 0,
        netSalary: 0,
        workingDays: 0,
      };
    }

    const totals = Object.values(calculations).reduce((acc, calc) => ({
      grossSalary: acc.grossSalary + calc.grossSalary,
      taxDeduction: acc.taxDeduction + calc.taxDeduction,
      retirementDeduction: acc.retirementDeduction + calc.retirementDeduction,
      insuranceDeduction: acc.insuranceDeduction + calc.insuranceDeduction,
      totalDeductions: acc.totalDeductions + calc.totalDeductions,
      netSalary: acc.netSalary + calc.netSalary,
      workingDays: acc.workingDays + calc.workingDays,
    }), {
      grossSalary: 0,
      taxDeduction: 0,
      retirementDeduction: 0,
      insuranceDeduction: 0,
      totalDeductions: 0,
      netSalary: 0,
      workingDays: 0,
    });

    return totals;
  };

  const totalCalcs = getTotalCalculations();

  const getTitleFontSize = () => {
    if (isTablet) return 32;
    if (isSmallScreen) return 24;
    return 28;
  };

  const getSummaryItemWidth = () => {
    if (isTablet) return '23%';
    if (isSmallScreen) return '48%';
    return '45%';
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
            Maaş Hesaplamaları
          </Text>
          <Text style={[
            styles.subtitle, 
            { 
              color: colors.textSecondary,
              fontSize: isSmallScreen ? 14 : 16,
            }
          ]}>
            Detaylı maaş raporları
          </Text>
        </View>

        <Card>
          <View style={styles.cardHeader}>
            <BarChart3 size={isSmallScreen ? 20 : 24} color={colors.primary} />
            <Text style={[
              styles.cardTitle, 
              { 
                color: colors.text,
                fontSize: isSmallScreen ? 16 : 18,
              }
            ]}>
              Genel Özet
            </Text>
          </View>

          <View style={styles.summaryGrid}>
            <View style={[
              styles.summaryItem, 
              { 
                width: getSummaryItemWidth(),
                backgroundColor: `${colors.primary}15`,
              }
            ]}>
              <Users size={isSmallScreen ? 16 : 20} color={colors.accent} />
              <Text style={[
                styles.summaryLabel, 
                { 
                  color: colors.textSecondary,
                  fontSize: isSmallScreen ? 10 : 12,
                }
              ]}>
                {user?.role === 'individual' ? 'Çalışılan Gün' : 'Toplam Gün'}
              </Text>
              <Text style={[
                styles.summaryValue, 
                { 
                  color: colors.text,
                  fontSize: isSmallScreen ? 14 : 16,
                }
              ]}>
                {formatNumber(totalCalcs.workingDays)}
              </Text>
            </View>

            <View style={[
              styles.summaryItem, 
              { 
                width: getSummaryItemWidth(),
                backgroundColor: `${colors.success}15`,
              }
            ]}>
              <DollarSign size={isSmallScreen ? 16 : 20} color={colors.success} />
              <Text style={[
                styles.summaryLabel, 
                { 
                  color: colors.textSecondary,
                  fontSize: isSmallScreen ? 10 : 12,
                }
              ]}>
                Brüt Maaş
              </Text>
              <Text style={[
                styles.summaryValue, 
                { 
                  color: colors.text,
                  fontSize: isSmallScreen ? 14 : 16,
                }
              ]}>
                {formatCurrency(totalCalcs.grossSalary)}
              </Text>
            </View>

            <View style={[
              styles.summaryItem, 
              { 
                width: getSummaryItemWidth(),
                backgroundColor: `${colors.error}15`,
              }
            ]}>
              <TrendingUp size={isSmallScreen ? 16 : 20} color={colors.error} />
              <Text style={[
                styles.summaryLabel, 
                { 
                  color: colors.textSecondary,
                  fontSize: isSmallScreen ? 10 : 12,
                }
              ]}>
                Toplam Kesinti
              </Text>
              <Text style={[
                styles.summaryValue, 
                { 
                  color: colors.text,
                  fontSize: isSmallScreen ? 14 : 16,
                }
              ]}>
                {formatCurrency(totalCalcs.totalDeductions)}
              </Text>
            </View>

            <View style={[
              styles.summaryItem, 
              { 
                width: getSummaryItemWidth(),
                backgroundColor: `${colors.accent}15`,
              }
            ]}>
              <BarChart3 size={isSmallScreen ? 16 : 20} color={colors.primary} />
              <Text style={[
                styles.summaryLabel, 
                { 
                  color: colors.textSecondary,
                  fontSize: isSmallScreen ? 10 : 12,
                }
              ]}>
                Net Maaş
              </Text>
              <Text style={[
                styles.summaryValue, 
                { 
                  color: colors.accent,
                  fontSize: isSmallScreen ? 14 : 16,
                }
              ]}>
                {formatCurrency(totalCalcs.netSalary)}
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={[
            styles.cardTitle, 
            { 
              color: colors.text,
              fontSize: isSmallScreen ? 16 : 18,
            }
          ]}>
            Kesinti Detayları
          </Text>
          
          <View style={styles.deductionItem}>
            <Text style={[
              styles.deductionLabel, 
              { 
                color: colors.textSecondary,
                fontSize: isSmallScreen ? 14 : 16,
              }
            ]}>
              Vergi ({taxRates.tax}%):
            </Text>
            <Text style={[
              styles.deductionValue, 
              { 
                color: colors.text,
                fontSize: isSmallScreen ? 14 : 16,
              }
            ]}>
              {formatCurrency(totalCalcs.taxDeduction)}
            </Text>
          </View>

          <View style={styles.deductionItem}>
            <Text style={[
              styles.deductionLabel, 
              { 
                color: colors.textSecondary,
                fontSize: isSmallScreen ? 14 : 16,
              }
            ]}>
              Emeklilik ({taxRates.retirement}%):
            </Text>
            <Text style={[
              styles.deductionValue, 
              { 
                color: colors.text,
                fontSize: isSmallScreen ? 14 : 16,
              }
            ]}>
              {formatCurrency(totalCalcs.retirementDeduction)}
            </Text>
          </View>

          <View style={styles.deductionItem}>
            <Text style={[
              styles.deductionLabel, 
              { 
                color: colors.textSecondary,
                fontSize: isSmallScreen ? 14 : 16,
              }
            ]}>
              Sigorta ({taxRates.insurance}%):
            </Text>
            <Text style={[
              styles.deductionValue, 
              { 
                color: colors.text,
                fontSize: isSmallScreen ? 14 : 16,
              }
            ]}>
              {formatCurrency(totalCalcs.insuranceDeduction)}
            </Text>
          </View>

          <View style={[styles.deductionItem, styles.totalDeduction]}>
            <Text style={[
              styles.deductionLabel, 
              { 
                color: colors.text, 
                fontWeight: '600',
                fontSize: isSmallScreen ? 14 : 16,
              }
            ]}>
              Toplam Kesinti:
            </Text>
            <Text style={[
              styles.deductionValue, 
              { 
                color: colors.error, 
                fontWeight: '700',
                fontSize: isSmallScreen ? 14 : 16,
              }
            ]}>
              {formatCurrency(totalCalcs.totalDeductions)}
            </Text>
          </View>
        </Card>

        {user?.role === 'company' && employees.length > 0 && (
          <Card>
            <Text style={[
              styles.cardTitle, 
              { 
                color: colors.text,
                fontSize: isSmallScreen ? 16 : 18,
              }
            ]}>
              Çalışan Detayları
            </Text>
            
            {employees.map((employee) => {
              const calc = calculations[employee.id];
              if (!calc) return null;

              return (
                <View key={employee.id} style={styles.employeeDetail}>
                  <Text style={[
                    styles.employeeName, 
                    { 
                      color: colors.text,
                      fontSize: isSmallScreen ? 16 : 18,
                    }
                  ]}>
                    {employee.name}
                  </Text>
                  
                  <View style={styles.employeeRow}>
                    <Text style={[
                      styles.employeeLabel, 
                      { 
                        color: colors.textSecondary,
                        fontSize: isSmallScreen ? 12 : 14,
                      }
                    ]}>
                      Çalışılan Gün:
                    </Text>
                    <Text style={[
                      styles.employeeValue, 
                      { 
                        color: colors.text,
                        fontSize: isSmallScreen ? 12 : 14,
                      }
                    ]}>
                      {calc.workingDays}
                    </Text>
                  </View>

                  <View style={styles.employeeRow}>
                    <Text style={[
                      styles.employeeLabel, 
                      { 
                        color: colors.textSecondary,
                        fontSize: isSmallScreen ? 12 : 14,
                      }
                    ]}>
                      Brüt Maaş:
                    </Text>
                    <Text style={[
                      styles.employeeValue, 
                      { 
                        color: colors.text,
                        fontSize: isSmallScreen ? 12 : 14,
                      }
                    ]}>
                      {formatCurrency(calc.grossSalary)}
                    </Text>
                  </View>

                  <View style={styles.employeeRow}>
                    <Text style={[
                      styles.employeeLabel, 
                      { 
                        color: colors.textSecondary,
                        fontSize: isSmallScreen ? 12 : 14,
                      }
                    ]}>
                      Toplam Kesinti:
                    </Text>
                    <Text style={[
                      styles.employeeValue, 
                      { 
                        color: colors.error,
                        fontSize: isSmallScreen ? 12 : 14,
                      }
                    ]}>
                      {formatCurrency(calc.totalDeductions)}
                    </Text>
                  </View>

                  <View style={styles.employeeRow}>
                    <Text style={[
                      styles.employeeLabel, 
                      { 
                        color: colors.text, 
                        fontWeight: '600',
                        fontSize: isSmallScreen ? 12 : 14,
                      }
                    ]}>
                      Net Maaş:
                    </Text>
                    <Text style={[
                      styles.employeeValue, 
                      { 
                        color: colors.accent, 
                        fontWeight: '700',
                        fontSize: isSmallScreen ? 12 : 14,
                      }
                    ]}>
                      {formatCurrency(calc.netSalary)}
                    </Text>
                  </View>
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
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minHeight: 100,
    justifyContent: 'center',
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  deductionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 44,
  },
  deductionLabel: {
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  deductionValue: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    textAlign: 'right',
  },
  totalDeduction: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    marginTop: 8,
    paddingTop: 16,
  },
  employeeDetail: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  employeeName: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginBottom: 8,
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    minHeight: 32,
  },
  employeeLabel: {
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  employeeValue: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'right',
  },
});