
import { invokeSupabaseFunction } from "./base";
import { IncomeStatement, BalanceSheet, CashFlowStatement, KeyRatio } from "@/types";

/**
 * Fetch income statements
 */
export const fetchIncomeStatements = async (symbol: string): Promise<IncomeStatement[]> => {
  try {
    const data = await invokeSupabaseFunction<IncomeStatement[]>('get-stock-data', { 
      symbol, 
      endpoint: 'income-statement' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching income statements:", error);
    return [];
  }
};

/**
 * Fetch income statement - TTM (Trailing Twelve Months)
 */
export const fetchIncomeStatementTTM = async (symbol: string): Promise<any> => {
  try {
    const data = await invokeSupabaseFunction<any>('get-stock-data', { 
      symbol, 
      endpoint: 'income-statement-ttm' 
    });
    
    if (!data || !Array.isArray(data)) return null;
    return data[0];
  } catch (error) {
    console.error("Error fetching TTM income statement:", error);
    return null;
  }
};

/**
 * Fetch balance sheets
 */
export const fetchBalanceSheets = async (symbol: string): Promise<BalanceSheet[]> => {
  try {
    const data = await invokeSupabaseFunction<BalanceSheet[]>('get-stock-data', { 
      symbol, 
      endpoint: 'balance-sheet' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching balance sheets:", error);
    return [];
  }
};

/**
 * Fetch cash flow statements
 */
export const fetchCashFlowStatements = async (symbol: string): Promise<CashFlowStatement[]> => {
  try {
    const data = await invokeSupabaseFunction<CashFlowStatement[]>('get-stock-data', { 
      symbol, 
      endpoint: 'cash-flow' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching cash flow statements:", error);
    return [];
  }
};

/**
 * Fetch financial ratios
 */
export const fetchKeyRatios = async (symbol: string): Promise<KeyRatio[]> => {
  try {
    const data = await invokeSupabaseFunction<KeyRatio[]>('get-stock-data', { 
      symbol, 
      endpoint: 'ratios' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching key ratios:", error);
    return [];
  }
};
