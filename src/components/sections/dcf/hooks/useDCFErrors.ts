
import { useState, useEffect } from "react";
import { handleDCFCalculationError } from "../utils/dcfDataUtils";

export const useDCFErrors = (assumptionsError: Error | null, dcfError: string | null) => {
  const [errors, setErrors] = useState<string[]>([]);
  
  // Add custom error method - accept either string or Error
  const addError = (errorMessage: string | Error) => {
    // Convert Error object to string if needed
    const errorString = errorMessage instanceof Error ? errorMessage.message : errorMessage;
    
    setErrors(prev => {
      // Don't add duplicate errors
      if (prev.includes(errorString)) {
        return prev;
      }
      return [...prev, errorString];
    });
  };

  // Update errors when assumption or DCF errors change
  useEffect(() => {
    const newErrors: string[] = [];
    
    if (assumptionsError) {
      const errorMessage = handleDCFCalculationError(assumptionsError, 'AAPL');
      newErrors.push(`Error fetching DCF assumptions: ${errorMessage}`);
    }
    
    if (dcfError) {
      newErrors.push(`Error calculating DCF: ${dcfError}`);
    }
    
    setErrors(newErrors);
  }, [assumptionsError, dcfError]);

  return { errors, addError };
};
