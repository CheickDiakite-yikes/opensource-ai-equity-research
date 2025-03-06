
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useStandardDCF } from "@/hooks/dcf/useStandardDCF";
import DCFValuationSummary from "./DCFValuationSummary";
import SensitivityAnalysisTable from "./SensitivityAnalysisTable";
import ProjectedCashFlowsTable from "./ProjectedCashFlowsTable";
import DCFErrorDisplay from "./DCFErrorDisplay";
import DCFLoadingIndicator from "./DCFLoadingIndicator";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createMockDCFData, prepareDCFData } from "./utils/dcfDataFormatter";
import { FormattedDCFData } from "@/types/ai-analysis/dcfTypes";
import { getCurrentPrice } from "./utils/dcfDataFormatter";

interface AutomaticDCFSectionProps {
  financials: any[];
  symbol: string;
}

const AutomaticDCFSection: React.FC<AutomaticDCFSectionProps> = ({ financials, symbol }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get the current price
  const currentPrice = getCurrentPrice(financials);
  
  // Use the standard DCF hook
  const { 
    calculateStandardDCF, 
    result: dcfResult, 
    projectedData, 
    isCalculating, 
    error 
  } = useStandardDCF(symbol);
  
  // Mock DCF data as fallback
  const mockDCFData = createMockDCFData(financials);
  
  // Initialize - calculate DCF on first load
  useEffect(() => {
    if (!isInitialized && symbol) {
      calculateStandardDCF();
      setIsInitialized(true);
    }
  }, [symbol, isInitialized, calculateStandardDCF]);
  
  // Determine whether to use mock data
  const shouldUseMockData = !dcfResult || (error && !dcfResult.equityValuePerShare);
  
  // Prepare the DCF data for display
  const dcfData: FormattedDCFData = shouldUseMockData
    ? mockDCFData
    : prepareDCFData(
        dcfResult, 
        null, // No AI assumptions
        projectedData, 
        mockDCFData.sensitivity
      );

  // Handle refresh
  const handleRefresh = () => {
    calculateStandardDCF();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Automatic DCF Analysis</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isCalculating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </div>
      
      {/* Information Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle>FMP Standard DCF Model</AlertTitle>
        <AlertDescription>
          This DCF analysis uses the Financial Modeling Prep standard DCF calculation for {symbol}.
          {shouldUseMockData && " Currently showing estimated values."}
        </AlertDescription>
      </Alert>
      
      {/* Error Display */}
      {error && (
        <DCFErrorDisplay 
          errors={[error]} 
          onRetry={handleRefresh}
        />
      )}
      
      {isCalculating ? (
        <DCFLoadingIndicator 
          isLoading={isCalculating} 
          isLoadingAssumptions={false} 
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
