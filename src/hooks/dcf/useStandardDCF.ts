
// Placeholder hook to fix TypeScript errors after DCF feature removal
import { useState } from 'react';

export const useStandardDCF = (symbol: string) => {
  console.warn("DCF feature has been removed - stub hook called");
  
  return {
    dcfData: null,
    isLoading: false,
    error: null,
    refresh: () => {
      console.warn("DCF feature has been removed - stub function called");
    }
  };
};

export default useStandardDCF;
