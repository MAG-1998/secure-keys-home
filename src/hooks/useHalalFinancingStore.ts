import { useState, useEffect } from 'react';

interface HalalFinancingState {
  isHalalMode: boolean;
  cashAvailable: string;
  periodMonths: string;
  monthlyPayment: string;
}

const STORAGE_KEY = 'halal-financing-state';

const getInitialState = (): HalalFinancingState => {
  if (typeof window === 'undefined') {
    return {
      isHalalMode: false,
      cashAvailable: '',
      periodMonths: '12',
      monthlyPayment: ''
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to parse stored halal financing state:', error);
  }

  return {
    isHalalMode: false,
    cashAvailable: '',
    periodMonths: '12',
    monthlyPayment: ''
  };
};

export const useHalalFinancingStore = () => {
  const [state, setState] = useState<HalalFinancingState>(getInitialState);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save halal financing state:', error);
    }
  }, [state]);

  const updateState = (updates: Partial<HalalFinancingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const setFromQueryParams = (params: URLSearchParams) => {
    const updates: Partial<HalalFinancingState> = {};
    
    if (params.has('halal')) {
      updates.isHalalMode = params.get('halal') === '1';
    }
    
    if (params.has('cash')) {
      updates.cashAvailable = params.get('cash') || '';
    }
    
    if (params.has('period')) {
      updates.periodMonths = params.get('period') || '12';
    }

    if (Object.keys(updates).length > 0) {
      updateState(updates);
    }
  };

  const reset = () => {
    setState({
      isHalalMode: false,
      cashAvailable: '',
      periodMonths: '12',
      monthlyPayment: ''
    });
  };

  return {
    ...state,
    updateState,
    setFromQueryParams,
    reset
  };
};