
// Re-export everything from the individual modules, except selectively from stockDataService
export * from './newsService';
export * from './indicesService'; 
export * from './indicesDataService';

// Selectively export from stockDataService to avoid naming conflicts
export {
  fetchStockQuote,
  fetchHistoricalPrices,
  fetchStockPriceChange,
  // Rename this export to avoid conflict with newsService
  fetchCompanyNews as fetchStockCompanyNews
} from './stockDataService';
