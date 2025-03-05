
import { useState, useEffect } from "react";

export const useDCFErrors = (
  assumptionsError: Error | null | string,
  dcfError: Error | null | string
) => {
  const [errors, setErrors] = useState<string[]>([]);
  
  // Helper function to handle different error types
  const formatError = (error: Error | string | null): string | null => {
    if (!error) return null;
    
    if (typeof error === 'string') {
      return error;
    }
    
    return error.message || String(error);
  };
  
  // Collect errors from different sources
  useEffect(() => {
    const newErrors: string[] = [];
    
    const assumptionsErrorStr = formatError(assumptionsError);
    if (assumptionsErrorStr) {
      newErrors.push(`AI Assumptions Error: ${assumptionsErrorStr}`);
    }
    
    const dcfErrorStr = formatError(dcfError);
    if (dcfErrorStr) {
      newErrors.push(`DCF Calculation Error: ${dcfErrorStr}`);
    }
    
    setErrors(newErrors);
  }, [assumptionsError, dcfError]);

  return { errors };
};
