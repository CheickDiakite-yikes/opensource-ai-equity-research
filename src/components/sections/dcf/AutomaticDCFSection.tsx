
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStandardDCF } from "@/hooks/dcf/useStandardDCF";
import DCFValuationSummary from "./DCFValuationSummary";
import SensitivityAnalysisTable from "./SensitivityAnalysisTable";
import ProjectedCashFlowsTable from "./ProjectedCashFlowsTable";
import DCFErrorDisplay from "./DCFErrorDisplay";
import DCFLoadingIndicator from "./DCFLoadingIndicator";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info, TrendingUp, Calculator, ChartBar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createMockDCFData, prepareDCFData } from "./utils/dcfDataFormatter";
import { FormattedDCFData } from "@/types/ai-analysis/dcfTypes";
import { getCurrentPrice } from "./utils/dcfDataFormatter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AutomaticDCFSectionProps {
  financials: any[];
  symbol: string;
}

const AutomaticDCFSection: React.FC<AutomaticDCFSectionProps> = ({ financials, symbol }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState("valuation");
  
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
  
  // Calculate upside/downside percentage
  const calculateUpsidePercentage = () => {
    if (!dcfData.intrinsicValue || !currentPrice) return 0;
    return ((dcfData.intrinsicValue - currentPrice) / currentPrice) * 100;
  };
  
  const upsidePercentage = calculateUpsidePercentage();
  const isUndervalued = upsidePercentage > 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">DCF Analysis for {symbol}</h2>
          <p className="text-muted-foreground mt-1">
            Discounted Cash Flow model based on FMP data
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isCalculating}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </div>
      
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
          {/* Top Summary Card with Valuation Score */}
          <Card className="border-2 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${isUndervalued ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-1">Intrinsic Value</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">${dcfData.intrinsicValue.toFixed(2)}</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${isUndervalued ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isUndervalued ? '↑' : '↓'} {Math.abs(upsidePercentage).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  Current Market Price: <span className="font-medium">${currentPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col items-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">Valuation</div>
                <div className={`text-lg font-bold ${isUndervalued ? 'text-green-600' : 'text-red-600'}`}>
                  {isUndervalued ? 'Undervalued' : 'Overvalued'}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className={`h-4 w-4 ${isUndervalued ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm">
                    {isUndervalued 
                      ? `${Math.abs(upsidePercentage).toFixed(1)}% Upside Potential` 
                      : `${Math.abs(upsidePercentage).toFixed(1)}% Downside Risk`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* DCF Details Tabs */}
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="valuation" className="flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                <span>DCF Valuation</span>
              </TabsTrigger>
              <TabsTrigger value="sensitivity" className="flex items-center">
                <ChartBar className="h-4 w-4 mr-2" />
                <span>Sensitivity</span>
              </TabsTrigger>
              <TabsTrigger value="projections" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>Projections</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="valuation" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>DCF Valuation Details</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  <CardHeader>
                    <CardTitle>Key Model Assumptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Revenue Growth</h4>
                          <div className="text-2xl font-bold">
                            {dcfData.assumptions.growthRate.split(',')[0].trim()}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            First 5 years
                          </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Discount Rate</h4>
                          <div className="text-2xl font-bold">
                            {dcfData.assumptions.discountRate}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            WACC
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Terminal Growth</h4>
                          <div className="text-2xl font-bold">
                            {dcfData.assumptions.growthRate.split(',')[1].split('(')[1].split(')')[0].trim()}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Long-term growth rate
                          </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Tax Rate</h4>
                          <div className="text-2xl font-bold">
                            {dcfData.assumptions.taxRate}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Effective tax rate
                          </p>
                        </div>
                      </div>
                      
                      {shouldUseMockData && (
                        <Alert className="bg-amber-50 border-amber-200 mt-4">
                          <Info className="h-4 w-4 text-amber-500" />
                          <AlertTitle>Using Estimated Values</AlertTitle>
                          <AlertDescription>
                            Due to data limitations, we're showing estimated values based on industry averages.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="sensitivity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sensitivity Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <SensitivityAnalysisTable 
                    sensitivityData={dcfData.sensitivity} 
                    currentPrice={currentPrice}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="projections" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projected Cash Flows</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectedCashFlowsTable projections={dcfData.projections} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default AutomaticDCFSection;
