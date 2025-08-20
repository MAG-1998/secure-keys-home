export interface HalalFinancingCalculation {
  totalCost: number;
  requiredMonthlyPayment: number;
  financingAmount: number;
}

export const calculateHalalFinancing = (
  cashAvailable: number,
  propertyPrice: number,
  periodMonths: number
): HalalFinancingCalculation => {
  if (!cashAvailable || !propertyPrice || !periodMonths || cashAvailable >= propertyPrice) {
    return {
      totalCost: 0,
      requiredMonthlyPayment: 0,
      financingAmount: 0
    };
  }

  const cashRatio = (cashAvailable / propertyPrice) * 100;
  const multiplier = 1.2128 + (0.00112 * cashRatio);
  const financingAmount = propertyPrice - cashAvailable;
  const totalCost = multiplier * financingAmount;
  const requiredMonthlyPayment = totalCost / periodMonths;

  return {
    totalCost,
    requiredMonthlyPayment,
    financingAmount
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

export const getPeriodOptions = () => [
  { value: '6', label: '6 months' },
  { value: '9', label: '9 months' },
  { value: '12', label: '1 year' },
  { value: '18', label: '1.5 years' },
  { value: '24', label: '2 years' }
];