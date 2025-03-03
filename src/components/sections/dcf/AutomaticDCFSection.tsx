
import React from "react";
import DCFValuationSummary from "./DCFValuationSummary";
import ProjectedCashFlowsTable from "./ProjectedCashFlowsTable";
import SensitivityAnalysisTable from "./SensitivityAnalysisTable";
import DCFLoadingIndicator from "./DCFLoadingIndicator";
import DCFErrorDisplay from "./DCFErrorDisplay";
import AIAssumptionsAlert from "./AIAssumptionsAlert";
import { useDCFData } from "./hooks/useDCFData";

interface AutomaticDCFSectionProps {
  financials: any[];
  symbol: string;
}

const AutomaticDCFSection: React.FC<AutomaticDCFSectionProps> = ({ financials, symbol }) => {
  const {
    dcfData,
    currentPrice,
    isCalculating,
    isLoadingAssumptions,
    errors,
    assumptions,
    handleRefreshAssumptions
  } = useDCFData(symbol, financials);

  // Calculate upside percentage based on intrinsic value vs current price
  const dcfValue = Math.max(0, dcfData.intrinsicValue); // Ensure non-negative value

  return (
    <div className="space-y-6">
      <DCFLoadingIndicator 
        isLoading={isCalculating} 
        isLoadingAssumptions={isLoadingAssumptions} 
      />
      
      <DCFErrorDisplay errors={errors} />
      
      {assumptions && !isLoadingAssumptions && (
        <AIAssumptionsAlert 
          assumptions={assumptions}
          onRefresh={handleRefreshAssumptions}
          isLoading={isLoadingAssumptions}
          isCalculating={isCalculating}
        />
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
