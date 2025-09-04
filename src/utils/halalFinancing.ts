export interface HalalFinancingCalculation {
  totalCost: number;
  requiredMonthlyPayment: number;
  financingAmount: number;
  propertyPrice?: number;
  fixedFee: number;
  serviceFee: number;
  vat: number;
  overpay: number;
}

export const calculateHalalFinancing = (
  cashAvailable: number,
  propertyPrice: number,
  periodMonths: number
): HalalFinancingCalculation => {
  if (!propertyPrice || !periodMonths || cashAvailable >= propertyPrice) {
    return {
      totalCost: 0,
      requiredMonthlyPayment: 0,
      financingAmount: 0,
      propertyPrice: 0,
      fixedFee: 0,
      serviceFee: 0,
      vat: 0,
      overpay: 0
    };
  }

  // Convert period from months to years for formula
  const n = periodMonths / 12; // financing period in years
  const P = propertyPrice;
  const C = cashAvailable;
  const x = P - C; // loaned money
  
  const k = Math.floor(n); // integer part of years
  const f = n - k; // fractional part of years
  
  // Fixed Fee calculation
  const FF = 0.2 * (x * k - (x / n) * (k * (k - 1) / 2) + (x - (x * k / n)) * f);
  
  // Service Fee calculation
  const SF = ((0.1 * x) / P - 0.01) * x;
  
  // VAT calculation
  const VAT = (FF + SF) * 0.12;
  
  // Overpay calculation
  const overpay = (SF + FF) * (1 + 0.12);
  
  // Total cost = loaned sum + overpay
  const totalCost = x + overpay;
  const requiredMonthlyPayment = totalCost / periodMonths;

  return {
    totalCost,
    requiredMonthlyPayment,
    financingAmount: x,
    propertyPrice: P,
    fixedFee: FF,
    serviceFee: SF,
    vat: VAT,
    overpay
  };
};

// Calculate property price from cash available
export const calculatePropertyPriceFromCash = (cashAvailable: number): number => {
  return cashAvailable / 0.7;
};

// Calculate cash available from monthly payment
export const calculateCashFromMonthlyPayment = (monthlyPayment: number, periodMonths: number): number => {
  const periodYears = periodMonths / 12;
  return monthlyPayment / (periodYears * 0.7);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

export const getPeriodOptions = (t?: (key: string) => string) => {
  if (t) {
    return [
      { value: '6', label: t('halal.period.6months') },
      { value: '9', label: t('halal.period.9months') },
      { value: '12', label: t('halal.period.1year') },
      { value: '18', label: t('halal.period.1.5years') },
      { value: '24', label: t('halal.period.2years') }
    ];
  }
  
  // Fallback to English for backwards compatibility
  return [
    { value: '6', label: '6 months' },
    { value: '9', label: '9 months' },
    { value: '12', label: '1 year' },
    { value: '18', label: '1.5 years' },
    { value: '24', label: '2 years' }
  ];
};