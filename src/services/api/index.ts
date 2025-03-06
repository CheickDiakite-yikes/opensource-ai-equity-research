
// Services API index
// Re-export all service functions from the individual modules

// Market data services
export * from './marketDataService';

// Profile services
export { 
  fetchStockProfile as fetchCompanyProfile,
  fetchStockRating as fetchCompanyRating,
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
export { withRetry } from './base';

// Enhanced API services
export * from './enhancedApiService';
