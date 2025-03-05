
import { CustomDCFResult } from "@/types/ai-analysis/dcfTypes";

/**
 * Transform API response to CustomDCFResult format
 */
export const transformDCFResponse = (data: any[], symbol: string): CustomDCFResult[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  // Convert the FMP API response format to our application's expected format
  return data.map(item => ({
    year: String(item.year || new Date().getFullYear()),
    symbol: symbol,
    revenue: item.revenue || 0,
    revenuePercentage: item.revenuePercentage || item.revenueGrowth || 0,
    ebitda: item.ebitda || 0,
    ebitdaPercentage: item.ebitdaPercentage || item.ebitdaMargin || 0,
    ebit: item.ebit || 0,
    ebitPercentage: item.ebitPercentage || item.ebitPercent || 0,
    depreciation: item.depreciation || 0,
    capitalExpenditure: item.capitalExpenditure || 0,
    capitalExpenditurePercentage: item.capitalExpenditurePercentage || item.capexPercent || 0,
    price: item.price || item["Stock Price"] || 0,
    beta: item.beta || 0,
    dilutedSharesOutstanding: item.dilutedSharesOutstanding || 0,
    costofDebt: item.costofDebt || item.costOfDebt || 0,
    taxRate: item.taxRate || 0,
    afterTaxCostOfDebt: item.afterTaxCostOfDebt || ((item.costofDebt || item.costOfDebt || 0) * (1 - (item.taxRate || 0))),
    riskFreeRate: item.riskFreeRate || 0,
    marketRiskPremium: item.marketRiskPremium || 0,
    costOfEquity: item.costOfEquity || 0,
    totalDebt: item.totalDebt || 0,
    totalEquity: item.totalEquity || 0,
    totalCapital: item.totalCapital || 0,
    debtWeighting: item.debtWeighting || 0,
    equityWeighting: item.equityWeighting || 0,
    wacc: item.wacc || 0,
    operatingCashFlow: item.operatingCashFlow || 0,
    pvLfcf: item.pvLfcf || 0,
    sumPvLfcf: item.sumPvLfcf || 0,
    longTermGrowthRate: item.longTermGrowthRate || 0,
    freeCashFlow: item.freeCashFlow || (item.operatingCashFlow ? item.operatingCashFlow - Math.abs(item.capitalExpenditure || 0) : 0),
    terminalValue: item.terminalValue || 0,
    presentTerminalValue: item.presentTerminalValue || 0,
    enterpriseValue: item.enterpriseValue || 0,
    netDebt: item.netDebt || 0,
    equityValue: item.equityValue || 0,
    equityValuePerShare: item.equityValuePerShare || item.dcf || 0,
    freeCashFlowT1: item.freeCashFlowT1 || 0,
    operatingCashFlowPercentage: item.operatingCashFlowPercentage || item.operatingCashFlowPercent || 0
  }));
};
