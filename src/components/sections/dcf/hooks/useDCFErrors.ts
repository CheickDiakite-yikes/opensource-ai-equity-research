
import { useState, useEffect } from "react";
import { handleDCFCalculationError } from "../utils/dcfDataUtils";

export const useDCFErrors = (assumptionsError: Error | null, dcfError: string | null) => {
  const [errors, setErrors] = useState<string[]>([]);
  
  // Add custom error method
  const addError = (errorMessage: string) => {
    setErrors(prev => {
      // Don't add duplicate errors
      if (prev.includes(errorMessage)) {
        return prev;
      }
      return [...prev, errorMessage];
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
