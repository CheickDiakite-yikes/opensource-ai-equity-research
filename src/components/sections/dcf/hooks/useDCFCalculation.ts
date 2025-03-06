
import { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { calculateCustomDCF } from "@/utils/financial/dcfCalculationUtils";
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
      
      // Check if we received a successful response
      if (!result.ok && result.status !== 200) {
        throw new Error(`DCF calculation failed with status: ${result.status}`);
      }
      
      const contentType = result.headers.get('content-type');
      const isMockData = result.headers.get('X-Mock-Data') === 'true';
      
      // Verify we received JSON
      if (!contentType || !contentType.includes('application/json')) {
        console.error("Invalid content type received:", contentType);
        throw new Error("Invalid response format from server");
      }

      const data = await result.json();
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error("Empty response from DCF calculation");
      }
      
      // Check if the response contains an error property
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Extract the first item if response is an array
      const dcfData = Array.isArray(data) ? data[0] : data;
      
      console.log("Received DCF result:", dcfData);
      
      // Add null check before accessing properties
      if (dcfData && typeof dcfData === 'object') {
        const dcfResult: CustomDCFResult = {
          year: dcfData.year || new Date().getFullYear().toString(),
          symbol: symbol,
          equityValuePerShare: dcfData.equityValuePerShare || dcfData.dcf || 0,
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
        setUsingMockData(isMockData);
        
        if (isMockData) {
          toast({
            title: "Using estimated DCF values",
            description: "The calculation is based on typical industry assumptions rather than real-time data.",
          });
        } else {
          toast({
            title: "DCF Calculation Complete",
            description: `Intrinsic value per share: $${dcfResult.equityValuePerShare?.toFixed(2)}`,
          });
        }
        
        // Extract projected data if available
        if (Array.isArray(data) && data.length > 0) {
          const yearlyData = data.map(item => ({
            year: item.year || new Date().getFullYear().toString(),
            revenue: item.revenue || 0,
            ebit: item.ebit || 0,
            ebitda: item.ebitda || 0,
            freeCashFlow: item.freeCashFlow || (item.operatingCashFlow ? item.operatingCashFlow - Math.abs(item.capitalExpenditure || 0) : 0),
            operatingCashFlow: item.operatingCashFlow || 0,
            capitalExpenditure: item.capitalExpenditure || 0
          }));
          
          setProjectedData(yearlyData);
        } else {
          // Generate projected data based on growth assumptions if not provided
          const generatedProjections = generateProjectedData(dcfResult);
          setProjectedData(generatedProjections);
        }
      } else {
        throw new Error("Invalid response format from DCF calculation");
      }
    } catch (error: any) {
      console.error("DCF calculation error:", error);
      setError(error.message || "Failed to calculate DCF");
      toast({
        title: "DCF Calculation Warning",
        description: error.message || "Using estimated values based on typical assumptions",
        variant: "destructive",
      });
      setUsingMockData(true);
      
      // Generate default result and projections
      const defaultResult = createDefaultDCFResult(symbol);
      const defaultProjections = generateProjectedData(defaultResult);
      
      setDcfResult(defaultResult);
      setProjectedData(defaultProjections);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);
  
  // Helper function to generate projected data if not provided
  const generateProjectedData = (result: CustomDCFResult): YearlyDCFData[] => {
    const currentYear = new Date().getFullYear();
    const projectionYears = 5;
    const growthRate = result.revenuePercentage ? result.revenuePercentage / 100 : 0.085;
    
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
  
  // Create default DCF result for fallback
  const createDefaultDCFResult = (symbol: string): CustomDCFResult => {
    return {
      year: new Date().getFullYear().toString(),
      symbol: symbol,
      equityValuePerShare: 115,
      revenue: 100000000,
      revenuePercentage: 8.5,
      ebitda: 31270000,
      ebitdaPercentage: 31.27,
      ebit: 27810000,
      ebitPercentage: 27.81,
      depreciation: 3450000,
      capitalExpenditure: 3060000,
      capitalExpenditurePercentage: 3.06,
      price: 100,
      beta: 1.244,
      dilutedSharesOutstanding: 1000000,
      costofDebt: 0.0364,
      taxRate: 0.21,
      afterTaxCostOfDebt: 0.0364 * (1 - 0.21),
      riskFreeRate: 0.0364,
      marketRiskPremium: 0.0472,
      costOfEquity: 0.0951,
      totalDebt: 30000000,
      totalEquity: 70000000,
      totalCapital: 100000000,
      debtWeighting: 0.3,
      equityWeighting: 0.7,
      wacc: 0.095,
      operatingCashFlow: 28860000,
      pvLfcf: 0,
      sumPvLfcf: 0,
      longTermGrowthRate: 0.03,
      freeCashFlow: 25800000,
      terminalValue: 645000000,
      presentTerminalValue: 0,
      enterpriseValue: 150000000,
      netDebt: 10000000,
      equityValue: 140000000,
      cashAndCashEquivalents: 20000000,
      freeCashFlowT1: 26574000,
      operatingCashFlowPercentage: 28.86
    };
  };
  
  // New function to calculate DCF with AI assumptions
  const calculateDCFWithAIAssumptions = useCallback((assumptions: any, financials: any[]) => {
    try {
      if (!assumptions || !assumptions.assumptions) {
        throw new Error("Invalid assumptions data");
      }
      
      // Extract values from AI assumptions and prepare inputs for DCF calculation
      const inputs: Partial<DCFInputs> = {
        revenuePercentage: assumptions.assumptions.revenueGrowthPct * 100,
        ebitdaPercentage: assumptions.assumptions.ebitdaMarginPct * 100,
        capitalExpenditurePercentage: assumptions.assumptions.capitalExpenditurePct * 100,
        taxRate: assumptions.assumptions.taxRatePct,
        longTermGrowthRate: assumptions.assumptions.longTermGrowthRatePct * 100, // Provide as percentage
        beta: assumptions.assumptions.beta,
        costOfEquity: assumptions.assumptions.costOfEquityPct * 100, // Provide as percentage
        costOfDebt: assumptions.assumptions.costOfDebtPct * 100, // Provide as percentage
        marketRiskPremium: assumptions.assumptions.marketRiskPremiumPct * 100, // Provide as percentage
        riskFreeRate: assumptions.assumptions.riskFreeRatePct * 100 // Provide as percentage
      };
      
      console.log("Calculating DCF with AI-derived inputs:", inputs);
      calculateDCF(inputs);
    } catch (err) {
      console.error("Error in calculateDCFWithAIAssumptions:", err);
      toast({
        title: "Error Preparing DCF Calculation",
        description: "Using default assumptions for DCF calculation",
        variant: "destructive",
      });
      setUsingMockData(true);
      
      // Fall back to basic calculation
      calculateDCF();
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
