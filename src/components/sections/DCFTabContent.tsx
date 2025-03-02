
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { formatLargeNumber, formatPercentage, formatMultiple } from "@/lib/utils";
import { useCustomDCF } from "@/hooks/useCustomDCF";
import { CustomDCFParams, CustomDCFResult } from "@/types/aiAnalysisTypes";

interface DCFTabContentProps {
  symbol: string;
  stockData?: any;
}

const DCFTabContent: React.FC<DCFTabContentProps> = ({ symbol, stockData }) => {
  const { calculateCustomDCF, customDCFResult, isCalculating, error } = useCustomDCF(symbol);
  
  const [customInputs, setCustomInputs] = useState<CustomDCFParams>({
    symbol,
    revenueGrowthPct: 10,
    ebitdaPct: 25,
    capitalExpenditurePct: 5,
    taxRate: 25,
    longTermGrowthRate: 3,
    costOfEquity: 10,
    costOfDebt: 5,
    beta: stockData?.beta || 1.2,
    marketRiskPremium: 5.5,
    riskFreeRate: 3.5
  });
  
  const handleInputChange = (field: keyof CustomDCFParams, value: number) => {
    setCustomInputs(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSliderChange = (field: keyof CustomDCFParams, value: number[]) => {
    handleInputChange(field, value[0]);
  };
  
  const handleCalculate = async () => {
    try {
      await calculateCustomDCF(customInputs);
      toast.success("DCF analysis calculated successfully");
    } catch (err) {
      toast.error("Failed to calculate DCF analysis");
      console.error(err);
    }
  };
  
  return (
    <Tabs defaultValue="custom" className="mt-4">
      <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
        <TabsTrigger value="custom">Custom DCF</TabsTrigger>
        <TabsTrigger value="results">Results</TabsTrigger>
      </TabsList>
      
      <TabsContent value="custom">
        <Card>
          <CardHeader>
            <CardTitle>Customize DCF Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="revenueGrowthPct">Revenue Growth (%)</Label>
                    <div className="flex gap-4 items-center">
                      <Slider 
                        id="revenueGrowthPct"
                        defaultValue={[customInputs.revenueGrowthPct]} 
                        min={-10} 
                        max={30} 
                        step={0.5}
                        onValueChange={(value) => handleSliderChange('revenueGrowthPct', value)}
                      />
                      <Input
                        type="number"
                        value={customInputs.revenueGrowthPct}
                        onChange={(e) => handleInputChange('revenueGrowthPct', parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ebitdaPct">EBITDA Margin (%)</Label>
                    <div className="flex gap-4 items-center">
                      <Slider 
                        id="ebitdaPct"
                        defaultValue={[customInputs.ebitdaPct]} 
                        min={0} 
                        max={50} 
                        step={0.5}
                        onValueChange={(value) => handleSliderChange('ebitdaPct', value)}
                      />
                      <Input
                        type="number"
                        value={customInputs.ebitdaPct}
                        onChange={(e) => handleInputChange('ebitdaPct', parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capitalExpenditurePct">CapEx % of Revenue</Label>
                    <div className="flex gap-4 items-center">
                      <Slider 
                        id="capitalExpenditurePct"
                        defaultValue={[customInputs.capitalExpenditurePct]} 
                        min={0} 
                        max={20} 
                        step={0.5}
                        onValueChange={(value) => handleSliderChange('capitalExpenditurePct', value)}
                      />
                      <Input
                        type="number"
                        value={customInputs.capitalExpenditurePct}
                        onChange={(e) => handleInputChange('capitalExpenditurePct', parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <div className="flex gap-4 items-center">
                      <Slider 
                        id="taxRate"
                        defaultValue={[customInputs.taxRate]} 
                        min={0} 
                        max={40} 
                        step={0.5}
                        onValueChange={(value) => handleSliderChange('taxRate', value)}
                      />
                      <Input
                        type="number"
                        value={customInputs.taxRate}
                        onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costOfEquity">Cost of Equity (%)</Label>
                    <div className="flex gap-4 items-center">
                      <Slider 
                        id="costOfEquity"
                        defaultValue={[customInputs.costOfEquity]} 
                        min={5} 
                        max={20} 
                        step={0.5}
                        onValueChange={(value) => handleSliderChange('costOfEquity', value)}
                      />
                      <Input
                        type="number"
                        value={customInputs.costOfEquity}
                        onChange={(e) => handleInputChange('costOfEquity', parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="costOfDebt">Cost of Debt (%)</Label>
                    <div className="flex gap-4 items-center">
                      <Slider 
                        id="costOfDebt"
                        defaultValue={[customInputs.costOfDebt]} 
                        min={1} 
                        max={15} 
                        step={0.5}
                        onValueChange={(value) => handleSliderChange('costOfDebt', value)}
                      />
                      <Input
                        type="number"
                        value={customInputs.costOfDebt}
                        onChange={(e) => handleInputChange('costOfDebt', parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beta">Beta</Label>
                    <div className="flex gap-4 items-center">
                      <Slider 
                        id="beta"
                        defaultValue={[customInputs.beta]} 
                        min={0.5} 
                        max={2.5} 
                        step={0.05}
                        onValueChange={(value) => handleSliderChange('beta', value)}
                      />
                      <Input
                        type="number"
                        value={customInputs.beta}
                        onChange={(e) => handleInputChange('beta', parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="longTermGrowthRate">Terminal Growth Rate (%)</Label>
                    <div className="flex gap-4 items-center">
                      <Slider 
                        id="longTermGrowthRate"
                        defaultValue={[customInputs.longTermGrowthRate]} 
                        min={1} 
                        max={5} 
                        step={0.25}
                        onValueChange={(value) => handleSliderChange('longTermGrowthRate', value)}
                      />
                      <Input
                        type="number"
                        value={customInputs.longTermGrowthRate}
                        onChange={(e) => handleInputChange('longTermGrowthRate', parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="riskFreeRate">Risk-Free Rate (%)</Label>
                    <div className="flex gap-4 items-center">
                      <Slider 
                        id="riskFreeRate"
                        defaultValue={[customInputs.riskFreeRate]} 
                        min={1} 
                        max={6} 
                        step={0.25}
                        onValueChange={(value) => handleSliderChange('riskFreeRate', value)}
                      />
                      <Input
                        type="number"
                        value={customInputs.riskFreeRate}
                        onChange={(e) => handleInputChange('riskFreeRate', parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="marketRiskPremium">Market Risk Premium (%)</Label>
                    <div className="flex gap-4 items-center">
                      <Slider 
                        id="marketRiskPremium"
                        defaultValue={[customInputs.marketRiskPremium]} 
                        min={3} 
                        max={8} 
                        step={0.25}
                        onValueChange={(value) => handleSliderChange('marketRiskPremium', value)}
                      />
                      <Input
                        type="number"
                        value={customInputs.marketRiskPremium}
                        onChange={(e) => handleInputChange('marketRiskPremium', parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleCalculate} 
                  className="min-w-32"
                  disabled={isCalculating}
                >
                  {isCalculating ? "Calculating..." : "Calculate DCF"}
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="results">
        <Card>
          <CardHeader>
            <CardTitle>DCF Results</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-center py-10">
                <p className="text-destructive">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => handleCalculate()}
                >
                  Try Again
                </Button>
              </div>
            )}
            
            {!customDCFResult && !error && (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No DCF analysis results yet.</p>
                <p className="text-muted-foreground mb-4">Use the Custom DCF tab to set your parameters and calculate.</p>
                <Button 
                  variant="outline" 
                  onClick={() => handleCalculate()}
                >
                  Run with Default Parameters
                </Button>
              </div>
            )}
            
            {customDCFResult && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Fair Value per Share</p>
                    <p className="text-2xl font-bold">{formatLargeNumber(customDCFResult.equityValuePerShare)}</p>
                    <p className="text-xs text-muted-foreground">
                      Current: {formatLargeNumber(customDCFResult.price)} | 
                      Diff: {formatPercentage(((customDCFResult.equityValuePerShare - customDCFResult.price) / customDCFResult.price) * 100)}
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Enterprise Value</p>
                    <p className="text-2xl font-bold">{formatLargeNumber(customDCFResult.enterpriseValue)}</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">WACC</p>
                    <p className="text-2xl font-bold">{formatPercentage(customDCFResult.wacc)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Key Assumptions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Revenue Growth</p>
                      <p className="text-base font-medium">{formatPercentage(customDCFResult.revenuePercentage)}</p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Capital Expenditure %</p>
                      <p className="text-base font-medium">{formatPercentage(customDCFResult.capitalExpenditurePercentage)}</p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Terminal Growth</p>
                      <p className="text-base font-medium">{formatPercentage(customDCFResult.longTermGrowthRate)}</p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Tax Rate</p>
                      <p className="text-base font-medium">{formatPercentage(customDCFResult.taxRate)}</p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Beta</p>
                      <p className="text-base font-medium">{customDCFResult.beta.toFixed(2)}</p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Cost of Equity</p>
                      <p className="text-base font-medium">{formatPercentage(customDCFResult.costOfEquity)}</p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Cost of Debt</p>
                      <p className="text-base font-medium">{formatPercentage(customDCFResult.costofDebt)}</p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Risk-Free Rate</p>
                      <p className="text-base font-medium">{formatPercentage(customDCFResult.riskFreeRate)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Valuation Components</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">Cash Flow Analysis</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-sm">Free Cash Flow</span>
                          <span>{formatLargeNumber(customDCFResult.freeCashFlow)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-sm">Sum of PV of LFCF</span>
                          <span>{formatLargeNumber(customDCFResult.sumPvLfcf)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-sm">Terminal Value</span>
                          <span>{formatLargeNumber(customDCFResult.terminalValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-sm">PV of Terminal Value</span>
                          <span>{formatLargeNumber(customDCFResult.presentTerminalValue)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">Capital Structure</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-sm">Total Debt</span>
                          <span>{formatLargeNumber(customDCFResult.totalDebt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-sm">Total Equity</span>
                          <span>{formatLargeNumber(customDCFResult.totalEquity)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-sm">Debt Weighting</span>
                          <span>{formatPercentage(customDCFResult.debtWeighting)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-sm">Equity Weighting</span>
                          <span>{formatPercentage(customDCFResult.equityWeighting)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DCFTabContent;
