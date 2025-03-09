
// Re-export everything from the individual modules
export * from './newsService';
export * from './indicesService'; 
export * from './stockDataService';
export * from './indicesDataService';

// Consolidate any utility functions here if needed
export const MARKET_DATA_ENDPOINTS = {
  NEWS: '/news',
  INDICES: '/indices',
  STOCK: '/stock-data',
  INDICES_DATA: '/indices-data'
};
