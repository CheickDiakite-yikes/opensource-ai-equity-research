
/**
 * Financial Modeling Prep (FMP) API client
 */

import { toast } from "sonner";
import {
  StockProfile,
  StockQuote,
  HistoricalPriceData,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  KeyRatio,
  CompanyPeer,
  NewsArticle
} from "@/types";

// API key from environment variable
const API_KEY = "d4pXGs1r5epkkuckDZxOzSiG7DTd7BEg";
const BASE_URL = "https://financialmodelingprep.com/api/v3";

/**
 * Generic fetch function with error handling
 */
async function fetchFromFMP<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // FMP returns an empty array for invalid requests
    if (Array.isArray(data) && data.length === 0) {
      console.warn(`No data returned from ${endpoint}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    toast.error(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Get company profile
 */
export async function getCompanyProfile(symbol: string): Promise<StockProfile> {
  const data = await fetchFromFMP<StockProfile[]>(`/profile/${symbol}`);
  return data[0];
}

/**
 * Get real-time stock quote
 */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const data = await fetchFromFMP<StockQuote[]>(`/quote/${symbol}`);
  return data[0];
}

/**
 * Get historical stock prices
 */
export async function getHistoricalPrices(symbol: string, from: string): Promise<HistoricalPriceData> {
  return fetchFromFMP<HistoricalPriceData>(`/historical-price-full/${symbol}?from=${from}`);
}

/**
 * Get income statements
 */
export async function getIncomeStatements(symbol: string, limit: number = 5): Promise<IncomeStatement[]> {
  return fetchFromFMP<IncomeStatement[]>(`/income-statement/${symbol}?limit=${limit}`);
}

/**
 * Get balance sheets
 */
export async function getBalanceSheets(symbol: string, limit: number = 5): Promise<BalanceSheet[]> {
  return fetchFromFMP<BalanceSheet[]>(`/balance-sheet-statement/${symbol}?limit=${limit}`);
}

/**
 * Get cash flow statements
 */
export async function getCashFlowStatements(symbol: string, limit: number = 5): Promise<CashFlowStatement[]> {
  return fetchFromFMP<CashFlowStatement[]>(`/cash-flow-statement/${symbol}?limit=${limit}`);
}

/**
 * Get key financial ratios
 */
export async function getFinancialRatios(symbol: string, limit: number = 5): Promise<KeyRatio[]> {
  return fetchFromFMP<KeyRatio[]>(`/ratios/${symbol}?limit=${limit}`);
}

/**
 * Get peer companies
 */
export async function getCompanyPeers(symbol: string): Promise<string[]> {
  const data = await fetchFromFMP<CompanyPeer[]>(`/stock_peers?symbol=${symbol}`);
  return data.length > 0 ? data[0].peersList : [];
}

/**
 * Get company news
 */
export async function getCompanyNews(symbol: string, limit: number = 10): Promise<NewsArticle[]> {
  return fetchFromFMP<NewsArticle[]>(`/stock_news?symbol=${symbol}&limit=${limit}`);
}

/**
 * Search for stocks
 */
export async function searchStocks(query: string): Promise<StockQuote[]> {
  if (!query || query.length < 1) return [];
  return fetchFromFMP<StockQuote[]>(`/search?query=${query}&limit=10`);
}

/**
 * Get all company financial data at once
 */
export async function getCompanyData(symbol: string) {
  try {
    const [
      profile,
      quote,
      incomeStatements,
      balanceSheets,
      cashFlowStatements,
      ratios,
      peers,
      news
    ] = await Promise.all([
      getCompanyProfile(symbol),
      getStockQuote(symbol),
      getIncomeStatements(symbol),
      getBalanceSheets(symbol),
      getCashFlowStatements(symbol),
      getFinancialRatios(symbol),
      getCompanyPeers(symbol),
      getCompanyNews(symbol)
    ]);

    // Calculate date 1 year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const fromDate = oneYearAgo.toISOString().split('T')[0];
    
    // Get historical prices (requires a date)
    const historicalPrices = await getHistoricalPrices(symbol, fromDate);

    return {
      profile,
      quote,
      historicalPrices,
      incomeStatements,
      balanceSheets,
      cashFlowStatements,
      ratios,
      peers,
      news
    };
  } catch (error) {
    console.error("Error fetching company data:", error);
    toast.error("Failed to retrieve complete company data");
    throw error;
  }
}
