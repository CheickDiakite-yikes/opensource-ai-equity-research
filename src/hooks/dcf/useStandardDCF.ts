
import { useState } from "react";
import { fetchStandardDCF } from "@/services/api/analysis/dcf/standardDCFService";
import { CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { toast } from "@/components/ui/use-toast";
import { createProjectedData } from "./dcfCalculationUtils";

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
        const dcfResult = apiResult[0];
        
        // Make sure we have required values
        if (dcfResult && typeof dcfResult.dcf === 'number') {
          // Transform the FMP response to our application's expected format
          const transformedResult: CustomDCFResult = {
            year: String(new Date().getFullYear()),
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
            price: dcfResult["Stock Price"] || 0,
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
            longTermGrowthRate: 0.03,
            freeCashFlow: 0,
            terminalValue: 0,
            presentTerminalValue: 0,
            enterpriseValue: 0,
            netDebt: 0,
            equityValue: 0,
            equityValuePerShare: dcfResult.dcf || 0,
            freeCashFlowT1: 0,
            operatingCashFlowPercentage: 0,
            cashAndCashEquivalents: 0
          };
          
          setResult(transformedResult);
          
          // Create projected data
          const yearly = createProjectedData([transformedResult]);
          setProjectedData(yearly);
          
          console.log("Created projected data:", yearly);
          
          toast({
            title: "DCF Calculation Complete",
            description: `Intrinsic value per share: $${transformedResult.equityValuePerShare.toFixed(2)}`,
          });
          
          return { dcfResult: transformedResult, yearly };
        } else {
          console.error("Invalid DCF result structure:", dcfResult);
          throw new Error("Invalid DCF result structure from API");
        }
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
