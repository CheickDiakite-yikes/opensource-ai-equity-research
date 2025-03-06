
// Services API index
// Re-export all service functions from the individual modules

// Market data services
export * from './marketDataService';

// Profile services - explicitly export to avoid conflicts
export {
  fetchCompanyProfile,
  fetchCompanyRating,
  fetchCompanyOutlook,
  // Export with different name to avoid conflict
  fetchCompanyPeers as fetchPeerCompanies
} from './profileService';

// Financial data services
export * from './financialService';

// Document services
export * from './documentsService';

// Analysis services
export * from './analysisService';

// Enhanced API services
export * from './enhancedApiService';
