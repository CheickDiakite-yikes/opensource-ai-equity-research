
import { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { calculateCustomDCF } from "@/utils/financial";
import { 
  CustomDCFResult, 
  DCFInputs,
  YearlyDCFData
} from "@/types/ai-analysis/dcfTypes";

export function useDCFCalculation(symbol: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [dcfResult, setDcfResult] = useState<CustomDCFResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectedData, setProjectedData] = useState<YearlyDCFData[]>([]);
  const [usingMockData, setUsingMockData] = useState(false);

  const calculateDCF = useCallback(async (
    customInputs?: Partial<DCFInputs>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Starting DCF calculation for", symbol, "with inputs:", customInputs);
      const result = await calculateCustomDCF(symbol, customInputs);
      
      // Get response content type to check if we got JSON
      const contentType = result.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error("Invalid content type received:", contentType);
        const errorText = await result.text();
        console.error("Response content:", errorText);
        throw new Error("Invalid response format from server");
      }

      // Parse the JSON response
      const data = await result.json();
      
      // Check if we got an error response
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Check if we got an empty or invalid response
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error("Empty response from DCF calculation");
      }
      
      // Extract the first item if response is an array
      const dcfData = Array.isArray(data) ? data[0] : data;
      
      console.log("Received DCF result:", dcfData);
      
      // Add null check before accessing properties
      if (dcfData && typeof dcfData === 'object') {
        const dcfResult: CustomDCFResult = {
          year: dcfData.year || new Date().getFullYear().toString(),
          symbol: symbol,
          equityValuePerShare: dcfData.equityValuePerShare || 0,
          enterpriseValue: dcfData.enterpriseValue || 0,
          equityValue: dcfData.equityValue || 0,
          totalDebt: dcfData.totalDebt || 0,
          cashAndCashEquivalents: dcfData.cashAndCashEquivalents || dcfData.totalCash || 0,
          wacc: dcfData.wacc || 0.09,
          taxRate: dcfData.taxRate || 0.21,
          revenuePercentage: dcfData.revenuePercentage || 8.5,
          longTermGrowthRate: dcfData.longTermGrowthRate || 0.03,
          // Add all required properties from CustomDCFResult interface
          revenue: dcfData.revenue || 0,
          ebitda: dcfData.ebitda || 0,
          ebitdaPercentage: dcfData.ebitdaPercentage || 0,
          ebit: dcfData.ebit || 0,
          ebitPercentage: dcfData.ebitPercentage || 0,
          depreciation: dcfData.depreciation || 0,
          capitalExpenditure: dcfData.capitalExpenditure || 0,
          capitalExpenditurePercentage: dcfData.capitalExpenditurePercentage || 0,
          price: dcfData.price || 0,
          beta: dcfData.beta || 0,
          dilutedSharesOutstanding: dcfData.dilutedSharesOutstanding || 0,
          costofDebt: dcfData.costofDebt || 0,
          afterTaxCostOfDebt: dcfData.afterTaxCostOfDebt || 0,
          riskFreeRate: dcfData.riskFreeRate || 0,
          marketRiskPremium: dcfData.marketRiskPremium || 0,
          costOfEquity: dcfData.costOfEquity || 0,
          totalEquity: dcfData.totalEquity || 0,
          totalCapital: dcfData.totalCapital || 0,
          debtWeighting: dcfData.debtWeighting || 0,
          equityWeighting: dcfData.equityWeighting || 0,
          operatingCashFlow: dcfData.operatingCashFlow || 0,
          pvLfcf: dcfData.pvLfcf || 0,
          sumPvLfcf: dcfData.sumPvLfcf || 0,
          freeCashFlow: dcfData.freeCashFlow || dcfData.ufcf || 0,
          terminalValue: dcfData.terminalValue || 0,
          presentTerminalValue: dcfData.presentTerminalValue || 0,
          netDebt: dcfData.netDebt || 0,
          freeCashFlowT1: dcfData.freeCashFlowT1 || 0,
          operatingCashFlowPercentage: dcfData.operatingCashFlowPercentage || 0
        };
        
        setDcfResult(dcfResult);
        toast({
          title: "DCF Calculation Complete",
          description: `Intrinsic value per share: $${dcfResult.equityValuePerShare?.toFixed(2)}`,
        });
        
        // Extract projected data if available
        if (Array.isArray(dcfData.yearlyProjections) && dcfData.yearlyProjections.length > 0) {
          setProjectedData(dcfData.yearlyProjections);
        } else if (Array.isArray(data) && data.length > 1) {
          // If data is an array with multiple years, use that as projections
          const projections = data.map(item => ({
            year: item.year || '',
            revenue: item.revenue || 0,
            ebit: item.ebit || 0,
            ebitda: item.ebitda || 0,
            freeCashFlow: item.freeCashFlow || item.ufcf || 0,
            operatingCashFlow: item.operatingCashFlow || 0,
            capitalExpenditure: item.capitalExpenditure || 0
          }));
          setProjectedData(projections);
        } else {
          // Generate projected data based on growth assumptions if not provided
          const generatedProjections = generateProjectedData(dcfResult);
          setProjectedData(generatedProjections);
        }
        
        setUsingMockData(false);
      } else {
        throw new Error("Invalid response format from DCF calculation");
      }
    } catch (error: any) {
      console.error("DCF calculation error:", error);
      setError(error.message || "Failed to calculate DCF");
      toast({
        title: "DCF Calculation Error",
        description: error.message || "Failed to calculate DCF",
        variant: "destructive",
      });
      setUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);
  
  // Helper function to generate projected data if not provided
  const generateProjectedData = (result: CustomDCFResult): YearlyDCFData[] => {
    const currentYear = new Date().getFullYear();
    const projectionYears = 5;
    const growthRate = result.revenuePercentage / 100;
    
    return Array.from({ length: projectionYears }, (_, i) => {
      const year = (currentYear + i).toString();
      const growthFactor = Math.pow(1 + growthRate, i);
      
      return {
        year,
        revenue: result.revenue * growthFactor,
        ebit: result.ebit * growthFactor,
        ebitda: result.ebitda * growthFactor,
        freeCashFlow: result.freeCashFlow * growthFactor,
        operatingCashFlow: result.operatingCashFlow * growthFactor,
        capitalExpenditure: result.capitalExpenditure * growthFactor
      };
    });
  };
  
  // Function to calculate DCF with AI assumptions
  const calculateDCFWithAIAssumptions = useCallback((assumptions: any, financials: any[]) => {
    try {
      if (!assumptions || !assumptions.assumptions) {
        throw new Error("Invalid assumptions data");
      }
      
      console.log("Converting AI assumptions to DCF input parameters...");
      
      // Extract values from AI assumptions and prepare inputs for DCF calculation
      const inputs: Partial<DCFInputs> = {
        // Convert percentages to actual numbers the API expects
        revenuePercentage: assumptions.assumptions.revenueGrowthPct * 100,
        ebitdaPercentage: assumptions.assumptions.ebitdaMarginPct * 100,
        capitalExpenditurePercentage: assumptions.assumptions.capitalExpenditurePct * 100,
        taxRate: assumptions.assumptions.taxRatePct,
        longTermGrowthRate: assumptions.assumptions.longTermGrowthRatePct,
        beta: assumptions.assumptions.beta,
        costOfEquity: assumptions.assumptions.costOfEquityPct * 100,
        costOfDebt: assumptions.assumptions.costOfDebtPct * 100,
        marketRiskPremium: assumptions.assumptions.marketRiskPremiumPct * 100,
        riskFreeRate: assumptions.assumptions.riskFreeRatePct * 100
      };
      
      console.log("Calculating DCF with AI-derived inputs:", inputs);
      calculateDCF(inputs);
    } catch (err) {
      console.error("Error in calculateDCFWithAIAssumptions:", err);
      toast({
        title: "Error Preparing DCF Calculation",
        description: "Could not prepare calculation inputs from AI assumptions",
        variant: "destructive",
      });
      setUsingMockData(true);
      
      // Re-throw the error so the caller can handle it
      throw err;
    }
  }, [calculateDCF]);

  return {
    isLoading,
    dcfResult,
    error,
    calculateDCF,
    projectedData,
    usingMockData,
    setUsingMockData,
    calculateDCFWithAIAssumptions
  };
}
