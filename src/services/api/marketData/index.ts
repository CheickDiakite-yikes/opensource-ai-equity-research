
// Re-export everything from the individual modules with appropriate naming
export * from './newsService';
export * from './indicesService'; 
export * from './indicesDataService';

// Exports from stockDataService
export {
  fetchHistoricalPrices,
  fetchCompanyPeers,
  fetchCompanyLogo, 
  fetchCompanyNews as fetchStockCompanyNews
} from './stockDataService';

// Add these exports to match imports from other files
export { fetchStockQuote, fetchStockPriceChange } from '../profileService';
