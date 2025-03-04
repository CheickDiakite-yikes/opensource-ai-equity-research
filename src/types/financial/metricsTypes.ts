
// Types related to financial metrics and ratios

import { IncomeStatement, BalanceSheet, CashFlowStatement, KeyRatio } from './statementTypes';

/**
 * TTM Income Statement
 */
export interface IncomeStatementTTM extends Omit<IncomeStatement, 'period'> {
  period: 'TTM';
}

/**
 * TTM Balance Sheet
 */
export interface BalanceSheetTTM extends Omit<BalanceSheet, 'period'> {
  period: 'TTM';
}

/**
 * TTM Cash Flow Statement
 */
export interface CashFlowStatementTTM extends Omit<CashFlowStatement, 'period'> {
  period: 'TTM';
}

/**
 * Key financial metrics
 */
export interface KeyMetric {
  symbol: string;
  date: string;
  period: string;
  reportedCurrency: string;
  marketCap: number;
  enterpriseValue: number;
  evToSales: number;
  evToOperatingCashFlow: number;
  evToFreeCashFlow: number;
  evToEBITDA: number;
  netDebtToEBITDA: number;
  currentRatio: number;
  incomeQuality: number;
  grahamNumber: number;
  grahamNetNet: number;
  workingCapital: number;
  investedCapital: number;
  returnOnAssets: number;
  operatingReturnOnAssets: number;
  returnOnTangibleAssets: number;
  returnOnEquity: number;
  returnOnInvestedCapital: number;
  returnOnCapitalEmployed: number;
  earningsYield: number;
  freeCashFlowYield: number;
  capexToOperatingCashFlow: number;
  capexToDepreciation: number;
  capexToRevenue: number;
  stockBasedCompensationToRevenue: number;
  daysOfSalesOutstanding: number;
  daysOfPayablesOutstanding: number;
  daysOfInventoryOutstanding: number;
  operatingCycle: number;
  cashConversionCycle: number;
  freeCashFlowToEquity: number;
  freeCashFlowToFirm: number;
  tangibleAssetValue: number;
  netCurrentAssetValue: number;
  [key: string]: any; // For any additional fields
}

/**
 * TTM Key Metrics
 */
export interface KeyMetricTTM extends Omit<KeyMetric, 'period'> {
  marketCapTTM: number;
  enterpriseValueTTM: number;
  evToSalesTTM: number;
  evToOperatingCashFlowTTM: number;
  evToFreeCashFlowTTM: number;
  evToEBITDATTM: number;
  netDebtToEBITDATTM: number;
  currentRatioTTM: number;
  incomeQualityTTM: number;
  grahamNumberTTM: number;
  grahamNetNetTTM: number;
  workingCapitalTTM: number;
  investedCapitalTTM: number;
  returnOnAssetsTTM: number;
  operatingReturnOnAssetsTTM: number;
  returnOnTangibleAssetsTTM: number;
  returnOnEquityTTM: number;
  returnOnInvestedCapitalTTM: number;
  returnOnCapitalEmployedTTM: number;
  earningsYieldTTM: number;
  freeCashFlowYieldTTM: number;
  capexToOperatingCashFlowTTM: number;
  capexToDepreciationTTM: number;
  capexToRevenueTTM: number;
  [key: string]: any; // For any additional fields
}

/**
 * TTM Key Ratios
 */
export interface KeyRatioTTM extends Omit<KeyRatio, 'period'> {
  grossProfitMarginTTM: number;
  operatingProfitMarginTTM: number;
  netProfitMarginTTM: number;
  returnOnAssetsTTM: number;
  returnOnEquityTTM: number;
  debtToEquityRatioTTM: number;
  currentRatioTTM: number;
  quickRatioTTM: number;
  priceToEarningsRatioTTM: number;
  priceToBookRatioTTM: number;
  dividendYieldTTM: number;
  dividendYieldPercentageTTM: number;
  [key: string]: any; // For any additional fields
}

/**
 * Financial health scores
 */
export interface FinancialScore {
  symbol: string;
  reportedCurrency: string;
  altmanZScore: number;
  piotroskiScore: number;
  workingCapital: number;
  totalAssets: number;
  retainedEarnings: number;
  ebit: number;
  marketCap: number;
  totalLiabilities: number;
  revenue: number;
}
