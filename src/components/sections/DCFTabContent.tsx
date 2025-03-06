import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutomaticDCFSection from "./dcf/AutomaticDCFSection";
import CustomDCFSection from "./dcf/CustomDCFSection";
import { useCustomDCF } from "@/hooks/dcf/useCustomDCF";
import { DCFType } from "@/services/api/analysis/dcfService";

interface DCFTabContentProps {
  financials: any[];
  symbol: string;
}

const DCFTabContent: React.FC<DCFTabContentProps> = ({ financials, symbol }) => {
  const [activeTab, setActiveTab] = useState<string>("automatic");
  const [dcfModel, setDcfModel] = useState<DCFType>(DCFType.CUSTOM_ADVANCED);
  
  // Custom DCF inputs state
  const [customParams, setCustomParams] = useState({
    // Growth parameters (as decimals)
    revenueGrowth: "10.5",
    ebitdaMargin: "30.0",
    capexPercent: "3.0", 
    taxRate: "24.0",
    
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
    longTermGrowthRate: "3.0",
    costOfEquity: "9.5",
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
  
  const handleCalculateStandardDCF = () => {
    calculateStandardDCF();
  };
  
  const handleCalculateLeveredDCF = () => {
    calculateLeveredDCF();
  };
  
  return (
    <div className="mt-4 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="automatic">Automatic DCF</TabsTrigger>
          <TabsTrigger value="custom">Custom DCF</TabsTrigger>
        </TabsList>
        
        <TabsContent value="automatic" className="space-y-6">
          <AutomaticDCFSection financials={financials} symbol={symbol} />
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
