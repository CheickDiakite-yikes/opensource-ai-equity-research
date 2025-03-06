
// Type definitions for DCF-related functionality
// These are placeholder types to fix TypeScript errors after DCF feature removal

/**
 * AI-generated DCF assumptions
 */
export interface AIDCFSuggestion {
  company: string;
  timestamp: string;
  expiresAt: string;
  explanation: string;
  assumptions: {
    [key: string]: number;
  };
}

/**
 * DCF calculation result
 */
export interface CustomDCFResult {
  intrinsicValue: number;
  enterpriseValue: number;
  equityValue: number;
  upside: number;
  assumptions: {
    growthRate: number;
    discountRate: number;
    terminalMultiple: number;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Yearly data for DCF projections
 */
export interface YearlyDCFData {
  year: string;
  revenue: number;
  ebit: number;
  ebitda: number;
  freeCashFlow: number;
  operatingCashFlow: number;
  capitalExpenditure: number;
  [key: string]: any;
}

/**
 * Formatted DCF data for presentation
 */
export interface FormattedDCFData {
  intrinsicValue: number;
  currentPrice: number;
  upside: string;
  assumptions: {
    growthRate: string;
    discountRate: string;
    terminalMultiple: string;
    taxRate: string;
    [key: string]: string;
  };
  projections: YearlyDCFData[];
  sensitivity: DCFSensitivityData;
}

/**
 * Sensitivity analysis for DCF
 */
export interface DCFSensitivityData {
  headers: string[];
  rows: {
    growth: string;
    values: number[];
  }[];
}

/**
 * DCF calculation inputs
 */
export interface DCFInputs {
  growthRate: number;
  discountRate: number;
  terminalMultiple: number;
  taxRate: number;
  [key: string]: any;
}

/**
 * Parameters for custom DCF calculations
 */
export interface CustomDCFParams {
  revenueGrowth: number;
  ebitdaMargin: number;
  taxRate: number;
  longTermGrowthRate: number;
  beta: number;
  costOfEquity: number;
  costOfDebt: number;
  [key: string]: any;
}
