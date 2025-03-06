
import { invokeSupabaseFunction } from "./core/edgeFunctions";
import { withRetry } from "./core/retryStrategy";
import { IncomeStatement, BalanceSheet, CashFlowStatement, KeyRatio } from "@/types";
import { 
  IncomeStatementTTM,
  BalanceSheetTTM,
  CashFlowStatementTTM,
  KeyRatioTTM
} from "@/types/financial/ttm";

/**
 * Fetch income statements for a company
 */
export const fetchIncomeStatements = async (symbol: string, limit: number = 5): Promise<IncomeStatement[]> => {
  try {
    console.log(`Fetching income statements for ${symbol}`);
    
    const data = await withRetry(() => 
      invokeSupabaseFunction<IncomeStatement[]>('get-stock-data', {
        symbol,
        endpoint: 'income-statement',
        limit
      })
    , 2, 2000);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`No income statement data found for ${symbol}`);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching income statements for ${symbol}:`, error);
    return [];
  }
};

/**
 * Fetch income statement TTM (trailing twelve months)
 */
export const fetchIncomeStatementTTM = async (symbol: string): Promise<IncomeStatementTTM | null> => {
  try {
    console.log(`Fetching income statement TTM for ${symbol}`);
    
    const data = await invokeSupabaseFunction<IncomeStatementTTM[]>('get-stock-data', {
      symbol,
      endpoint: 'income-statement-ttm'
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`No income statement TTM data found for ${symbol}`);
      return null;
    }
    
    return data[0];
  } catch (error) {
    console.error(`Error fetching income statement TTM for ${symbol}:`, error);
    return null;
  }
};

/**
 * Fetch balance sheets for a company
 */
export const fetchBalanceSheets = async (symbol: string, limit: number = 5): Promise<BalanceSheet[]> => {
  try {
    console.log(`Fetching balance sheets for ${symbol}`);
    
    const data = await withRetry(() => 
      invokeSupabaseFunction<BalanceSheet[]>('get-stock-data', {
        symbol,
        endpoint: 'balance-sheet',
        limit
      })
    , 2, 2000);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`No balance sheet data found for ${symbol}`);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching balance sheets for ${symbol}:`, error);
    return [];
  }
};

/**
 * Fetch balance sheet TTM (trailing twelve months)
 */
export const fetchBalanceSheetTTM = async (symbol: string): Promise<BalanceSheetTTM | null> => {
  try {
    console.log(`Fetching balance sheet TTM for ${symbol}`);
    
    const data = await invokeSupabaseFunction<BalanceSheetTTM[]>('get-stock-data', {
      symbol,
      endpoint: 'balance-sheet-ttm'
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`No balance sheet TTM data found for ${symbol}`);
      return null;
    }
    
    return data[0];
  } catch (error) {
    console.error(`Error fetching balance sheet TTM for ${symbol}:`, error);
    return null;
  }
};

/**
 * Fetch cash flow statements for a company
 */
export const fetchCashFlowStatements = async (symbol: string, limit: number = 5): Promise<CashFlowStatement[]> => {
  try {
    console.log(`Fetching cash flow statements for ${symbol}`);
    
    const data = await withRetry(() => 
      invokeSupabaseFunction<CashFlowStatement[]>('get-stock-data', {
        symbol,
        endpoint: 'cash-flow',
        limit
      })
    , 2, 2000);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`No cash flow statement data found for ${symbol}`);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching cash flow statements for ${symbol}:`, error);
    return [];
  }
};

/**
 * Fetch cash flow statement TTM (trailing twelve months)
 */
export const fetchCashFlowStatementTTM = async (symbol: string): Promise<CashFlowStatementTTM | null> => {
  try {
    console.log(`Fetching cash flow statement TTM for ${symbol}`);
    
    const data = await invokeSupabaseFunction<CashFlowStatementTTM[]>('get-stock-data', {
      symbol,
      endpoint: 'cash-flow-ttm'
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`No cash flow statement TTM data found for ${symbol}`);
      return null;
    }
    
    return data[0];
  } catch (error) {
    console.error(`Error fetching cash flow statement TTM for ${symbol}:`, error);
    return null;
  }
};

/**
 * Fetch key ratios for a company
 */
export const fetchKeyRatios = async (symbol: string, limit: number = 5): Promise<KeyRatio[]> => {
  try {
    console.log(`Fetching key ratios for ${symbol}`);
    
    const data = await withRetry(() => 
      invokeSupabaseFunction<KeyRatio[]>('get-stock-data', {
        symbol,
        endpoint: 'ratios',
        limit
      })
    , 2, 2000);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`No key ratio data found for ${symbol}`);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching key ratios for ${symbol}:`, error);
    return [];
  }
};

/**
 * Fetch key ratios TTM (trailing twelve months)
 */
export const fetchKeyRatiosTTM = async (symbol: string): Promise<KeyRatioTTM | null> => {
  try {
    console.log(`Fetching key ratios TTM for ${symbol}`);
    
    const data = await invokeSupabaseFunction<KeyRatioTTM[]>('get-stock-data', {
      symbol,
      endpoint: 'ratios-ttm'
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`No key ratios TTM data found for ${symbol}`);
      return null;
    }
    
    return data[0];
  } catch (error) {
    console.error(`Error fetching key ratios TTM for ${symbol}:`, error);
    return null;
  }
};
