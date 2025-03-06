
// Services API index
// Re-export all service functions from the individual modules

// Market data services
export * from './marketDataService';

// Profile services
export { 
  fetchStockProfile,
  fetchStockRating,
  fetchEmployeeCount as fetchCompanyOutlook,
  fetchCompanyNotes as fetchCompanyPeers
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
