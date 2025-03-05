
import { invokeSupabaseFunction } from "../base";
import { AIDCFSuggestion, CustomDCFParams, CustomDCFResult } from "@/types/ai-analysis/dcfTypes";
import { toast } from "@/components/ui/use-toast";

/**
 * Fetch AI-generated DCF assumptions for a company
 */
export const fetchAIDCFAssumptions = async (symbol: string, refreshCache = false): Promise<AIDCFSuggestion | null> => {
  try {
    console.log(`Fetching AI DCF assumptions for ${symbol}, refreshCache=${refreshCache}`);
    
    const data = await invokeSupabaseFunction<AIDCFSuggestion>('generate-dcf-assumptions', { 
      symbol, 
      refreshCache 
    });
    
    if (!data) {
      console.error("No data returned from AI DCF assumptions API");
      return null;
    }
    
    console.log(`Received AI DCF assumptions for ${symbol}`);
    return data;
  } catch (error) {
    console.error("Error fetching AI DCF assumptions:", error);
    throw error;
  }
};

/**
 * DCF Types Enum
 */
export enum DCFType {
  STANDARD = "standard",
  LEVERED = "levered",
  CUSTOM_ADVANCED = "advanced",
  CUSTOM_LEVERED = "custom-levered"
}

/**
 * Fetch standard DCF calculation
 */
export const fetchStandardDCF = async (symbol: string): Promise<any> => {
  try {
    console.log(`Fetching standard DCF for ${symbol}`);
    
    const data = await invokeSupabaseFunction('get-custom-dcf', { 
      symbol,
      type: DCFType.STANDARD
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching standard DCF:", error);
    throw error;
  }
};

/**
 * Fetch levered DCF calculation
 */
export const fetchLeveredDCF = async (symbol: string, limit?: number): Promise<any> => {
  try {
    console.log(`Fetching levered DCF for ${symbol}`);
    
    const params: any = {};
    if (limit && !isNaN(limit)) {
      params.limit = limit;
    }
    
    const data = await invokeSupabaseFunction('get-custom-dcf', { 
      symbol,
      type: DCFType.LEVERED,
      params
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching levered DCF:", error);
    throw error;
  }
};

/**
 * Fetch custom DCF calculation based on user-defined parameters
 */
export const fetchCustomDCF = async (
  symbol: string, 
  params: CustomDCFParams, 
  type: DCFType = DCFType.CUSTOM_ADVANCED
): Promise<CustomDCFResult[]> => {
  try {
    console.log(`Fetching custom DCF for ${symbol} with params:`, params);
    
    // Format parameters for the FMP API
    const apiParams: any = {
      revenueGrowthPct: params.revenueGrowthPct,
      ebitdaPct: params.ebitdaPct,
      capitalExpenditurePct: params.capitalExpenditurePct,
      taxRate: params.taxRate,
      depreciationAndAmortizationPct: params.depreciationAndAmortizationPct,
      cashAndShortTermInvestmentsPct: params.cashAndShortTermInvestmentsPct,
      receivablesPct: params.receivablesPct,
      inventoriesPct: params.inventoriesPct,
      payablesPct: params.payablesPct,
      ebitPct: params.ebitPct,
      operatingCashFlowPct: params.operatingCashFlowPct,
      sellingGeneralAndAdministrativeExpensesPct: params.sellingGeneralAndAdministrativeExpensesPct,
      longTermGrowthRate: params.longTermGrowthRate,
      costOfEquity: params.costOfEquity,
      costOfDebt: params.costOfDebt,
      marketRiskPremium: params.marketRiskPremium,
      riskFreeRate: params.riskFreeRate,
      beta: params.beta
    };
    
    // Remove any undefined or null values to prevent API errors
    Object.keys(apiParams).forEach(key => {
      if (apiParams[key] === undefined || apiParams[key] === null || isNaN(apiParams[key])) {
        delete apiParams[key];
      }
    });
    
    const data = await invokeSupabaseFunction<any>('get-custom-dcf', { 
      symbol, 
      params: apiParams,
      type
    });
    
    if (!data) {
      console.error("No data returned from custom DCF API");
      throw new Error("Failed to fetch DCF data");
    }
    
    // Check if we received an error object
    if (data && typeof data === 'object' && 'error' in data) {
      console.error("Error from DCF API:", data.error, data.details);
      throw new Error(data.details || data.error || "DCF calculation failed");
    }
    
    if (!Array.isArray(data)) {
      console.error("Unexpected data format from custom DCF API:", data);
      throw new Error("Invalid response format from DCF service");
    }
    
    console.log(`Received ${data.length} DCF records for ${symbol}`);
    
    // Convert the FMP API response format to our application's expected format
    const transformedData: CustomDCFResult[] = data.map(item => ({
      year: String(item.year || new Date().getFullYear()),
      symbol: symbol,
      revenue: item.revenue || 0,
      revenuePercentage: item.revenuePercentage || 0,
      ebitda: item.ebitda || 0,
      ebitdaPercentage: item.ebitdaPercentage || 0,
      ebit: item.ebit || 0,
      ebitPercentage: item.ebitPercentage || 0,
      depreciation: item.depreciation || 0,
      capitalExpenditure: item.capitalExpenditure || 0,
      capitalExpenditurePercentage: item.capitalExpenditurePercentage || 0,
      price: item.price || item["Stock Price"] || 0,
      beta: item.beta || 0,
      dilutedSharesOutstanding: item.dilutedSharesOutstanding || 0,
      costofDebt: item.costofDebt || 0,
      taxRate: item.taxRate || 0,
      afterTaxCostOfDebt: item.afterTaxCostOfDebt || 0,
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
      operatingCashFlowPercentage: item.operatingCashFlowPercentage || 0
    }));
    
    // If the array is empty, we'll throw an error rather than using mock data
    if (transformedData.length === 0) {
      throw new Error("DCF calculation returned no data");
    }
    
    return transformedData;
  } catch (error) {
    console.error("Error fetching custom DCF:", error);
    
    // Show a toast with the error
    toast({
      title: "DCF Calculation Error",
      description: error instanceof Error ? error.message : String(error),
      variant: "destructive",
    });
    
    throw error;
  }
};

/**
 * Fetch custom levered DCF calculation based on user-defined parameters
 */
export const fetchCustomLeveredDCF = async (
  symbol: string, 
  params: CustomDCFParams
): Promise<CustomDCFResult[]> => {
  return fetchCustomDCF(symbol, params, DCFType.CUSTOM_LEVERED);
};
