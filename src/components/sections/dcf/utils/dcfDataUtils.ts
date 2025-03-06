
// Re-export from individual modules for backward compatibility
import { convertAssumptionsToParams } from './assumptionsConverter';
import { createMockDCFData } from './mockDCFGenerator';
import { prepareDCFData } from './dcfDataFormatter';

// Enhanced error handling functions for DCF calculations
export const handleDCFCalculationError = (error: any, symbol: string): string => {
  console.error(`DCF calculation error for ${symbol}:`, error);
  
  // Extract meaningful error messages
  let errorMessage = "Error calculating DCF";
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }
  
  // Try to provide more specific error messages
  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return `No DCF data available for ${symbol}. The company may not have sufficient financial data.`;
  } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    return "API rate limit exceeded. Please try again later.";
  } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return "Network error. Please check your internet connection.";
  }
  
  return errorMessage;
};

// Check if DCF data is valid
export const isValidDCFData = (dcfData: any): boolean => {
  if (!dcfData) return false;
  
  // For array results, check if we have at least one valid item
  if (Array.isArray(dcfData)) {
    if (dcfData.length === 0) return false;
    
    // Check if the first item has required properties
    const firstItem = dcfData[0];
    return !!(firstItem && 
              typeof firstItem === 'object' &&
              (firstItem.equityValuePerShare !== undefined || 
               firstItem.dcf !== undefined));
  }
  
  // For object results, check required properties
  return !!(dcfData && 
            typeof dcfData === 'object' &&
            (dcfData.equityValuePerShare !== undefined || 
             dcfData.dcf !== undefined));
};

export {
  convertAssumptionsToParams,
  createMockDCFData,
  prepareDCFData
};
