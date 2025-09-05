import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FinancingState {
  isHalalMode: boolean;
  cashAvailable: string;
  periodMonths: string;
  monthlyPayment: string;
}

interface FinancingStore extends FinancingState {
  updateState: (updates: Partial<FinancingState>) => void;
  setFromQueryParams: (params: URLSearchParams) => void;
  reset: () => void;
}

const defaultState: FinancingState = {
  isHalalMode: false,
  cashAvailable: '',
  periodMonths: '12',
  monthlyPayment: ''
};

export const useFinancingStore = create<FinancingStore>()(
  persist(
    (set, get) => ({
      ...defaultState,
      
      updateState: (updates) => {
        set((state) => ({ ...state, ...updates }));
      },
      
      setFromQueryParams: (params) => {
        const updates: Partial<FinancingState> = {};
        
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
          get().updateState(updates);
        }
      },
      
      reset: () => set(defaultState)
    }),
    {
      name: 'financing-preferences',
      version: 1,
      partialize: (state) => ({
        isHalalMode: state.isHalalMode,
        cashAvailable: state.cashAvailable,
        periodMonths: state.periodMonths,
        monthlyPayment: state.monthlyPayment
      })
    }
  )
);

// Export for subscription
export default useFinancingStore;