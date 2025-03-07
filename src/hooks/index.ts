
// Re-export all hooks
import { useDirectFinancialData } from './useDirectFinancialData';
import { useCompanyCardData } from './useCompanyCardData';
import { useStockPrediction } from './useStockPrediction';
import { useIsMobile } from './use-mobile';
import { useToast } from './use-toast';
import { usePrefetchSymbolData } from './usePrefetchSymbolData';
import { useCacheService } from '@/services/cache/useCacheService';

// Re-export hooks
export { 
  useDirectFinancialData, 
  useCompanyCardData, 
  useStockPrediction, 
  useIsMobile, 
  useToast,
  usePrefetchSymbolData,
  useCacheService
};

// Stub for DCF-related hooks that have been removed
export const useAIDCFAssumptions = () => ({ 
  assumptions: null, 
  isLoading: false,
  error: null, 
  refresh: () => {}
});

export const useDCFCalculation = () => ({
  dcfData: null,
  isLoading: false,
  error: null,
  refresh: () => {}
});
