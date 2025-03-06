
import { useState } from "react";
import { fetchStandardDCF } from "@/services/api/analysis/dcf/standardDCFService";
import { CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { toast } from "@/components/ui/use-toast";

export const useStandardDCF = (symbol: string) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CustomDCFResult | null>(null);
  const [projectedData, setProjectedData] = useState<YearlyDCFData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const calculateStandardDCF = async () => {
    try {
      setIsCalculating(true);
      setError(null);
      
      console.log("Fetching standard DCF for", symbol);
      
      const apiResult = await fetchStandardDCF(symbol);
      
      if (apiResult && Array.isArray(apiResult) && apiResult.length > 0) {
        console.log("Received standard DCF results:", apiResult);
        
        // Use the first result as our DCF result
        const dcfData = apiResult[0];
        
        // Transform to CustomDCFResult format
        const dcfResult: CustomDCFResult = {
          year: dcfData.year || new Date().getFullYear().toString(),
          symbol: symbol,
          equityValuePerShare: dcfData.equityValuePerShare || dcfData.dcf || 0,
          enterpriseValue: dcfData.enterpriseValue || 0,
          equityValue: dcfData.equityValue || 0,
          totalDebt: dcfData.totalDebt || 0,
          cashAndCashEquivalents: dcfData.cashAndCashEquivalents || dcfData.totalCash || 0,
          wacc: dcfData.wacc || 0,
          taxRate: dcfData.taxRate || 0,
          revenuePercentage: dcfData.revenuePercentage || 0,
          longTermGrowthRate: dcfData.longTermGrowthRate || 0,
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
          costofDebt: dcfData.costofDebt || dcfData.costOfDebt || 0,
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
        
        setResult(dcfResult);
        
        // Create projected data for 5 years based on the growth assumptions
        const yearlyData: YearlyDCFData[] = [];
        const baseYear = parseInt(dcfData.year) || new Date().getFullYear();
        const growthRate = (dcfData.revenuePercentage || 0) / 100;
        
        for (let i = 0; i < 5; i++) {
          const yearFactor = Math.pow(1 + growthRate, i);
          yearlyData.push({
            year: (baseYear + i).toString(),
            revenue: dcfData.revenue * yearFactor,
            ebit: dcfData.ebit * yearFactor,
            ebitda: dcfData.ebitda * yearFactor,
            freeCashFlow: (dcfData.freeCashFlow || dcfData.ufcf || 0) * yearFactor,
            operatingCashFlow: (dcfData.operatingCashFlow || 0) * yearFactor,
            capitalExpenditure: (dcfData.capitalExpenditure || 0) * yearFactor
          });
        }
        
        setProjectedData(yearlyData);
        
        console.log("Processed DCF result:", dcfResult);
        console.log("Created projected data:", yearlyData);
        
        toast({
          title: "DCF Calculation Complete",
          description: `Intrinsic value per share: $${dcfResult.equityValuePerShare.toFixed(2)}`,
        });
        
        return { dcfResult, yearlyData };
      } else {
        console.error("Invalid or empty result from standard DCF:", apiResult);
        setError("Failed to calculate standard DCF. Please try again later.");
        
        toast({
          title: "DCF Calculation Failed",
          description: "Failed to calculate the DCF value. Using estimated values.",
          variant: "destructive",
        });
        
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error("Error calculating standard DCF:", errorMessage);
      setError(`An error occurred during calculation: ${errorMessage}`);
      
      toast({
        title: "DCF Calculation Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calculateStandardDCF,
    result,
    projectedData,
    isCalculating,
    error
  };
};
