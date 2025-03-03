import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import DCFValuationSummary from "./DCFValuationSummary";
import ProjectedCashFlowsTable from "./ProjectedCashFlowsTable";
import SensitivityAnalysisTable from "./SensitivityAnalysisTable";
import { useCustomDCF } from "@/hooks/useCustomDCF";
import { useAIDCFAssumptions } from "@/hooks/useAIDCFAssumptions";
import { Loader2, RotateCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { CustomDCFParams } from "@/types/aiAnalysisTypes";

interface AutomaticDCFSectionProps {
  financials: any[];
  symbol: string;
}

const AutomaticDCFSection: React.FC<AutomaticDCFSectionProps> = ({ financials, symbol }) => {
  const { calculateCustomDCF, customDCFResult, projectedData, isCalculating, error } = useCustomDCF(symbol);
  const { assumptions, isLoading: isLoadingAssumptions, error: assumptionsError, refreshAssumptions } = useAIDCFAssumptions(symbol);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Get the current price from financials or use a fallback
  const currentPrice = financials[0]?.price || 100;

  // When assumptions change or on initial load, fetch DCF data
  useEffect(() => {
    if (symbol && !hasAttemptedFetch && assumptions && !customDCFResult) {
      calculateDCFWithAIAssumptions();
    }
  }, [symbol, assumptions]);

  // Convert AI assumptions to CustomDCFParams for the API
  const convertAssumptionsToParams = (): CustomDCFParams => {
    if (!assumptions) {
      // Fallback default parameters
      return {
        symbol,
        // Growth parameters (as decimals)
        revenueGrowthPct: 0.1094,
        ebitdaPct: 0.3127,
        capitalExpenditurePct: 0.0306,
        taxRate: 0.2409,
        
        // Working capital parameters (as decimals)
        depreciationAndAmortizationPct: 0.0345,
        cashAndShortTermInvestmentsPct: 0.2344,
        receivablesPct: 0.1533,
        inventoriesPct: 0.0155,
        payablesPct: 0.1614,
        ebitPct: 0.2781,
        operatingCashFlowPct: 0.2886,
        sellingGeneralAndAdministrativeExpensesPct: 0.0662,
        
        // Rate parameters (as decimals for calculation)
        longTermGrowthRate: 0.04, // 4%
        costOfEquity: 0.0951, // 9.51%
        costOfDebt: 0.0364, // 3.64%
        marketRiskPremium: 0.0472, // 4.72%
        riskFreeRate: 0.0364, // 3.64%
        
        // Other
        beta: financials[0]?.beta || 1.244,
      };
    }

    return {
      symbol,
      // Growth parameters
      revenueGrowthPct: assumptions.assumptions.revenueGrowthPct,
      ebitdaPct: assumptions.assumptions.ebitdaMarginPct,
      capitalExpenditurePct: assumptions.assumptions.capitalExpenditurePct,
      taxRate: assumptions.assumptions.taxRatePct,
      
      // Working capital parameters
      depreciationAndAmortizationPct: assumptions.assumptions.depreciationAndAmortizationPct,
      cashAndShortTermInvestmentsPct: assumptions.assumptions.cashAndShortTermInvestmentsPct,
      receivablesPct: assumptions.assumptions.receivablesPct,
      inventoriesPct: assumptions.assumptions.inventoriesPct,
      payablesPct: assumptions.assumptions.payablesPct,
      ebitPct: assumptions.assumptions.ebitPct,
      operatingCashFlowPct: assumptions.assumptions.operatingCashFlowPct,
      sellingGeneralAndAdministrativeExpensesPct: assumptions.assumptions.sellingGeneralAndAdministrativeExpensesPct,
      
      // Rate parameters
      longTermGrowthRate: assumptions.assumptions.longTermGrowthRatePct,
      costOfEquity: assumptions.assumptions.costOfEquityPct,
      costOfDebt: assumptions.assumptions.costOfDebtPct,
      marketRiskPremium: assumptions.assumptions.marketRiskPremiumPct,
      riskFreeRate: assumptions.assumptions.riskFreeRatePct,
      
      // Other
      beta: assumptions.assumptions.beta
    };
  };

  const calculateDCFWithAIAssumptions = async () => {
    setHasAttemptedFetch(true);
    
    try {
      const params = convertAssumptionsToParams();
      
      console.log("Calculating DCF with AI-generated parameters:", params);
      await calculateCustomDCF(params);
    } catch (err) {
      console.error("Error calculating DCF with AI assumptions:", err);
      toast({
        title: "Error",
        description: "Failed to calculate DCF. Using estimated values instead.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshAssumptions = async () => {
    try {
      toast({
        title: "Refreshing",
        description: "Generating new AI-powered DCF assumptions...",
      });
      
      await refreshAssumptions();
      
      // If assumptions refreshed successfully, recalculate DCF
      if (assumptions) {
        calculateDCFWithAIAssumptions();
      }
    } catch (err) {
      console.error("Error refreshing assumptions:", err);
      toast({
        title: "Error",
        description: "Failed to refresh DCF assumptions.",
        variant: "destructive",
      });
    }
  };

  // If we're calculating or have an error, use mock data
  const useMockData = isCalculating || error || !customDCFResult;

  // Mock DCF data as fallback
  const mockDCFData = {
    intrinsicValue: financials[0]?.revenue ? (financials[0].netIncome * 15) : 0,
    assumptions: {
      growthRate: "8.5% (first 5 years), 3% (terminal)",
      discountRate: "10.5%",
      terminalMultiple: "15x",
      taxRate: "21%"
    },
    projections: [1, 2, 3, 4, 5].map(year => ({
      year: `Year ${year}`,
      revenue: financials[0]?.revenue ? (financials[0].revenue * Math.pow(1.085, year)) : 0,
      ebit: financials[0]?.operatingIncome ? (financials[0].operatingIncome * Math.pow(1.09, year)) : 0,
      fcf: financials[0]?.netIncome ? (financials[0].netIncome * 0.8 * Math.pow(1.075, year)) : 0
    })),
    sensitivity: {
      headers: ["", "9.5%", "10.0%", "10.5%", "11.0%", "11.5%"],
      rows: [
        { growth: "2.0%", values: [95, 90, 85, 80, 75] },
        { growth: "2.5%", values: [100, 95, 90, 85, 80] },
        { growth: "3.0%", values: [105, 100, 95, 90, 85] },
        { growth: "3.5%", values: [110, 105, 100, 95, 90] },
        { growth: "4.0%", values: [115, 110, 105, 100, 95] }
      ]
    }
  };

  // If we have real DCF data, use it. Otherwise fall back to mock data
  const dcfData = useMockData ? mockDCFData : {
    intrinsicValue: customDCFResult.equityValuePerShare,
    assumptions: {
      growthRate: `${(assumptions?.assumptions.revenueGrowthPct * 100 || 0).toFixed(1)}% (first 5 years), ${(assumptions?.assumptions.longTermGrowthRatePct * 100 || 0).toFixed(1)}% (terminal)`,
      discountRate: `${customDCFResult.wacc.toFixed(2)}%`,
      terminalMultiple: "DCF Model",
      taxRate: `${customDCFResult.taxRate.toFixed(1)}%`
    },
    projections: projectedData.map((yearData, index) => ({
      year: `Year ${index + 1}`,
      revenue: yearData.revenue || 0,
      ebit: yearData.ebit || 0,
      fcf: yearData.freeCashFlow || 0
    })),
    sensitivity: mockDCFData.sensitivity // We'll keep using mock sensitivity data for now
  };

  // Calculate upside percentage based on intrinsic value vs current price
  const dcfValue = Math.max(0, dcfData.intrinsicValue); // Ensure non-negative value

  return (
    <div className="space-y-6">
      {(isCalculating || isLoadingAssumptions) && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">
            {isLoadingAssumptions ? "Loading AI-powered DCF assumptions..." : "Calculating DCF valuation..."}
          </span>
        </div>
      )}
      
      {assumptions && !isLoadingAssumptions && (
        <Alert className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle className="font-medium text-blue-700">AI-Generated DCF Assumptions</AlertTitle>
          <AlertDescription className="text-sm text-blue-600">
            <p className="mb-2">{assumptions.explanation}</p>
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-blue-600 border-blue-300"
                onClick={handleRefreshAssumptions}
                disabled={isLoadingAssumptions || isCalculating}
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Refresh Analysis
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DCFValuationSummary 
          dcfValue={dcfValue}
          currentPrice={currentPrice}
          assumptions={dcfData.assumptions}
          isLoading={isCalculating || isLoadingAssumptions}
        />
        <ProjectedCashFlowsTable 
          projections={dcfData.projections}
          isLoading={isCalculating || isLoadingAssumptions}
        />
      </div>
      
      <SensitivityAnalysisTable 
        headers={dcfData.sensitivity.headers}
        rows={dcfData.sensitivity.rows}
        currentPrice={currentPrice}
        isLoading={isCalculating || isLoadingAssumptions}
      />
    </div>
  );
};

export default AutomaticDCFSection;
