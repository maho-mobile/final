import { TaxRates, SalaryCalculation, DailyEarning } from '@/types';

export const calculateSalary = (
  dailyEarnings: DailyEarning[],
  taxRates: TaxRates
): SalaryCalculation => {
  // Validate inputs
  if (!dailyEarnings || dailyEarnings.length === 0) {
    return {
      grossSalary: 0,
      taxDeduction: 0,
      retirementDeduction: 0,
      insuranceDeduction: 0,
      totalDeductions: 0,
      netSalary: 0,
      workingDays: 0,
    };
  }

  // Validate tax rates
  const validatedTaxRates = {
    tax: Math.max(0, Math.min(100, taxRates.tax || 0)),
    retirement: Math.max(0, Math.min(100, taxRates.retirement || 0)),
    insurance: Math.max(0, Math.min(100, taxRates.insurance || 0)),
  };

  // Calculate gross salary from valid earnings only
  const grossSalary = dailyEarnings
    .filter(earning => earning && typeof earning.amount === 'number' && earning.amount >= 0)
    .reduce((sum, earning) => sum + earning.amount, 0);
  
  const workingDays = dailyEarnings.length;
  
  // Calculate deductions with proper rounding
  const taxDeduction = Math.round((grossSalary * validatedTaxRates.tax) / 100 * 100) / 100;
  const retirementDeduction = Math.round((grossSalary * validatedTaxRates.retirement) / 100 * 100) / 100;
  const insuranceDeduction = Math.round((grossSalary * validatedTaxRates.insurance) / 100 * 100) / 100;
  
  const totalDeductions = Math.round((taxDeduction + retirementDeduction + insuranceDeduction) * 100) / 100;
  const netSalary = Math.round((grossSalary - totalDeductions) * 100) / 100;

  return {
    grossSalary: Math.round(grossSalary * 100) / 100,
    taxDeduction,
    retirementDeduction,
    insuranceDeduction,
    totalDeductions,
    netSalary: Math.max(0, netSalary), // Ensure net salary is never negative
    workingDays,
  };
};

export const formatCurrency = (amount: number): string => {
  // Validate input
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₺0,00';
  }

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  // Validate input
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }

  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// Additional utility functions for better calculations
export const calculateDailyAverage = (dailyEarnings: DailyEarning[]): number => {
  if (!dailyEarnings || dailyEarnings.length === 0) {
    return 0;
  }

  const validEarnings = dailyEarnings.filter(
    earning => earning && typeof earning.amount === 'number' && earning.amount >= 0
  );

  if (validEarnings.length === 0) {
    return 0;
  }

  const total = validEarnings.reduce((sum, earning) => sum + earning.amount, 0);
  return Math.round((total / validEarnings.length) * 100) / 100;
};

export const calculateMonthlyProjection = (dailyEarnings: DailyEarning[], workingDaysPerMonth: number = 22): number => {
  const dailyAverage = calculateDailyAverage(dailyEarnings);
  return Math.round(dailyAverage * workingDaysPerMonth * 100) / 100;
};

export const validateTaxRates = (taxRates: TaxRates): TaxRates => {
  return {
    tax: Math.max(0, Math.min(100, taxRates.tax || 0)),
    retirement: Math.max(0, Math.min(100, taxRates.retirement || 0)),
    insurance: Math.max(0, Math.min(100, taxRates.insurance || 0)),
  };
};

export const calculateEffectiveTaxRate = (calculation: SalaryCalculation): number => {
  if (calculation.grossSalary === 0) {
    return 0;
  }
  
  return Math.round((calculation.totalDeductions / calculation.grossSalary) * 100 * 100) / 100;
};