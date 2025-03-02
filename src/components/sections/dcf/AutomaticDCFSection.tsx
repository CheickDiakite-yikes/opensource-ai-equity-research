
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import DCFValuationSummary from "./DCFValuationSummary";
import ProjectedCashFlowsTable from "./ProjectedCashFlowsTable";
import SensitivityAnalysisTable from "./SensitivityAnalysisTable";

interface AutomaticDCFSectionProps {
  financials: any[];
  symbol: string;
}

const AutomaticDCFSection: React.FC<AutomaticDCFSectionProps> = ({ financials, symbol }) => {
  // In a real app, this would be calculated using actual DCF model
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

  const currentPrice = financials[0]?.price || 100;
  const dcfValue = mockDCFData.intrinsicValue;
  const upside = ((dcfValue / currentPrice) - 1) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DCFValuationSummary 
          dcfValue={dcfValue} 
          upside={upside} 
          assumptions={mockDCFData.assumptions} 
        />
        <ProjectedCashFlowsTable projections={mockDCFData.projections} />
      </div>
      
      <SensitivityAnalysisTable 
        headers={mockDCFData.sensitivity.headers} 
        rows={mockDCFData.sensitivity.rows} 
        currentPrice={currentPrice} 
      />
    </div>
  );
};

export default AutomaticDCFSection;
