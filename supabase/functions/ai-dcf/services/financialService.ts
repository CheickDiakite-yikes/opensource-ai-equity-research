
import { fetchWithRetry } from "../../_shared/fetch-utils.ts";

// API key from environment variable
const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

// Base URL for FMP API
const FMP_BASE_URL = "https://financialmodelingprep.com/api";

// Fetch income statements as a fallback
export async function fetchIncomeStatements(symbol: string) {
  const url = `${FMP_BASE_URL}/v3/income-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
  const response = await fetchWithRetry(url);
  const data = await response.json();
  
  if (!data || !data.length) {
    throw new Error(`No income statement data found for ${symbol}`);
  }
  
  return data;
}

// Fetch cash flow statements as a fallback
export async function fetchCashFlowStatements(symbol: string) {
  const url = `${FMP_BASE_URL}/v3/cash-flow-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
  const response = await fetchWithRetry(url);
  const data = await response.json();
  
  if (!data || !data.length) {
    throw new Error(`No cash flow statement data found for ${symbol}`);
  }
  
  return data;
}

// Fetch balance sheets as a fallback
export async function fetchBalanceSheets(symbol: string) {
  const url = `${FMP_BASE_URL}/v3/balance-sheet-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
  const response = await fetchWithRetry(url);
  const data = await response.json();
  
  if (!data || !data.length) {
    throw new Error(`No balance sheet data found for ${symbol}`);
  }
  
  return data;
}
