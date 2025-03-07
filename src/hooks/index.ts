
// Re-export all hooks
import useDirectFinancialData from './useDirectFinancialData';
import useCompanyCardData from './useCompanyCardData';
import useStockPrediction from './useStockPrediction';
import useMobile from './use-mobile';
import useToast from './use-toast';

// Re-export hooks
export { useDirectFinancialData, useCompanyCardData, useStockPrediction, useMobile, useToast };

// Stub for DCF-related hooks that have been removed
export const useAIDCFAssumptions = () => ({ 
  data: null, 
  isLoading: false, 
  refresh: () => {}, 
  error: null 
});
