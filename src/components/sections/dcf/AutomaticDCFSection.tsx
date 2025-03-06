
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDCFData } from "./hooks/useDCFData";
import DCFValuationSummary from "./DCFValuationSummary";
import SensitivityAnalysisTable from "./SensitivityAnalysisTable";
import ProjectedCashFlowsTable from "./ProjectedCashFlowsTable";
import DCFErrorDisplay from "./DCFErrorDisplay";
import DCFLoadingIndicator from "./DCFLoadingIndicator";
import AIAssumptionsAlert from "./AIAssumptionsAlert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface AutomaticDCFSectionProps {
  financials: any[];
  symbol: string;
  onSwitchToCustomDCF?: () => void;
}

const AutomaticDCFSection: React.FC<AutomaticDCFSectionProps> = ({ 
  financials, 
  symbol,
  onSwitchToCustomDCF
}) => {
  const { 
    dcfData, 
    currentPrice, 
    isCalculating, 
    isLoadingAssumptions,
    errors,
    assumptions,
    usingMockData,
    handleRefreshAssumptions,
    handleSwitchToCustomDCF
  } = useDCFData(symbol, financials);
  
  const isLoading = isCalculating || isLoadingAssumptions;
  
  // Use callback provided by parent if available, otherwise use the one from the hook
  const switchToCustomDCF = onSwitchToCustomDCF || handleSwitchToCustomDCF;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Automatic AI-Powered DCF Analysis</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshAssumptions}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </div>
      
      <AIAssumptionsAlert 
        assumptions={assumptions} 
        isLoading={isLoadingAssumptions} 
        hasError={errors.length > 0}
        usingMockData={usingMockData}
      />
      
      <DCFErrorDisplay 
        errors={errors} 
        onCustomDCFClick={switchToCustomDCF}
      />
      
      {isLoading ? (
        <DCFLoadingIndicator 
          isLoading={isCalculating} 
          isLoadingAssumptions={isLoadingAssumptions} 
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <DCFValuationSummary
                  intrinsicValue={dcfData.intrinsicValue}
                  currentPrice={currentPrice}
                  assumptions={{
                    growthRate: `${dcfData.assumptions.growthRate}`,
                    discountRate: `${dcfData.assumptions.discountRate}`,
                    terminalMultiple: `${dcfData.assumptions.terminalMultiple}`,
                    taxRate: `${dcfData.assumptions.taxRate}`
                  }}
                  symbol={symbol}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <SensitivityAnalysisTable 
                  sensitivityData={dcfData.sensitivity} 
                  currentPrice={currentPrice}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <ProjectedCashFlowsTable projections={dcfData.projections} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AutomaticDCFSection;
