
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
      const result = await calculateCustomDCF(symbol, customInputs);
      const contentType = result.headers.get('content-type');
      
      // Verify we received JSON
      if (!contentType || !contentType.includes('application/json')) {
        console.error("Invalid content type received:", contentType);
        const errorText = await result.text();
        console.error("Response content:", errorText);
        throw new Error("Invalid response format from server");
      }

      const data = await result.json();
      
      // Add null check before accessing properties
      if (data && typeof data === 'object') {
        const dcfResult: CustomDCFResult = {
          year: data.year || new Date().getFullYear().toString(),
          symbol: symbol,
          equityValuePerShare: data.equityValuePerShare || 0,
          enterpriseValue: data.enterpriseValue || 0,
          equityValue: data.equityValue || 0,
          totalDebt: data.totalDebt || 0,
          cashAndCashEquivalents: data.cashAndCashEquivalents || 0,
          wacc: data.wacc || 0.09,
          taxRate: data.taxRate || 0.21,
          revenuePercentage: data.revenuePercentage || 8.5,
          longTermGrowthRate: data.longTermGrowthRate || 0.03,
          // Add all required properties from CustomDCFResult interface
          revenue: data.revenue || 0,
          ebitda: data.ebitda || 0,
          ebitdaPercentage: data.ebitdaPercentage || 0,
          ebit: data.ebit || 0,
          ebitPercentage: data.ebitPercentage || 0,
          depreciation: data.depreciation || 0,
          capitalExpenditure: data.capitalExpenditure || 0,
          capitalExpenditurePercentage: data.capitalExpenditurePercentage || 0,
          price: data.price || 0,
          beta: data.beta || 0,
          dilutedSharesOutstanding: data.dilutedSharesOutstanding || 0,
          costofDebt: data.costofDebt || 0,
          afterTaxCostOfDebt: data.afterTaxCostOfDebt || 0,
          riskFreeRate: data.riskFreeRate || 0,
          marketRiskPremium: data.marketRiskPremium || 0,
          costOfEquity: data.costOfEquity || 0,
          totalEquity: data.totalEquity || 0,
          totalCapital: data.totalCapital || 0,
          debtWeighting: data.debtWeighting || 0,
          equityWeighting: data.equityWeighting || 0,
          operatingCashFlow: data.operatingCashFlow || 0,
          pvLfcf: data.pvLfcf || 0,
          sumPvLfcf: data.sumPvLfcf || 0,
          freeCashFlow: data.freeCashFlow || 0,
          terminalValue: data.terminalValue || 0,
          presentTerminalValue: data.presentTerminalValue || 0,
          netDebt: data.netDebt || 0,
          freeCashFlowT1: data.freeCashFlowT1 || 0,
          operatingCashFlowPercentage: data.operatingCashFlowPercentage || 0
        };
        
        setDcfResult(dcfResult);
        toast({
          title: "DCF Calculation Complete",
          description: `Intrinsic value per share: $${dcfResult.equityValuePerShare?.toFixed(2)}`,
        });
        
        // Extract projected data if available
        if (Array.isArray(data.yearlyProjections) && data.yearlyProjections.length > 0) {
          setProjectedData(data.yearlyProjections);
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
  
  // New function to calculate DCF with AI assumptions
  const calculateDCFWithAIAssumptions = useCallback((assumptions: any, financials: any[]) => {
    try {
      // Extract values from AI assumptions and prepare inputs for DCF calculation
      const inputs: Partial<DCFInputs> = {
        revenuePercentage: assumptions?.assumptions.revenueGrowthPct * 100,
        ebitdaPercentage: assumptions?.assumptions.ebitdaMarginPct * 100,
        taxRate: assumptions?.assumptions.taxRatePct / 100,
        longTermGrowthRate: assumptions?.assumptions.longTermGrowthRatePct / 100,
        wacc: assumptions?.assumptions.costOfEquityPct / 100,
        beta: assumptions?.assumptions.beta
      };
      
      console.log("Calculating DCF with inputs:", inputs);
      calculateDCF(inputs);
    } catch (err) {
      console.error("Error in calculateDCFWithAIAssumptions:", err);
      toast({
        title: "Error Preparing DCF Calculation",
        description: "Could not prepare calculation inputs from AI assumptions",
        variant: "destructive",
      });
      setUsingMockData(true);
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
