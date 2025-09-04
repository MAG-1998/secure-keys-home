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
  syncToSearchStore: () => void;
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
        set((state) => {
          const newState = { ...state, ...updates };
          
          // Sync to search store if it exists
          if (typeof window !== 'undefined' && (window as any).searchStore) {
            (window as any).searchStore.getState().setFilters({
              halalMode: newState.isHalalMode,
              cashAvailable: newState.cashAvailable,
              periodMonths: newState.periodMonths
            });
          }
          
          return newState;
        });
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
      
      reset: () => set(defaultState),
      
      syncToSearchStore: () => {
        const state = get();
        if (typeof window !== 'undefined' && (window as any).searchStore) {
          (window as any).searchStore.getState().setFilters({
            halalMode: state.isHalalMode,
            cashAvailable: state.cashAvailable,
            periodMonths: state.periodMonths
          });
        }
      }
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

// Global reference for cross-store synchronization
if (typeof window !== 'undefined') {
  (window as any).financingStore = useFinancingStore;
}