
// Re-export all API services
export * from './profileService';
export * from './financialService';
export * from './marketDataService';
export * from './analysisService';
export * from './documentsService';
export * from './finnhubService';  // Export the new Finnhub service
export * from './base';  // Export base utilities including withRetry

// Composite functions
import { fetchStockProfile, fetchStockQuote } from './profileService';
import { fetchIncomeStatements, fetchBalanceSheets, fetchCashFlowStatements, fetchKeyRatios } from './financialService';
import { fetchHistoricalPrices, fetchCompanyNews, fetchCompanyPeers } from './marketDataService';
import { 
  fetchEarningsTranscripts, 
  fetchSECFilings, 
  triggerDocumentCaching 
} from './documentsService';
import {
  fetchAIDCFAssumptions  // Keep this import
} from './analysisService';
import { 
  generateResearchReport,
  generateStockPrediction
} from './analysis/researchService';
import {
  analyzeGrowthInsights
} from './analysis/insightsService';
import {
  fetchFinnhubIncomeStatements,
  fetchFinnhubBalanceSheets,
  fetchFinnhubCashFlowStatements
} from './finnhubService';

/**
 * Get all financial data for a symbol
 */
export const getAllFinancialData = async (symbol: string) => {
  // Fetch main data from FMP
  const profile = await fetchStockProfile(symbol);
  const quote = await fetchStockQuote(symbol);
  const incomeStatements = await fetchIncomeStatements(symbol);
  const balanceSheets = await fetchBalanceSheets(symbol);
  const cashFlowStatements = await fetchCashFlowStatements(symbol);
  const keyRatios = await fetchKeyRatios(symbol);
  const historicalPrices = await fetchHistoricalPrices(symbol);
  const news = await fetchCompanyNews(symbol);
  const peers = await fetchCompanyPeers(symbol);
  const earningsTranscripts = await fetchEarningsTranscripts(symbol);
  const secFilings = await fetchSECFilings(symbol);

  // Try to fetch additional data from Finnhub
  try {
    // Only fetch from Finnhub if we don't have enough data from FMP
    if (!incomeStatements.length || !balanceSheets.length || !cashFlowStatements.length) {
      console.log(`Trying Finnhub for ${symbol} financial data (missing FMP data)`);
      
      const [
        finnhubIncomeStatements,
        finnhubBalanceSheets,
        finnhubCashFlowStatements
      ] = await Promise.all([
        fetchFinnhubIncomeStatements(symbol),
        fetchFinnhubBalanceSheets(symbol),
        fetchFinnhubCashFlowStatements(symbol)
      ]);
      
      // Return the data from whichever source has more data
      return {
        profile,
        quote,
        incomeStatements: incomeStatements.length > 0 ? incomeStatements : finnhubIncomeStatements,
        balanceSheets: balanceSheets.length > 0 ? balanceSheets : finnhubBalanceSheets,
        cashFlowStatements: cashFlowStatements.length > 0 ? cashFlowStatements : finnhubCashFlowStatements,
        keyRatios,
        historicalPrices,
        news,
        peers,
        earningsTranscripts,
        secFilings
      };
    }
  } catch (error) {
    console.warn("Error fetching data from Finnhub:", error);
    // Continue with FMP data only
  }

  // Trigger background caching of company documents
  // This happens asynchronously and doesn't affect the response time
  if (profile) {
    triggerDocumentCaching(symbol);
  }

  return {
    profile,
    quote,
    incomeStatements,
    balanceSheets,
    cashFlowStatements,
    keyRatios,
    historicalPrices,
    news,
    peers,
    earningsTranscripts,
    secFilings
  };
};

// Re-export all analysis functions
export {
  generateResearchReport,
  generateStockPrediction,
  analyzeGrowthInsights,
  fetchAIDCFAssumptions  // Keep this export
};
