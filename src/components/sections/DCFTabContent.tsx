
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutomaticDCFSection from "./dcf/AutomaticDCFSection";
import CustomDCFSection from "./dcf/CustomDCFSection";
import { useCustomDCF } from "@/hooks/dcf/useCustomDCF";
import { DCFType } from "@/services/api/analysis/dcf";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Sliders, TrendingUp, Lock, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DCFTabContentProps {
  financials: any[];
  symbol: string;
}

const DCFTabContent: React.FC<DCFTabContentProps> = ({ financials, symbol }) => {
  const [activeTab, setActiveTab] = useState<string>("automatic");
  const [dcfModel, setDcfModel] = useState<DCFType>(DCFType.CUSTOM_ADVANCED);
  const [apiResponseDebug, setApiResponseDebug] = useState<any>(null);
  
  // Custom DCF inputs state with improved default values
  const [customParams, setCustomParams] = useState({
    // Growth parameters (percentages)
    revenueGrowth: "8.5",  // Updated to match FMP default values
    ebitdaMargin: "30.0",
    capexPercent: "5.0",   // Updated to be more realistic
    taxRate: "21.0",       // Updated to match current corporate tax rate
    
    // Working capital parameters
    depreciationAndAmortizationPercent: "3.5",
    cashAndShortTermInvestmentsPercent: "23.0",
    receivablesPercent: "15.0",
    inventoriesPercent: "1.5",
    payablesPercent: "16.0",
    ebitPercent: "27.0",
    operatingCashFlowPercent: "28.0",
    sellingGeneralAndAdministrativeExpensesPercent: "6.5",
    
    // Rate parameters
    longTermGrowthRate: "4.0",  // Updated to match the screenshot value
    costOfEquity: "9.7",        // Updated to match the WACC from screenshot
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
    rawApiResponse  // Added to capture raw API responses for debugging
  } = useCustomDCF(symbol);
  
  const currentPrice = financials[0]?.price || 100;
  
  useEffect(() => {
    // Store the raw API response for debugging
    if (rawApiResponse) {
      console.log("Raw DCF API Response:", rawApiResponse);
      setApiResponseDebug(rawApiResponse);
    }
  }, [rawApiResponse]);
  
  // Automatically calculate standard DCF when component mounts
  useEffect(() => {
    if (symbol) {
      calculateStandardDCF();
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
      
      {apiResponseDebug && (
        <Card className="bg-gray-50 border-gray-200 mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Response Debug Information</CardTitle>
            <CardDescription className="text-xs">Raw data from the DCF API for troubleshooting</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-60">
              <pre>{JSON.stringify(apiResponseDebug, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DCFTabContent;
