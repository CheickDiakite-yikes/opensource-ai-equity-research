
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutomaticDCFSection from "./dcf/AutomaticDCFSection";
import CustomDCFSection from "./dcf/CustomDCFSection";
import { useCustomDCF } from "@/hooks/dcf/useCustomDCF";
import { DCFType } from "@/services/api/analysis/dcf";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Sliders, TrendingUp, Lock, AlertTriangle, Bug } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DCFTabContentProps {
  financials: any[];
  symbol: string;
}

const DCFTabContent: React.FC<DCFTabContentProps> = ({ financials, symbol }) => {
  const [activeTab, setActiveTab] = useState<string>("automatic");
  const [dcfModel, setDcfModel] = useState<DCFType>(DCFType.LEVERED);
  const [apiResponseDebug, setApiResponseDebug] = useState<any>(null);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  
  // Custom DCF inputs state with FMP default values
  const [customParams, setCustomParams] = useState({
    // Growth parameters (percentages)
    revenueGrowth: "8.5",  // Use FMP default values
    ebitdaMargin: "30.0",
    capexPercent: "5.0",   
    taxRate: "21.0",       // Current corporate tax rate
    
    // Working capital parameters
    depreciationAndAmortizationPercent: "3.5",
    cashAndShortTermInvestmentsPercent: "23.0",
    receivablesPercent: "15.0",
    inventoriesPercent: "1.5",
    payablesPercent: "16.0",
    ebitPercent: "27.0",
    operatingCashFlowPercent: "28.0",
    sellingGeneralAndAdministrativeExpensesPercent: "6.5",
    
    // Rate parameters - as shown in the screenshot
    longTermGrowthRate: "4.0",  
    costOfEquity: "9.7",        
    costOfDebt: "3.5",
    marketRiskPremium: "4.7",
    riskFreeRate: "3.6",
    
    // Other
    beta: "1.2"
  });
  
  // Custom DCF calculation hook
  const { 
    calculateStandardDCF,
    calculateLeveredDCF,
    calculateCustomDCF,
    customDCFResult, 
    projectedData,
    isCalculating, 
    error,
    rawApiResponse
  } = useCustomDCF(symbol);
  
  const currentPrice = financials[0]?.price || 100;
  
  useEffect(() => {
    // Store the raw API response for debugging
    if (rawApiResponse) {
      console.log("DCFTabContent - Raw DCF API Response:", rawApiResponse);
      setApiResponseDebug(rawApiResponse);
    }
  }, [rawApiResponse]);
  
  // Automatically calculate levered DCF when component mounts
  useEffect(() => {
    if (symbol) {
      console.log(`DCFTabContent - Auto-calculating levered DCF for ${symbol}`);
      calculateLeveredDCF();
    }
  }, [symbol]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomParams(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setCustomParams(prev => ({ ...prev, [name]: value }));
  };
  
  const handleModelChange = (model: DCFType) => {
    setDcfModel(model);
  };
  
  const handleCalculateCustomDCF = () => {
    const params = {
      symbol,
      // Growth parameters - convert percentages to proper decimal format where needed
      revenueGrowthPct: parseFloat(customParams.revenueGrowth),
      ebitdaPct: parseFloat(customParams.ebitdaMargin),
      capitalExpenditurePct: parseFloat(customParams.capexPercent),
      taxRate: parseFloat(customParams.taxRate),
      
      // Working capital parameters
      depreciationAndAmortizationPct: parseFloat(customParams.depreciationAndAmortizationPercent),
      cashAndShortTermInvestmentsPct: parseFloat(customParams.cashAndShortTermInvestmentsPercent),
      receivablesPct: parseFloat(customParams.receivablesPercent),
      inventoriesPct: parseFloat(customParams.inventoriesPercent),
      payablesPct: parseFloat(customParams.payablesPercent),
      ebitPct: parseFloat(customParams.ebitPercent),
      operatingCashFlowPct: parseFloat(customParams.operatingCashFlowPercent),
      sellingGeneralAndAdministrativeExpensesPct: parseFloat(customParams.sellingGeneralAndAdministrativeExpensesPercent),
      
      // Rate parameters - these need to be converted from percentage to decimal for the API
      longTermGrowthRate: parseFloat(customParams.longTermGrowthRate) / 100,
      costOfEquity: parseFloat(customParams.costOfEquity) / 100,
      costOfDebt: parseFloat(customParams.costOfDebt) / 100,
      marketRiskPremium: parseFloat(customParams.marketRiskPremium) / 100,
      riskFreeRate: parseFloat(customParams.riskFreeRate) / 100,
      
      // Other
      beta: parseFloat(customParams.beta),
    };
    
    // Pass the model type to the calculation function
    calculateCustomDCF(params, dcfModel);
  };
  
  return (
    <div className="mt-6 space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-700">
              <Calculator className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900">Discounted Cash Flow Analysis</h3>
              <p className="text-blue-700 mt-1">
                Estimate {symbol}'s intrinsic value based on projected future cash flows discounted to present value.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="debug-mode" 
                checked={showDebugPanel}
                onCheckedChange={setShowDebugPanel}
              />
              <Label htmlFor="debug-mode" className="text-sm text-blue-700 flex items-center">
                <Bug className="h-3 w-3 mr-1" /> Debug Mode
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {customDCFResult?.mockData && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-800">
            <strong>Using mock data:</strong> The DCF calculation is currently using estimated values instead of real API data.
            This may be due to API rate limits or data availability issues. The displayed values are approximations.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="automatic" className="flex items-center justify-center py-3">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span>Automatic DCF</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center justify-center py-3">
            <Sliders className="h-4 w-4 mr-2" />
            <span>Custom DCF</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="automatic" className="space-y-6 animate-fade-in">
          <AutomaticDCFSection financials={financials} symbol={symbol} />
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-6 animate-fade-in">
          <CustomDCFSection 
            symbol={symbol}
            currentPrice={currentPrice}
            isCalculating={isCalculating}
            customDCFResult={customDCFResult}
            projectedData={projectedData}
            error={error}
            customParams={customParams}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onCalculate={handleCalculateCustomDCF}
            onCalculateStandard={calculateStandardDCF}
            onCalculateLevered={calculateLeveredDCF}
            dcfModel={dcfModel}
            onModelChange={handleModelChange}
          />
        </TabsContent>
      </Tabs>
      
      {showDebugPanel && apiResponseDebug && (
        <Card className="bg-gray-50 border-gray-300 mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Bug className="h-4 w-4 mr-2 text-gray-600" /> 
              API Response Debug Information
            </CardTitle>
            <CardDescription className="text-xs">Raw data from the DCF API for troubleshooting</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-60">
              <pre>{JSON.stringify(apiResponseDebug, null, 2)}</pre>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>
                <strong>API Endpoint:</strong> {DCFType.LEVERED === dcfModel ? 
                  "v4/advanced_levered_discounted_cash_flow" : 
                  DCFType.CUSTOM_LEVERED === dcfModel ? 
                  "v4/advanced_levered_discounted_cash_flow (with custom params)" : 
                  DCFType.CUSTOM_ADVANCED === dcfModel ? 
                  "v4/advanced_discounted_cash_flow (with custom params)" : 
                  "v3/discounted-cash-flow"}
              </p>
              <p>
                <strong>Is Mock Data:</strong> {customDCFResult?.mockData ? "Yes" : "No"}
              </p>
              <p>
                <strong>Timestamp:</strong> {new Date().toISOString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DCFTabContent;
