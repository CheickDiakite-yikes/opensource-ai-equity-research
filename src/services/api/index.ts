
// Re-export api modules
export * from './core/supabaseClient';
export * from './core/edgeFunctions';
export * from './core/caching';
export * from './core/retryStrategy';
export * from './core/maintenance';
export * from './search/semanticSearch';
export * from './documents/relatedDocuments';
export * from './documents/metrics';

// Re-export service modules
export * from './profileService';
export * from './financialService';
export * from './documentsService';
export * from './marketDataService';
export * from './enhancedApiService';

// Re-export analysis services
export * from './analysis';

// Re-export the supabase client
export { supabase } from './core/supabaseClient';

// Export the main functions that were previously in base.ts
export {
  invokeSupabaseFunction,
  getCachedOrFetchData,
  withRetry,
  runDatabaseMaintenance
} from './core';

// Export document functions
export * from './documents';
