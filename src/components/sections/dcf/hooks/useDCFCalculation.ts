
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
      const contentType = result.headers.get('content-type');
      
      // Verify we received JSON
      if (!contentType || !contentType.includes('application/json')) {
        console.error("Invalid content type received:", contentType);
        const errorText = await result.text();
        console.error("Response content:", errorText);
        throw new Error("Invalid response format from server");
      }

      const data = await result.json();
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error("Empty response from DCF calculation");
      }
      
      // Extract the first item if response is an array
      const dcfData = Array.isArray(data) ? data[0] : data;
      
      console.log("Received DCF result:", dcfData);
      
      // Check if we received a valid DCF result
      if (dcfData && typeof dcfData === 'object') {
        // Map the API response to our CustomDCFResult type
        const dcfResult: CustomDCFResult = {
          year: dcfData.year || new Date().getFullYear().toString(),
          symbol: symbol,
          // Revenue and growth metrics
          revenue: dcfData.revenue || 0,
          revenuePercentage: dcfData.revenuePercentage || 0,
          // EBITDA metrics
          ebitda: dcfData.ebitda || 0,
          ebitdaPercentage: dcfData.ebitdaPercentage || 0,
          // EBIT metrics
          ebit: dcfData.ebit || 0,
          ebitPercentage: dcfData.ebitPercentage || 0,
          // Depreciation
          depreciation: dcfData.depreciation || 0,
          // Capital expenditure
          capitalExpenditure: dcfData.capitalExpenditure || 0,
          capitalExpenditurePercentage: dcfData.capitalExpenditurePercentage || 0,
          // Stock info
          price: dcfData.price || 0,
          beta: dcfData.beta || 0,
          dilutedSharesOutstanding: dcfData.dilutedSharesOutstanding || 0,
          // Debt and cost metrics
          costofDebt: dcfData.costofDebt || 0,
          taxRate: dcfData.taxRate || 0,
          afterTaxCostOfDebt: dcfData.afterTaxCostOfDebt || 0,
          // Risk metrics
          riskFreeRate: dcfData.riskFreeRate || 0,
          marketRiskPremium: dcfData.marketRiskPremium || 0,
          costOfEquity: dcfData.costOfEquity || 0,
          // Capital structure
          totalDebt: dcfData.totalDebt || 0,
          totalEquity: dcfData.totalEquity || 0,
          totalCapital: dcfData.totalCapital || 0,
          debtWeighting: dcfData.debtWeighting || 0,
          equityWeighting: dcfData.equityWeighting || 0,
          // WACC and cash flow metrics
          wacc: dcfData.wacc || 0,
          operatingCashFlow: dcfData.operatingCashFlow || 0,
          operatingCashFlowPercentage: dcfData.operatingCashFlowPercentage || 0,
          // DCF calculation components
          pvLfcf: dcfData.pvLfcf || 0,
          sumPvLfcf: dcfData.sumPvLfcf || 0,
          longTermGrowthRate: dcfData.longTermGrowthRate || 0,
          freeCashFlow: dcfData.freeCashFlow || dcfData.ufcf || 0,
          terminalValue: dcfData.terminalValue || 0,
          presentTerminalValue: dcfData.presentTerminalValue || 0,
          // Final valuation
          enterpriseValue: dcfData.enterpriseValue || 0,
          netDebt: dcfData.netDebt || 0,
          equityValue: dcfData.equityValue || 0,
          equityValuePerShare: dcfData.equityValuePerShare || 0,
          freeCashFlowT1: dcfData.freeCashFlowT1 || 0,
          // Cash and cash equivalents
          cashAndCashEquivalents: dcfData.cashAndCashEquivalents || dcfData.totalCash || 0
        };
        
        setDcfResult(dcfResult);
        toast({
          title: "DCF Calculation Complete",
          description: `Intrinsic value per share: $${dcfResult.equityValuePerShare?.toFixed(2)}`,
        });
        
        // Create projected cash flow data
        // If we're using the FMP API, we need to generate the yearly projections ourselves
        const generatedProjections = generateProjectedData(dcfResult);
        setProjectedData(generatedProjections);
        
        setUsingMockData(false);
        return true;
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
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);
  
  // Helper function to generate projected data based on growth assumptions
  const generateProjectedData = (result: CustomDCFResult): YearlyDCFData[] => {
    const currentYear = new Date().getFullYear();
    const projectionYears = 5;
    
    // Get growth rates from the DCF result
    const revenueGrowthRate = result.revenuePercentage / 100;
    const ebitdaGrowthRate = revenueGrowthRate; // Assuming EBITDA grows at the same rate as revenue
    
    return Array.from({ length: projectionYears }, (_, i) => {
      const year = (currentYear + i).toString();
      const growthFactor = Math.pow(1 + revenueGrowthRate, i);
      
      // Calculate values for each year based on growth rates
      const revenue = result.revenue * growthFactor;
      const ebitda = result.ebitdaPercentage ? (revenue * (result.ebitdaPercentage / 100)) : (result.ebitda * growthFactor);
      const ebit = result.ebitPercentage ? (revenue * (result.ebitPercentage / 100)) : (result.ebit * growthFactor);
      const capitalExpenditure = result.capitalExpenditurePercentage ? 
        (revenue * (result.capitalExpenditurePercentage / 100)) : 
        (result.capitalExpenditure * growthFactor);
      const operatingCashFlow = result.operatingCashFlowPercentage ? 
        (revenue * (result.operatingCashFlowPercentage / 100)) : 
        (result.operatingCashFlow * growthFactor);
      const freeCashFlow = operatingCashFlow - Math.abs(capitalExpenditure);
      
      return {
        year,
        revenue,
        ebit,
        ebitda,
        freeCashFlow,
        operatingCashFlow,
        capitalExpenditure: -Math.abs(capitalExpenditure) // CapEx is typically negative in cash flow statements
      };
    });
  };
  
  // Function to calculate DCF with AI assumptions
  const calculateDCFWithAIAssumptions = useCallback((assumptions: any, financials: any[]) => {
    try {
      if (!assumptions || !assumptions.assumptions) {
        throw new Error("Invalid assumptions data");
      }
      
      // Extract values from AI assumptions and prepare inputs for DCF calculation
      const inputs: Partial<DCFInputs> = {
        // Pass percentages as they are - they'll be converted in the calculation utility
        revenuePercentage: assumptions.assumptions.revenueGrowthPct,
        ebitdaPercentage: assumptions.assumptions.ebitdaMarginPct,
        capitalExpenditurePercentage: assumptions.assumptions.capitalExpenditurePct,
        taxRate: assumptions.assumptions.taxRatePct,
        // Pass these as-is - they'll be converted to decimals as needed
        longTermGrowthRate: assumptions.assumptions.longTermGrowthRatePct * 100, // Convert to whole number
        beta: assumptions.assumptions.beta,
        costOfEquity: assumptions.assumptions.costOfEquityPct * 100, // Convert to whole number
        costOfDebt: assumptions.assumptions.costOfDebtPct * 100, // Convert to whole number
        marketRiskPremium: assumptions.assumptions.marketRiskPremiumPct * 100, // Convert to whole number
        riskFreeRate: assumptions.assumptions.riskFreeRatePct * 100, // Convert to whole number
        // Additional parameters with corrected property names
        depreciationAndAmortizationPercentage: assumptions.assumptions.depreciationAndAmortizationPct,
        operatingCashFlowPercentage: assumptions.assumptions.operatingCashFlowPct,
        ebitPercentage: assumptions.assumptions.ebitPct,
        cashAndShortTermInvestmentsPercentage: assumptions.assumptions.cashAndShortTermInvestmentsPct,
        receivablesPercentage: assumptions.assumptions.receivablesPct,
        inventoriesPercentage: assumptions.assumptions.inventoriesPct,
        payablesPercentage: assumptions.assumptions.payablePct,
        sellingGeneralAndAdministrativeExpensesPercentage: assumptions.assumptions.sellingGeneralAndAdministrativeExpensesPct
      };
      
      console.log("Calculating DCF with AI-derived inputs:", inputs);
      return calculateDCF(inputs);
    } catch (err) {
      console.error("Error in calculateDCFWithAIAssumptions:", err);
      toast({
        title: "Error Preparing DCF Calculation",
        description: "Could not prepare calculation inputs from AI assumptions",
        variant: "destructive",
      });
      setUsingMockData(true);
      return false;
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
