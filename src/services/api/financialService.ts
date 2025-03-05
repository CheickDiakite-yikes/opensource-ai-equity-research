import { invokeSupabaseFunction } from "./base";
import { 
  IncomeStatement, 
  BalanceSheet, 
  CashFlowStatement, 
  KeyRatio, 
  KeyMetric,
  FinancialScore,
  IncomeStatementTTM,
  BalanceSheetTTM,
  CashFlowStatementTTM,
  KeyRatioTTM,
  KeyMetricTTM
} from "@/types";

/**
 * Fetch income statements
 */
export const fetchIncomeStatements = async (
  symbol: string, 
  period: 'annual' | 'quarterly' = 'annual'
): Promise<IncomeStatement[]> => {
  try {
    const data = await invokeSupabaseFunction<IncomeStatement[]>('get-stock-data', { 
      symbol, 
      endpoint: 'income-statement',
      period: period === 'annual' ? 'FY' : 'Q'
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
export const fetchIncomeStatementTTM = async (symbol: string): Promise<IncomeStatementTTM | null> => {
  try {
    const data = await invokeSupabaseFunction<IncomeStatementTTM[]>('get-stock-data', { 
      symbol, 
      endpoint: 'income-statement-ttm' 
    });
    
    console.log("TTM Income Statement data received:", data);
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error("Error fetching TTM income statement:", error);
    return null;
  }
};

/**
 * Fetch balance sheets
 */
export const fetchBalanceSheets = async (
  symbol: string,
  period: 'annual' | 'quarterly' = 'annual'
): Promise<BalanceSheet[]> => {
  try {
    const data = await invokeSupabaseFunction<BalanceSheet[]>('get-stock-data', { 
      symbol, 
      endpoint: 'balance-sheet',
      period: period === 'annual' ? 'FY' : 'Q'
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching balance sheets:", error);
    return [];
  }
};

/**
 * Fetch balance sheet - TTM (Trailing Twelve Months)
 */
export const fetchBalanceSheetTTM = async (symbol: string): Promise<BalanceSheetTTM | null> => {
  try {
    const data = await invokeSupabaseFunction<BalanceSheetTTM[]>('get-stock-data', { 
      symbol, 
      endpoint: 'balance-sheet-ttm' 
    });
    
    console.log("TTM Balance Sheet data received:", data);
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error("Error fetching TTM balance sheet:", error);
    return null;
  }
};

/**
 * Fetch cash flow statements
 */
export const fetchCashFlowStatements = async (
  symbol: string,
  period: 'annual' | 'quarterly' = 'annual'
): Promise<CashFlowStatement[]> => {
  try {
    const data = await invokeSupabaseFunction<CashFlowStatement[]>('get-stock-data', { 
      symbol, 
      endpoint: 'cash-flow',
      period: period === 'annual' ? 'FY' : 'Q'
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching cash flow statements:", error);
    return [];
  }
};

/**
 * Fetch cash flow statement - TTM (Trailing Twelve Months)
 */
export const fetchCashFlowStatementTTM = async (symbol: string): Promise<CashFlowStatementTTM | null> => {
  try {
    const data = await invokeSupabaseFunction<CashFlowStatementTTM[]>('get-stock-data', { 
      symbol, 
      endpoint: 'cash-flow-ttm' 
    });
    
    console.log("TTM Cash Flow data received:", data);
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error("Error fetching TTM cash flow statement:", error);
    return null;
  }
};

/**
 * Fetch financial ratios
 */
export const fetchKeyRatios = async (
  symbol: string,
  period: 'annual' | 'quarterly' = 'annual'
): Promise<KeyRatio[]> => {
  try {
    const data = await invokeSupabaseFunction<KeyRatio[]>('get-stock-data', { 
      symbol, 
      endpoint: 'ratios',
      period: period === 'annual' ? 'FY' : 'Q'
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching key ratios:", error);
    return [];
  }
};

/**
 * Fetch financial ratios - TTM (Trailing Twelve Months)
 */
export const fetchKeyRatiosTTM = async (symbol: string): Promise<KeyRatioTTM | null> => {
  try {
    const data = await invokeSupabaseFunction<KeyRatioTTM[]>('get-stock-data', { 
      symbol, 
      endpoint: 'ratios-ttm' 
    });
    
    console.log("TTM Key Ratios data received:", data);
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error("Error fetching TTM key ratios:", error);
    return null;
  }
};

/**
 * Fetch key metrics
 */
export const fetchKeyMetrics = async (
  symbol: string,
  period: 'annual' | 'quarterly' = 'annual'
): Promise<KeyMetric[]> => {
  try {
    const data = await invokeSupabaseFunction<KeyMetric[]>('get-stock-data', { 
      symbol, 
      endpoint: 'key-metrics',
      period: period === 'annual' ? 'FY' : 'Q'
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching key metrics:", error);
    return [];
  }
};

/**
 * Fetch key metrics - TTM (Trailing Twelve Months)
 */
export const fetchKeyMetricsTTM = async (symbol: string): Promise<KeyMetricTTM | null> => {
  try {
    const data = await invokeSupabaseFunction<KeyMetricTTM[]>('get-stock-data', { 
      symbol, 
      endpoint: 'key-metrics-ttm' 
    });
    
    console.log("TTM Key Metrics data received:", data);
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error("Error fetching TTM key metrics:", error);
    return null;
  }
};

/**
 * Fetch financial scores
 */
export const fetchFinancialScores = async (symbol: string): Promise<FinancialScore[]> => {
  try {
    const data = await invokeSupabaseFunction<FinancialScore[]>('get-stock-data', { 
      symbol, 
      endpoint: 'financial-scores'
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching financial scores:", error);
    return [];
  }
};

/**
 * Fetch all financial data for a company in one call
 */
export const fetchAllFinancialData = async (symbol: string): Promise<{
  income: IncomeStatement[];
  incomeTTM: IncomeStatementTTM | null;
  balance: BalanceSheet[];
  balanceTTM: BalanceSheetTTM | null;
  cashflow: CashFlowStatement[];
  cashflowTTM: CashFlowStatementTTM | null;
  ratios: KeyRatio[];
  ratiosTTM: KeyRatioTTM | null;
  metrics: KeyMetric[];
  metricsTTM: KeyMetricTTM | null;
  scores: FinancialScore[];
}> => {
  try {
    const [
      income,
      incomeTTM,
      balance,
      balanceTTM,
      cashflow,
      cashflowTTM,
      ratios,
      ratiosTTM,
      metrics,
      metricsTTM,
      scores
    ] = await Promise.all([
      fetchIncomeStatements(symbol),
      fetchIncomeStatementTTM(symbol),
      fetchBalanceSheets(symbol),
      fetchBalanceSheetTTM(symbol),
      fetchCashFlowStatements(symbol),
      fetchCashFlowStatementTTM(symbol),
      fetchKeyRatios(symbol),
      fetchKeyRatiosTTM(symbol),
      fetchKeyMetrics(symbol),
      fetchKeyMetricsTTM(symbol),
      fetchFinancialScores(symbol)
    ]);
    
    return {
      income,
      incomeTTM,
      balance,
      balanceTTM,
      cashflow,
      cashflowTTM,
      ratios,
      ratiosTTM,
      metrics,
      metricsTTM,
      scores
    };
  } catch (error) {
    console.error("Error fetching all financial data:", error);
    return {
      income: [],
      incomeTTM: null,
      balance: [],
      balanceTTM: null,
      cashflow: [],
      cashflowTTM: null,
      ratios: [],
      ratiosTTM: null,
      metrics: [],
      metricsTTM: null,
      scores: []
    };
  }
};
