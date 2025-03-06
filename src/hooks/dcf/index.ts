
// Empty stubs for any hooks that might be referenced elsewhere
export const useAIDCFAssumptions = () => ({ 
  data: null, 
  isLoading: false, 
  refresh: () => {}, 
  error: null 
});

export const useStandardDCF = () => ({
  dcfData: null,
  isLoading: false,
  error: null,
  refresh: () => {}
});
