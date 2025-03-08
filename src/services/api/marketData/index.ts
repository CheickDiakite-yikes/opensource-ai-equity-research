
// Re-export all market data functions
export * from './indicesService';
export * from './stockDataService';

// Explicitly re-export news functions to avoid ambiguity
import { 
  fetchCompanyNews as fetchCompanyNewsOriginal,
  fetchLatestNews as fetchLatestNewsOriginal,
  fetchMarketNews as fetchMarketNewsOriginal 
} from './newsService';

export const fetchCompanyNews = fetchCompanyNewsOriginal;
export const fetchLatestNews = fetchLatestNewsOriginal;
export const fetchMarketNews = fetchMarketNewsOriginal;
