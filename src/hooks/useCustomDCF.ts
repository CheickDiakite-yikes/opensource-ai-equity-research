
import { useState } from "react";
import { CustomDCFParams, CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { 
  fetchCustomDCF, 
  fetchStandardDCF, 
  fetchLeveredDCF, 
  fetchCustomLeveredDCF,
  DCFType 
} from "@/services/api/analysis/dcfService";

export const useCustomDCF = (symbol: string) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [customDCFResult, setCustomDCFResult] = useState<CustomDCFResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectedData, setProjectedData] = useState<YearlyDCFData[]>([]);

  /**
   * Calculate standard DCF
   */
  const calculateStandardDCF = async () => {
    try {
      setIsCalculating(true);
      setError(null);
      
      console.log("Fetching standard DCF for", symbol);
      
      const result = await fetchStandardDCF(symbol);
      
      if (result && Array.isArray(result) && result.length > 0) {
        console.log("Received standard DCF results:", result);
        
        // Transform the data for our UI
        const dcfResult: CustomDCFResult = {
          year: new Date().getFullYear().toString(),
          symbol: symbol,
          revenue: 0,
          revenuePercentage: 0,
          ebitda: 0,
          ebitdaPercentage: 0,
          ebit: 0,
          ebitPercentage: 0,
          depreciation: 0,
          capitalExpenditure: 0,
          capitalExpenditurePercentage: 0,
          price: result[0]["Stock Price"] || 0,
          beta: 0,
          dilutedSharesOutstanding: 0,
          costofDebt: 0,
          taxRate: 0,
          afterTaxCostOfDebt: 0,
          riskFreeRate: 0,
          marketRiskPremium: 0,
          costOfEquity: 0,
          totalDebt: 0,
          totalEquity: 0,
          totalCapital: 0,
          debtWeighting: 0,
          equityWeighting: 0,
          wacc: 0,
          operatingCashFlow: 0,
          pvLfcf: 0,
          sumPvLfcf: 0,
          longTermGrowthRate: 0,
          freeCashFlow: 0,
          terminalValue: 0,
          presentTerminalValue: 0,
          enterpriseValue: 0,
          netDebt: 0,
          equityValue: 0,
          equityValuePerShare: result[0].dcf || 0,
          freeCashFlowT1: 0,
          operatingCashFlowPercentage: 0
        };
        
        setCustomDCFResult(dcfResult);
        
        // Since standard DCF doesn't provide yearly projection data, 
        // we'll create a simple placeholder
        setProjectedData([{
          year: new Date().getFullYear().toString(),
          revenue: 0,
          ebit: 0,
          ebitda: 0,
          freeCashFlow: 0,
          operatingCashFlow: 0,
          capitalExpenditure: 0
        }]);
      } else {
        console.error("Invalid or empty result from standard DCF:", result);
        setError("Failed to calculate standard DCF. Please try again later.");
      }
    } catch (err) {
      console.error("Error calculating standard DCF:", err);
      setError(`An error occurred during calculation: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * Calculate levered DCF
   */
  const calculateLeveredDCF = async (limit?: number) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      console.log("Fetching levered DCF for", symbol);
      
      const result = await fetchLeveredDCF(symbol, limit);
      
      if (result && Array.isArray(result) && result.length > 0) {
        console.log("Received levered DCF results:", result);
        
        // Transform the data for our UI
        const dcfResult: CustomDCFResult = {
          year: new Date().getFullYear().toString(),
          symbol: symbol,
          revenue: 0,
          revenuePercentage: 0,
          ebitda: 0,
          ebitdaPercentage: 0,
          ebit: 0,
          ebitPercentage: 0,
          depreciation: 0,
          capitalExpenditure: 0,
          capitalExpenditurePercentage: 0,
          price: result[0]["Stock Price"] || 0,
          beta: 0,
          dilutedSharesOutstanding: 0,
          costofDebt: 0,
          taxRate: 0,
          afterTaxCostOfDebt: 0,
          riskFreeRate: 0,
          marketRiskPremium: 0,
          costOfEquity: 0,
          totalDebt: 0,
          totalEquity: 0,
          totalCapital: 0,
          debtWeighting: 0,
          equityWeighting: 0,
          wacc: 0,
          operatingCashFlow: 0,
          pvLfcf: 0,
          sumPvLfcf: 0,
          longTermGrowthRate: 0,
          freeCashFlow: 0,
          terminalValue: 0,
          presentTerminalValue: 0,
          enterpriseValue: 0,
          netDebt: 0,
          equityValue: 0,
          equityValuePerShare: result[0].dcf || 0,
          freeCashFlowT1: 0,
          operatingCashFlowPercentage: 0
        };
        
        setCustomDCFResult(dcfResult);
        
        // Since levered DCF might not provide yearly projection data,
        // we'll create a simple placeholder or transform any data we have
        setProjectedData([{
          year: new Date().getFullYear().toString(),
          revenue: 0,
          ebit: 0,
          ebitda: 0,
          freeCashFlow: 0,
          operatingCashFlow: 0,
          capitalExpenditure: 0
        }]);
      } else {
        console.error("Invalid or empty result from levered DCF:", result);
        setError("Failed to calculate levered DCF. Please try again later.");
      }
    } catch (err) {
      console.error("Error calculating levered DCF:", err);
      setError(`An error occurred during calculation: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * Calculate custom DCF
   */
  const calculateCustomDCF = async (params: CustomDCFParams, type: DCFType = DCFType.CUSTOM_ADVANCED) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      // Add the symbol to the params if not already included
      const paramsWithSymbol = { ...params, symbol };
      
      console.log(`Sending ${type} DCF calculation request with parameters:`, paramsWithSymbol);
      
      let result;
      if (type === DCFType.CUSTOM_LEVERED) {
        result = await fetchCustomLeveredDCF(symbol, paramsWithSymbol);
      } else {
        result = await fetchCustomDCF(symbol, paramsWithSymbol, type);
      }
      
      if (result && Array.isArray(result) && result.length > 0) {
        console.log(`Received ${type} DCF results:`, result);
        
        // The API returns an array, but we'll use the first item as our primary result
        // Usually the first item is the furthest future projection
        const dcfResult = result[0];
        
        // For the projected data, we'll use all items in the result array
        // since they represent yearly projections
        const yearly: YearlyDCFData[] = result.map(item => ({
          year: item.year,
          revenue: item.revenue || 0,
          ebit: item.ebit || 0,
          ebitda: item.ebitda || 0,
          freeCashFlow: item.freeCashFlow || 0,
          operatingCashFlow: item.operatingCashFlow || 0,
          capitalExpenditure: item.capitalExpenditure || 0
        }));
        
        setCustomDCFResult(dcfResult);
        setProjectedData(yearly);
      } else {
        console.error(`Invalid or empty result from ${type} DCF:`, result);
        setError(`Failed to calculate ${type} DCF. Please check the parameters and try again.`);
      }
    } catch (err) {
      console.error(`Error calculating ${type} DCF:`, err);
      setError(`An error occurred during calculation: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calculateStandardDCF,
    calculateLeveredDCF,
    calculateCustomDCF,
    customDCFResult,
    projectedData,
    isCalculating,
    error
  };
};
