
import { CustomDCFResult } from "@/types/ai-analysis/dcfTypes";

/**
 * Transform DCF API response to our application's data format
 */
export const transformDCFResponse = (
  data: any[], 
  symbol: string
): CustomDCFResult[] => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  return data.map(item => {
    // Normalize the data to match our CustomDCFResult type
    const result: CustomDCFResult = {
      ...item,
      symbol: item.symbol || symbol,
      year: item.year || new Date().getFullYear().toString(),
      // Handle DCF vs equityValuePerShare property difference
      equityValuePerShare: item.equityValuePerShare || item.dcf || 0,
      revenuePercentage: item.revenuePercentage || item.revenueGrowth || 8.5,
      longTermGrowthRate: item.longTermGrowthRate || 0.03,
      wacc: item.wacc || item.discountRate || 0.095,
      taxRate: item.taxRate || 0.21,
      // Add any missing fields
      ebitda: item.ebitda || 0,
      ebitdaPercentage: item.ebitdaPercentage || item.ebitdaMargin || 0,
      ebit: item.ebit || 0,
      ebitPercentage: item.ebitPercentage || 0,
      capitalExpenditure: item.capitalExpenditure || 0,
      capitalExpenditurePercentage: item.capitalExpenditurePercentage || item.capexPercent || 0,
      operatingCashFlow: item.operatingCashFlow || 0,
      operatingCashFlowPercentage: item.operatingCashFlowPercentage || 0,
      beta: item.beta || 1.2
    };
    
    return result;
  });
};
