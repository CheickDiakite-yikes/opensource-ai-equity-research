
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
          revenue: result[0].revenue || 0,
          revenuePercentage: 8.5,
          ebitda: result[0].ebitda || 0,
          ebitdaPercentage: 31.27,
          ebit: result[0].ebit || 0,
          ebitPercentage: 27.81,
          depreciation: result[0].depreciation || 0,
          capitalExpenditure: result[0].capitalExpenditure || 0,
          capitalExpenditurePercentage: 3.06,
          price: result[0]["Stock Price"] || 0,
          beta: 1.244,
          dilutedSharesOutstanding: result[0].dilutedSharesOutstanding || 0,
          costofDebt: 0.0364,
          taxRate: 0.21,
          afterTaxCostOfDebt: 0.0364 * (1 - 0.21),
          riskFreeRate: 0.0364,
          marketRiskPremium: 0.0472,
          costOfEquity: 0.0951,
          totalDebt: result[0].totalDebt || 0,
          totalEquity: result[0].totalEquity || 0,
          totalCapital: (result[0].totalDebt || 0) + (result[0].totalEquity || 0),
          debtWeighting: 0.3,
          equityWeighting: 0.7,
          wacc: 0.095,
          operatingCashFlow: result[0].operatingCashFlow || 0,
          pvLfcf: 0,
          sumPvLfcf: 0,
          longTermGrowthRate: 0.03,
          freeCashFlow: result[0].freeCashFlow || 0,
          terminalValue: 0,
          presentTerminalValue: 0,
          enterpriseValue: 0,
          netDebt: result[0].netDebt || 0,
          equityValue: 0,
          equityValuePerShare: result[0].dcf || 0,
          freeCashFlowT1: 0,
          operatingCashFlowPercentage: 28.86
        };
        
        setCustomDCFResult(dcfResult);
        
        // Create projected data for standard DCF
        const yearNow = new Date().getFullYear();
        setProjectedData([
          {
            year: yearNow.toString(),
            revenue: result[0].revenue || 0,
            ebit: result[0].ebit || 0,
            ebitda: result[0].ebitda || 0,
            freeCashFlow: result[0].freeCashFlow || 0,
            operatingCashFlow: result[0].operatingCashFlow || 0,
            capitalExpenditure: result[0].capitalExpenditure || 0
          },
          {
            year: (yearNow + 1).toString(),
            revenue: (result[0].revenue || 0) * 1.085,
            ebit: (result[0].ebit || 0) * 1.09,
            ebitda: (result[0].ebitda || 0) * 1.09,
            freeCashFlow: (result[0].freeCashFlow || 0) * 1.075,
            operatingCashFlow: (result[0].operatingCashFlow || 0) * 1.08,
            capitalExpenditure: (result[0].capitalExpenditure || 0) * 1.085
          }
        ]);
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
          revenue: result[0].revenue || 0,
          revenuePercentage: 8.5,
          ebitda: result[0].ebitda || 0,
          ebitdaPercentage: 31.27,
          ebit: result[0].ebit || 0,
          ebitPercentage: 27.81,
          depreciation: result[0].depreciation || 0,
          capitalExpenditure: result[0].capitalExpenditure || 0,
          capitalExpenditurePercentage: 3.06,
          price: result[0]["Stock Price"] || 0,
          beta: 1.244,
          dilutedSharesOutstanding: result[0].dilutedSharesOutstanding || 0,
          costofDebt: 0.0364,
          taxRate: 0.21,
          afterTaxCostOfDebt: 0.0364 * (1 - 0.21),
          riskFreeRate: 0.0364,
          marketRiskPremium: 0.0472,
          costOfEquity: 0.0951,
          totalDebt: result[0].totalDebt || 0,
          totalEquity: result[0].totalEquity || 0,
          totalCapital: (result[0].totalDebt || 0) + (result[0].totalEquity || 0),
          debtWeighting: 0.3,
          equityWeighting: 0.7,
          wacc: 0.095,
          operatingCashFlow: result[0].operatingCashFlow || 0,
          pvLfcf: 0,
          sumPvLfcf: 0,
          longTermGrowthRate: 0.03,
          freeCashFlow: result[0].freeCashFlow || 0,
          terminalValue: 0,
          presentTerminalValue: 0,
          enterpriseValue: 0,
          netDebt: result[0].netDebt || 0,
          equityValue: 0,
          equityValuePerShare: result[0].dcf || 0,
          freeCashFlowT1: 0,
          operatingCashFlowPercentage: 28.86
        };
        
        setCustomDCFResult(dcfResult);
        
        // Create projected data for levered DCF
        const yearNow = new Date().getFullYear();
        setProjectedData([
          {
            year: yearNow.toString(),
            revenue: result[0].revenue || 0,
            ebit: result[0].ebit || 0,
            ebitda: result[0].ebitda || 0,
            freeCashFlow: result[0].freeCashFlow || 0,
            operatingCashFlow: result[0].operatingCashFlow || 0,
            capitalExpenditure: result[0].capitalExpenditure || 0
          },
          {
            year: (yearNow + 1).toString(),
            revenue: (result[0].revenue || 0) * 1.085,
            ebit: (result[0].ebit || 0) * 1.09,
            ebitda: (result[0].ebitda || 0) * 1.09,
            freeCashFlow: (result[0].freeCashFlow || 0) * 1.075,
            operatingCashFlow: (result[0].operatingCashFlow || 0) * 1.08,
            capitalExpenditure: (result[0].capitalExpenditure || 0) * 1.085
          }
        ]);
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
        const dcfResult = result[0];
        
        // Populate FCF values correctly
        const yearly: YearlyDCFData[] = result.map(item => ({
          year: item.year,
          revenue: item.revenue || 0,
          ebit: item.ebit || 0,
          ebitda: item.ebitda || 0,
          freeCashFlow: item.freeCashFlow || 0,
          operatingCashFlow: item.operatingCashFlow || 0,
          capitalExpenditure: item.capitalExpenditure || 0
        }));
        
        // Sort the projections by year (ascending)
        const sortedYearly = yearly.sort((a, b) => {
          const yearA = parseInt(a.year);
          const yearB = parseInt(b.year);
          return yearA - yearB;
        });
        
        setCustomDCFResult(dcfResult);
        setProjectedData(sortedYearly);
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
