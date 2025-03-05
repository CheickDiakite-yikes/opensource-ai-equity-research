
import { useState, useEffect } from "react";

export const useDCFErrors = (
  assumptionsError: Error | null,
  dcfError: Error | null
) => {
  const [errors, setErrors] = useState<string[]>([]);
  
  // Collect errors from different sources
  useEffect(() => {
    const newErrors: string[] = [];
    
    if (assumptionsError) {
      newErrors.push(`AI Assumptions Error: ${assumptionsError.message || String(assumptionsError)}`);
    }
    
    if (dcfError) {
      newErrors.push(`DCF Calculation Error: ${dcfError.message || String(dcfError)}`);
    }
    
    setErrors(newErrors);
  }, [assumptionsError, dcfError]);

  return { errors };
};
