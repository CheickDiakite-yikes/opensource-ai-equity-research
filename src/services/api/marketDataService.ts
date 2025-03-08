
// This file is a simple re-export of the modules in the marketData directory
// to maintain backward compatibility
export { 
  fetchMarketIndices,
  fetchHistoricalPrices,
  fetchCompanyPeers,
  // Re-export news functions explicitly to avoid ambiguity
  fetchCompanyNews,
  fetchLatestNews
} from './marketData';

// Explicitly re-export fetchMarketNews to resolve ambiguity
import { fetchMarketNews as fetchMarketNewsOriginal } from './marketData';
export const fetchMarketNews = fetchMarketNewsOriginal;
