
// Re-export all hooks
import { useDirectFinancialData } from './useDirectFinancialData';
import { useCompanyCardData } from './useCompanyCardData';
import { useStockPrediction } from './useStockPrediction';
import { useMediaQuery, useIsMobile } from './use-mobile';
import { useToast, toast } from './use-toast';

// Re-export hooks
export { 
  useDirectFinancialData, 
  useCompanyCardData, 
  useStockPrediction, 
  useIsMobile, 
  useMediaQuery,
  useToast,
  toast
};

// Stub for DCF-related hooks that have been removed
export const useAIDCFAssumptions = () => ({ 
  data: null, 
  isLoading: false, 
  refresh: () => {}, 
  error: null 
});
