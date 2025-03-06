
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

// Re-export these functions from profileService
export { fetchStockQuote, fetchStockPriceChange } from '../profileService';
