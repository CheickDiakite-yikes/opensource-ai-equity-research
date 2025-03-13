
// Re-export financial utility functions
export * from './calculationUtils';
export * from './formatUtils';
export * from './dataProcessingUtils';
export * from './prepareDataUtils';
export * from './ratioAnalysisUtils';

// Empty stub for DCF calculation utilities
export const calculateDCF = () => ({
  intrinsicValue: 0,
  enterpriseValue: 0,
  equityValue: 0,
  upside: 0,
  assumptions: {
    growthRate: 0.05,
    discountRate: 0.09,
    terminalMultiple: 15,
    taxRate: 0.21
  },
  projectionsData: []
});

export const generateProjections = () => [];
