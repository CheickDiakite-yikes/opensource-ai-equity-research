
// Re-export all API services
export * from './profileService';
export * from './financialService';
export * from './marketDataService';
export * from './analysisService';

// Composite functions
import { fetchStockProfile, fetchStockQuote } from './profileService';
import { fetchIncomeStatements, fetchBalanceSheets, fetchCashFlowStatements, fetchKeyRatios } from './financialService';
import { fetchHistoricalPrices, fetchCompanyNews, fetchCompanyPeers } from './marketDataService';

/**
 * Get all financial data for a symbol
 */
export const getAllFinancialData = async (symbol: string) => {
  const profile = await fetchStockProfile(symbol);
  const quote = await fetchStockQuote(symbol);
  const incomeStatements = await fetchIncomeStatements(symbol);
  const balanceSheets = await fetchBalanceSheets(symbol);
  const cashFlowStatements = await fetchCashFlowStatements(symbol);
  const keyRatios = await fetchKeyRatios(symbol);
  const historicalPrices = await fetchHistoricalPrices(symbol);
  const news = await fetchCompanyNews(symbol);
  const peers = await fetchCompanyPeers(symbol);

  return {
    profile,
    quote,
    incomeStatements,
    balanceSheets,
    cashFlowStatements,
    keyRatios,
    historicalPrices,
    news,
    peers
  };
};
