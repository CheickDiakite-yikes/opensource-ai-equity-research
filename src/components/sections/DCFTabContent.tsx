
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomDCF } from "@/hooks/dcf/useCustomDCF";
import AutomaticDCFSection from "./dcf/AutomaticDCFSection";
import CustomDCFSection from "./dcf/CustomDCFSection";
import { DCFType } from "@/services/api/analysis/dcf/types";

interface DCFTabContentProps {
  financials: any[];
  symbol: string;
}

const DCFTabContent: React.FC<DCFTabContentProps> = ({ financials, symbol }) => {
  const [activeTab, setActiveTab] = useState<string>("automatic");
  const [dcfModel, setDcfModel] = useState<DCFType>(DCFType.CUSTOM_ADVANCED);
  
  // Custom DCF inputs state - all parameters included and properly formatted
  const [customParams, setCustomParams] = useState({
    // Growth parameters (as decimals)
    revenueGrowth: "0.1094",
    ebitdaMargin: "0.3127",
    capexPercent: "0.0306", 
    taxRate: "0.2409",
    
    // Working capital parameters (as decimals)
    depreciationAndAmortizationPercent: "0.0345",
    cashAndShortTermInvestmentsPercent: "0.2344",
    receivablesPercent: "0.1533", 
    inventoriesPercent: "0.0155",
    payablesPercent: "0.1614",
    ebitPercent: "0.2781",
    operatingCashFlowPercent: "0.2886",
    sellingGeneralAndAdministrativeExpensesPercent: "0.0662",
    
    // Rate parameters (as whole numbers)
    longTermGrowthRate: "4",
    costOfEquity: "9.51",
    costOfDebt: "3.64",
    marketRiskPremium: "4.72",
    riskFreeRate: "3.64",
    
    // Other
    beta: "1.244"
  });
  
  // Custom DCF calculation hook
  const { 
    calculateStandardDCF,
    calculateLeveredDCF,
    calculateCustomDCF,
    customDCFResult, 
    projectedData,
    isCalculating, 
    error 
  } = useCustomDCF(symbol);
  
  const currentPrice = financials[0]?.price || 100;
  
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
      
      // Rate parameters - these are already in proper format for the API
      longTermGrowthRate: parseFloat(customParams.longTermGrowthRate) / 100, // Convert from percentage to decimal
      costOfEquity: parseFloat(customParams.costOfEquity) / 100, // Convert from percentage to decimal
      costOfDebt: parseFloat(customParams.costOfDebt) / 100, // Convert from percentage to decimal
      marketRiskPremium: parseFloat(customParams.marketRiskPremium) / 100, // Convert from percentage to decimal
      riskFreeRate: parseFloat(customParams.riskFreeRate) / 100, // Convert from percentage to decimal
      
      // Other
      beta: parseFloat(customParams.beta),
    };
    
    // Pass the model type to the calculation function
    calculateCustomDCF(params, dcfModel);
  };
  
  const handleCalculateStandardDCF = () => {
    calculateStandardDCF();
  };
  
  const handleCalculateLeveredDCF = () => {
    calculateLeveredDCF();
  };
  
  const handleSwitchToCustomDCF = () => {
    setActiveTab("custom");
  };
  
  return (
    <div className="mt-4 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="automatic">Automatic DCF</TabsTrigger>
          <TabsTrigger value="custom">Custom DCF</TabsTrigger>
        </TabsList>
        
        <TabsContent value="automatic" className="space-y-6">
          <AutomaticDCFSection 
            financials={financials} 
            symbol={symbol} 
            onSwitchToCustomDCF={handleSwitchToCustomDCF}
          />
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-6">
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
            onCalculateStandard={handleCalculateStandardDCF}
            onCalculateLevered={handleCalculateLeveredDCF}
            dcfModel={dcfModel}
            onModelChange={handleModelChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DCFTabContent;
