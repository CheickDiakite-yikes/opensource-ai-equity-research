
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomDCF } from "@/hooks/useCustomDCF";
import AutomaticDCFSection from "./dcf/AutomaticDCFSection";
import CustomDCFSection from "./dcf/CustomDCFSection";

interface DCFTabContentProps {
  financials: any[];
  symbol: string;
}

const DCFTabContentProps: React.FC<DCFTabContentProps> = ({ financials, symbol }) => {
  const [activeTab, setActiveTab] = useState<string>("automatic");
  
  // Custom DCF inputs state - using decimal values now instead of percentages
  const [customParams, setCustomParams] = useState({
    revenueGrowth: "0.1094",
    ebitdaMargin: "0.3127",
    capexPercent: "0.0306", 
    taxRate: "0.2409",
    longTermGrowthRate: "0.04",
    costOfEquity: "0.0951",
    costOfDebt: "0.0364",
    beta: "1.244",
    marketRiskPremium: "0.0472",
    riskFreeRate: "0.0364"
  });
  
  // Custom DCF calculation hook
  const { 
    calculateCustomDCF, 
    customDCFResult, 
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
  
  const handleCalculateCustomDCF = () => {
    calculateCustomDCF({
      symbol,
      revenueGrowthPct: parseFloat(customParams.revenueGrowth),
      ebitdaPct: parseFloat(customParams.ebitdaMargin),
      capitalExpenditurePct: parseFloat(customParams.capexPercent),
      taxRate: parseFloat(customParams.taxRate),
      longTermGrowthRate: parseFloat(customParams.longTermGrowthRate),
      costOfEquity: parseFloat(customParams.costOfEquity),
      costOfDebt: parseFloat(customParams.costOfDebt),
      beta: parseFloat(customParams.beta),
      marketRiskPremium: parseFloat(customParams.marketRiskPremium),
      riskFreeRate: parseFloat(customParams.riskFreeRate)
    });
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
            error={error}
            customParams={customParams}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onCalculate={handleCalculateCustomDCF}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DCFTabContentProps;
