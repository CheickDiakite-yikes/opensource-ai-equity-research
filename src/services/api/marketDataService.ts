
// Re-export market data-related functions
export * from './marketData/indicesService';
export * from './marketData/indicesDataService';
export * from './marketData/newsService';
export * from './marketData/stockDataService';

/**
 * Fetch company news articles
 */
export { fetchCompanyNews } from './marketData/newsService';
