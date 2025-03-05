
import { useState } from "react";
import { CustomDCFParams, CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { 
  fetchCustomDCF, 
  fetchStandardDCF, 
  fetchLeveredDCF, 
  fetchCustomLeveredDCF,
  DCFType 
} from "@/services/api/analysis/dcfService";
import { toast } from "@/components/ui/use-toast";

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
        const currentYear = new Date().getFullYear();
        const projectionYears = Array.from({length: 5}, (_, i) => currentYear + i);
        
        const baseRevenue = result[0].revenue || 1000000000;
        const baseEbit = result[0].ebit || baseRevenue * 0.2;
        const baseEbitda = result[0].ebitda || baseRevenue * 0.25;
        const baseFcf = result[0].freeCashFlow || baseRevenue * 0.15;
        const baseOcf = result[0].operatingCashFlow || baseRevenue * 0.2;
        const baseCapex = result[0].capitalExpenditure || baseRevenue * 0.05;
        
        const yearlyData = projectionYears.map((year, index) => {
          const growthFactor = Math.pow(1.085, index);
          return {
            year: year.toString(),
            revenue: baseRevenue * growthFactor,
            ebit: baseEbit * growthFactor,
            ebitda: baseEbitda * growthFactor,
            freeCashFlow: baseFcf * growthFactor,
            operatingCashFlow: baseOcf * growthFactor,
            capitalExpenditure: baseCapex * growthFactor
          };
        });
        
        setProjectedData(yearlyData);
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
      
      const result = await fetchLeveredDCF(symbol, limit || 10);
      
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
        const currentYear = new Date().getFullYear();
        const projectionYears = Array.from({length: 5}, (_, i) => currentYear + i);
        
        const baseRevenue = result[0].revenue || 1000000000;
        const baseEbit = result[0].ebit || baseRevenue * 0.2;
        const baseEbitda = result[0].ebitda || baseRevenue * 0.25;
        const baseFcf = result[0].freeCashFlow || baseRevenue * 0.15;
        const baseOcf = result[0].operatingCashFlow || baseRevenue * 0.2;
        const baseCapex = result[0].capitalExpenditure || baseRevenue * 0.05;
        
        const yearlyData = projectionYears.map((year, index) => {
          const growthFactor = Math.pow(1.085, index);
          return {
            year: year.toString(),
            revenue: baseRevenue * growthFactor,
            ebit: baseEbit * growthFactor,
            ebitda: baseEbitda * growthFactor,
            freeCashFlow: baseFcf * growthFactor,
            operatingCashFlow: baseOcf * growthFactor,
            capitalExpenditure: baseCapex * growthFactor
          };
        });
        
        setProjectedData(yearlyData);
      } else {
        console.error("Invalid or empty result from levered DCF:", result);
        setError("Failed to calculate levered DCF. Please try again later.");
        
        // Fallback to standard DCF if levered fails
        toast({
          title: "Trying standard DCF instead",
          description: "Levered DCF calculation failed. Attempting standard DCF calculation.",
        });
        
        await calculateStandardDCF();
      }
    } catch (err) {
      console.error("Error calculating levered DCF:", err);
      setError(`An error occurred during calculation: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Fallback to standard DCF if levered fails
      try {
        toast({
          title: "Trying standard DCF instead",
          description: "Levered DCF calculation failed. Attempting standard DCF calculation.",
        });
        
        await calculateStandardDCF();
      } catch (fallbackErr) {
        console.error("Fallback to standard DCF also failed:", fallbackErr);
      }
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
      try {
        if (type === DCFType.CUSTOM_LEVERED) {
          result = await fetchCustomLeveredDCF(symbol, paramsWithSymbol);
        } else {
          result = await fetchCustomDCF(symbol, paramsWithSymbol, type);
        }
      } catch (err) {
        console.error(`Error with ${type} DCF, trying standard DCF as fallback:`, err);
        // If custom DCF fails, try standard DCF
        return await calculateStandardDCF();
      }
      
      if (result && Array.isArray(result) && result.length > 0) {
        console.log(`Received ${type} DCF results:`, result);
        
        // The API returns an array, but we'll use the first item as our primary result
        const dcfResult = result[0];
        
        // Populate projected data with yearly values
        const currentYear = new Date().getFullYear();
        const projectionYears = Array.from({length: 5}, (_, i) => currentYear + i);
        
        // If we have multiple years in the result, use them directly
        let yearly: YearlyDCFData[] = [];
        
        if (result.length > 1) {
          // API returned multiple years of data
          yearly = result.map(item => ({
            year: item.year,
            revenue: item.revenue || 0,
            ebit: item.ebit || 0,
            ebitda: item.ebitda || 0,
            freeCashFlow: item.freeCashFlow || (item.operatingCashFlow ? item.operatingCashFlow - Math.abs(item.capitalExpenditure || 0) : 0),
            operatingCashFlow: item.operatingCashFlow || 0,
            capitalExpenditure: item.capitalExpenditure || 0
          }));
        } else {
          // Only single year data, project for next years
          const baseItem = result[0];
          const revenueGrowth = baseItem.revenuePercentage ? baseItem.revenuePercentage / 100 : params.revenueGrowthPct;
          
          yearly = projectionYears.map((year, index) => {
            const growthFactor = Math.pow(1 + revenueGrowth, index);
            return {
              year: year.toString(),
              revenue: (baseItem.revenue || 0) * growthFactor,
              ebit: (baseItem.ebit || 0) * growthFactor,
              ebitda: (baseItem.ebitda || 0) * growthFactor,
              freeCashFlow: (baseItem.freeCashFlow || 0) * growthFactor,
              operatingCashFlow: (baseItem.operatingCashFlow || 0) * growthFactor,
              capitalExpenditure: (baseItem.capitalExpenditure || 0) * growthFactor
            };
          });
        }
        
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
        
        // If custom DCF fails due to empty results, try standard DCF
        toast({
          title: "Trying standard DCF instead",
          description: `Custom ${type} DCF calculation returned no data. Using standard DCF calculation.`,
        });
        
        await calculateStandardDCF();
      }
    } catch (err) {
      console.error(`Error calculating ${type} DCF:`, err);
      setError(`An error occurred during calculation: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // If custom DCF fails with error, try standard DCF as fallback
      try {
        toast({
          title: "Trying standard DCF instead",
          description: "Custom DCF calculation failed. Using standard DCF calculation.",
        });
        
        await calculateStandardDCF();
      } catch (fallbackErr) {
        console.error("Fallback to standard DCF also failed:", fallbackErr);
      }
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
