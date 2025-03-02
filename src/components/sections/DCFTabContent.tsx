
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatLargeNumber, formatPercentage } from "@/lib/utils";
import { useCustomDCF } from "@/hooks/useCustomDCF";
import { ArrowRight, Info, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

interface DCFTabContentProps {
  financials: any[];
  symbol: string;
}

const DCFTabContent: React.FC<DCFTabContentProps> = ({ financials, symbol }) => {
  const [activeTab, setActiveTab] = useState<string>("automatic");
  
  // Custom DCF inputs state
  const [customParams, setCustomParams] = useState({
    revenueGrowth: "10.94",
    ebitdaMargin: "31.27",
    capexPercent: "3.06", 
    taxRate: "24.09",
    longTermGrowthRate: "4.0",
    costOfEquity: "9.51",
    costOfDebt: "3.64",
    beta: "1.244",
    marketRiskPremium: "4.72",
    riskFreeRate: "3.64"
  });
  
  // Custom DCF calculation hook
  const { 
    calculateCustomDCF, 
    customDCFResult, 
    isCalculating, 
    error 
  } = useCustomDCF(symbol);
  
  // In a real app, this would be calculated using actual DCF model
  const mockDCFData = {
    intrinsicValue: financials[0]?.revenue ? (financials[0].netIncome * 15) : 0,
    assumptions: {
      growthRate: "8.5% (first 5 years), 3% (terminal)",
      discountRate: "10.5%",
      terminalMultiple: "15x",
      taxRate: "21%"
    },
    projections: [1, 2, 3, 4, 5].map(year => ({
      year: `Year ${year}`,
      revenue: financials[0]?.revenue ? (financials[0].revenue * Math.pow(1.085, year)) : 0,
      ebit: financials[0]?.operatingIncome ? (financials[0].operatingIncome * Math.pow(1.09, year)) : 0,
      fcf: financials[0]?.netIncome ? (financials[0].netIncome * 0.8 * Math.pow(1.075, year)) : 0
    })),
    sensitivity: {
      headers: ["", "9.5%", "10.0%", "10.5%", "11.0%", "11.5%"],
      rows: [
        { growth: "2.0%", values: [95, 90, 85, 80, 75] },
        { growth: "2.5%", values: [100, 95, 90, 85, 80] },
        { growth: "3.0%", values: [105, 100, 95, 90, 85] },
        { growth: "3.5%", values: [110, 105, 100, 95, 90] },
        { growth: "4.0%", values: [115, 110, 105, 100, 95] }
      ]
    }
  };

  const currentPrice = financials[0]?.price || 100;
  const dcfValue = mockDCFData.intrinsicValue;
  const upside = ((dcfValue / currentPrice) - 1) * 100;
  
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>DCF Valuation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Intrinsic Value</div>
                      <div className="text-2xl font-bold">{formatCurrency(dcfValue)}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${upside >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      <div className="text-sm opacity-80 mb-1">Potential Upside</div>
                      <div className="text-2xl font-bold">{upside.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Key Assumptions</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Growth Rate:</div>
                      <div>{mockDCFData.assumptions.growthRate}</div>
                      <div className="text-muted-foreground">Discount Rate (WACC):</div>
                      <div>{mockDCFData.assumptions.discountRate}</div>
                      <div className="text-muted-foreground">Terminal Multiple:</div>
                      <div>{mockDCFData.assumptions.terminalMultiple}</div>
                      <div className="text-muted-foreground">Tax Rate:</div>
                      <div>{mockDCFData.assumptions.taxRate}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Projected Cash Flows</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">All figures in millions (USD)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium py-2">Period</th>
                        <th className="text-right font-medium py-2">Revenue</th>
                        <th className="text-right font-medium py-2">EBIT</th>
                        <th className="text-right font-medium py-2">Free Cash Flow</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockDCFData.projections.map((proj, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2">{proj.year}</td>
                          <td className="text-right py-2">${(proj.revenue / 1000000).toFixed(2)}</td>
                          <td className="text-right py-2">${(proj.ebit / 1000000).toFixed(2)}</td>
                          <td className="text-right py-2">${(proj.fcf / 1000000).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Sensitivity Analysis</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Stock price in USD based on different inputs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                The table below shows how changes in the discount rate (WACC) and terminal growth rate affect the estimated stock price.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-medium p-2">Growth / WACC</th>
                      {mockDCFData.sensitivity.headers.slice(1).map((header, i) => (
                        <th key={i} className="text-center font-medium p-2">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockDCFData.sensitivity.rows.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-2 font-medium">{row.growth}</td>
                        {row.values.map((value, j) => {
                          const percentChange = ((value - 95) / 95) * 100;
                          const basePrice = currentPrice;
                          const adjustedPrice = basePrice * (1 + percentChange / 100);
                          
                          return (
                            <td 
                              key={j} 
                              className={`p-2 text-center ${
                                adjustedPrice > currentPrice 
                                  ? 'bg-green-50 text-green-700' 
                                  : adjustedPrice < currentPrice 
                                    ? 'bg-red-50 text-red-700' 
                                    : ''
                              }`}
                            >
                              {formatCurrency(parseFloat(adjustedPrice.toFixed(2)))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Custom DCF Inputs</CardTitle>
                <CardDescription>Adjust parameters to customize your DCF model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Growth & Profitability</h3>
                    
                    <div className="space-y-2">
                      <label className="text-sm">Revenue Growth (%)</label>
                      <Input 
                        name="revenueGrowth" 
                        value={customParams.revenueGrowth} 
                        onChange={handleInputChange}
                        type="number"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm">EBITDA Margin (%)</label>
                      <Input 
                        name="ebitdaMargin" 
                        value={customParams.ebitdaMargin} 
                        onChange={handleInputChange}
                        type="number"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm">CapEx (% of Revenue)</label>
                      <Input 
                        name="capexPercent" 
                        value={customParams.capexPercent} 
                        onChange={handleInputChange}
                        type="number"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm">Tax Rate (%)</label>
                      <Input 
                        name="taxRate" 
                        value={customParams.taxRate} 
                        onChange={handleInputChange}
                        type="number"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Discount & Valuation</h3>
                    
                    <div className="space-y-2">
                      <label className="text-sm">Long-Term Growth Rate (%)</label>
                      <Input 
                        name="longTermGrowthRate" 
                        value={customParams.longTermGrowthRate} 
                        onChange={handleInputChange}
                        type="number"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm">Beta</label>
                      <Input 
                        name="beta" 
                        value={customParams.beta} 
                        onChange={handleInputChange}
                        type="number"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm">Risk-Free Rate (%)</label>
                      <Input 
                        name="riskFreeRate" 
                        value={customParams.riskFreeRate} 
                        onChange={handleInputChange}
                        type="number"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm">Market Risk Premium (%)</label>
                      <Input 
                        name="marketRiskPremium" 
                        value={customParams.marketRiskPremium} 
                        onChange={handleInputChange}
                        type="number"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm">Cost of Debt (%)</label>
                      <Input 
                        name="costOfDebt" 
                        value={customParams.costOfDebt} 
                        onChange={handleInputChange}
                        type="number"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleCalculateCustomDCF}
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        Calculate Custom DCF
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Custom DCF Results</CardTitle>
                <CardDescription>
                  {customDCFResult ? (
                    `Generated for ${symbol} using your custom parameters`
                  ) : (
                    "Adjust parameters and click calculate to generate a custom DCF model"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 text-red-800 flex items-start">
                    <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                {!customDCFResult && !error && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-blue-50 rounded-full p-4 mb-4">
                      <Info className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Ready for Custom Analysis</h3>
                    <p className="text-muted-foreground max-w-md">
                      Adjust the parameters on the left to tailor your DCF model, then click Calculate to see custom valuation results.
                    </p>
                  </div>
                )}
                
                {customDCFResult && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`p-5 rounded-lg ${
                          (customDCFResult.equityValuePerShare > currentPrice) 
                            ? 'bg-green-50 border border-green-100' 
                            : 'bg-red-50 border border-red-100'
                        }`}
                      >
                        <div className="text-sm text-muted-foreground">Intrinsic Value Per Share</div>
                        <div className="text-3xl font-bold mb-1">
                          {formatCurrency(customDCFResult.equityValuePerShare)}
                        </div>
                        <div className={`text-sm font-medium ${
                          (customDCFResult.equityValuePerShare > currentPrice) 
                            ? 'text-green-700' 
                            : 'text-red-700'
                        }`}>
                          {((customDCFResult.equityValuePerShare / currentPrice - 1) * 100).toFixed(1)}% {customDCFResult.equityValuePerShare > currentPrice ? 'Upside' : 'Downside'}
                        </div>
                      </motion.div>
                      
                      <div className="bg-muted/30 p-5 rounded-lg border border-border/50">
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                          <div className="text-muted-foreground">Current Price:</div>
                          <div className="font-medium">{formatCurrency(currentPrice)}</div>
                          
                          <div className="text-muted-foreground">WACC:</div>
                          <div>{formatPercentage(customDCFResult.wacc)}</div>
                          
                          <div className="text-muted-foreground">Enterprise Value:</div>
                          <div>{formatLargeNumber(customDCFResult.enterpriseValue)}</div>
                          
                          <div className="text-muted-foreground">Equity Value:</div>
                          <div>{formatLargeNumber(customDCFResult.equityValue)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Key Metrics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-muted/30 p-3 rounded border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">Terminal Value</div>
                          <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.terminalValue)}</div>
                        </div>
                        <div className="bg-muted/30 p-3 rounded border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">PV of FCF</div>
                          <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.sumPvLfcf)}</div>
                        </div>
                        <div className="bg-muted/30 p-3 rounded border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">Terminal FCF</div>
                          <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.freeCashFlowT1)}</div>
                        </div>
                        <div className="bg-muted/30 p-3 rounded border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">Net Debt</div>
                          <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.netDebt)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Projected Cash Flow (Year {customDCFResult.year})</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Revenue</th>
                              <th className="text-left p-2">Capital Expenditure</th>
                              <th className="text-left p-2">Operating Cash Flow</th>
                              <th className="text-left p-2">Free Cash Flow</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="p-2">{formatLargeNumber(customDCFResult.revenue)}</td>
                              <td className="p-2">{formatLargeNumber(customDCFResult.capitalExpenditure)}</td>
                              <td className="p-2">{formatLargeNumber(customDCFResult.operatingCashFlow)}</td>
                              <td className="p-2">{formatLargeNumber(customDCFResult.freeCashFlow)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DCFTabContent;
