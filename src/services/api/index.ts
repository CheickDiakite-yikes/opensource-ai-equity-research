
// Services API index
// Re-export all service functions from the individual modules

// Market data services
export * from './marketDataService';

// Profile services
export { 
  fetchStockProfile,
  fetchStockRating,
  fetchEmployeeCount,
  fetchCompanyNotes 
} from './profileService';

// Financial data services
export * from './financialService';

// Document services
export * from './documentsService';

// Analysis services
export * from './analysisService';

// Base service utils
export { withRetry, invokeSupabaseFunction } from './base';

// Enhanced API services
export * from './enhancedApiService';

// Export company news from marketData for proper import in other files
export { fetchStockCompanyNews as fetchCompanyNews } from './marketData';

// Re-export company peers for backwards compatibility
export { fetchCompanyNotes as fetchCompanyPeers } from './profileService';

// Re-export these functions for backward compatibility
export { 
  fetchStockProfile,
  fetchStockRating 
} from './profileService';
