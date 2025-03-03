
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import DCFValuationSummary from "./DCFValuationSummary";
import ProjectedCashFlowsTable from "./ProjectedCashFlowsTable";
import SensitivityAnalysisTable from "./SensitivityAnalysisTable";
import { useCustomDCF } from "@/hooks/useCustomDCF";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface AutomaticDCFSectionProps {
  financials: any[];
  symbol: string;
}

const AutomaticDCFSection: React.FC<AutomaticDCFSectionProps> = ({ financials, symbol }) => {
  const { calculateCustomDCF, customDCFResult, projectedData, isCalculating, error } = useCustomDCF(symbol);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Get the current price from financials or use a fallback
  const currentPrice = financials[0]?.price || 100;

  useEffect(() => {
    // Only fetch DCF data if we have a valid symbol and haven't tried already
    if (symbol && !hasAttemptedFetch && !customDCFResult) {
      fetchDCFData();
    }
  }, [symbol]);

  const fetchDCFData = async () => {
    setHasAttemptedFetch(true);
    
    try {
      // Prepare default parameters for the company based on financial data
      // In a real implementation, your AI would determine better parameters
      const params = {
        symbol,
        revenueGrowthPct: 8, // 8% revenue growth
        ebitdaPct: 32, // 32% EBITDA margin
        capitalExpenditurePct: 3, // 3% capex relative to revenue
        taxRate: 21, // 21% tax rate
        longTermGrowthRate: 3, // 3% terminal growth rate
        costOfEquity: 9.5, // 9.5% cost of equity
        costOfDebt: 4, // 4% cost of debt
        riskFreeRate: 4, // 4% risk-free rate
        marketRiskPremium: 5, // 5% market risk premium
        beta: financials[0]?.beta || 1.2, // Company's beta or default
      };
      
      await calculateCustomDCF(params);
    } catch (err) {
      console.error("Error fetching DCF data:", err);
      toast({
        title: "Error",
        description: "Failed to load DCF data. Using estimated values instead.",
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
      growthRate: `${(customDCFResult.revenuePercentage || 0).toFixed(1)}% (first 5 years), ${customDCFResult.longTermGrowthRate}% (terminal)`,
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
      {isCalculating && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Calculating DCF valuation...</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DCFValuationSummary 
          dcfValue={dcfValue}
          currentPrice={currentPrice}
          assumptions={dcfData.assumptions}
          isLoading={isCalculating}
        />
        <ProjectedCashFlowsTable 
          projections={dcfData.projections}
          isLoading={isCalculating}
        />
      </div>
      
      <SensitivityAnalysisTable 
        headers={dcfData.sensitivity.headers}
        rows={dcfData.sensitivity.rows}
        currentPrice={currentPrice}
        isLoading={isCalculating}
      />
    </div>
  );
};

export default AutomaticDCFSection;
