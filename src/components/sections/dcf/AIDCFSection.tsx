
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, AlertTriangle, BarChart3, TrendingUp, Gauge, Building, ArrowUpDown } from "lucide-react";
import { fetchAIDCF, AIDCFResult } from "@/services/api/analysis/dcf/aiDCFService";
import { formatCurrency, formatPercentage } from "@/utils/financial/formatUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIDCFSectionProps {
  symbol: string;
  currentPrice: number;
}

const AIDCFSection: React.FC<AIDCFSectionProps> = ({ symbol, currentPrice }) => {
  const [result, setResult] = useState<AIDCFResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("summary");

  const calculateAIDCF = async () => {
    if (!symbol) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchAIDCF(symbol);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate AI-powered DCF");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Clear results when symbol changes
    setResult(null);
    setError(null);
  }, [symbol]);
  
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg text-purple-900">
            <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
            AI-Powered DCF Analysis
          </CardTitle>
          <CardDescription className="text-purple-700">
            Our AI analyzes historical financials and market data to generate intelligent DCF assumptions 
            and calculate an intrinsic value estimation for {symbol}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!result && !isLoading && !error && (
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={calculateAIDCF}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI-Powered DCF
            </Button>
          )}
          
          {isLoading && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              <Skeleton className="h-[125px] w-full" />
              <p className="text-sm text-purple-600 animate-pulse">AI is analyzing financials and generating DCF...</p>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button 
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={calculateAIDCF}
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {result && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {result.companyName || symbol} Intrinsic Value
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-3xl font-bold text-purple-700">
                      {formatCurrency(result.intrinsicValuePerShare)}
                    </span>
                    {result.upside !== null && (
                      <span className={`ml-2 px-2 py-1 rounded-md text-sm ${
                        result.upside > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.upside > 0 ? '↑' : '↓'} {formatPercentage(Math.abs(result.upside) / 100)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Current Price: {formatCurrency(result.currentPrice || currentPrice)}
                  </p>
                  {result.sector && result.industry && (
                    <p className="text-xs text-gray-500 mt-1">
                      {result.sector} • {result.industry}
                    </p>
                  )}
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                  <h4 className="text-sm font-medium text-purple-800">AI-Generated Assumptions</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Growth Rate:</span>
                      <span className="font-medium">{formatPercentage(result.assumptions.averageRevenueGrowth)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">WACC:</span>
                      <span className="font-medium">{formatPercentage(result.assumptions.wacc)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Terminal Growth:</span>
                      <span className="font-medium">{formatPercentage(result.assumptions.terminalGrowth)}</span>
                    </li>
                    {result.assumptions.beta && (
                      <li className="flex justify-between">
                        <span className="text-gray-600">Beta:</span>
                        <span className="font-medium">{result.assumptions.beta.toFixed(2)}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="summary" className="text-xs sm:text-sm">
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="projections" className="text-xs sm:text-sm">
                    Projections
                  </TabsTrigger>
                  <TabsTrigger value="scenarios" className="text-xs sm:text-sm">
                    Scenarios
                  </TabsTrigger>
                  <TabsTrigger value="industry" className="text-xs sm:text-sm">
                    Industry
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
                          Valuation Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="space-y-1">
                          <li className="flex justify-between text-sm">
                            <span className="text-gray-600">Enterprise Value:</span>
                            <span className="font-medium">{formatCurrency(result.enterpriseValue)}</span>
                          </li>
                          <li className="flex justify-between text-sm">
                            <span className="text-gray-600">Equity Value:</span>
                            <span className="font-medium">{formatCurrency(result.equityValue)}</span>
                          </li>
                          <li className="flex justify-between text-sm">
                            <span className="text-gray-600">Value per Share:</span>
                            <span className="font-medium">{formatCurrency(result.intrinsicValuePerShare)}</span>
                          </li>
                          <li className="flex justify-between text-sm">
                            <span className="text-gray-600">Shares Outstanding:</span>
                            <span className="font-medium">{result.sharesOutstanding.toLocaleString()}</span>
                          </li>
                          <li className="flex justify-between text-sm">
                            <span className="text-gray-600">Terminal Value:</span>
                            <span className="font-medium">{formatCurrency(result.terminalValue)}</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    {result.keyMetrics && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Gauge className="h-4 w-4 mr-2 text-purple-500" />
                            Key Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ul className="space-y-1">
                            <li className="flex justify-between text-sm">
                              <span className="text-gray-600">P/E Ratio:</span>
                              <span className="font-medium">{result.keyMetrics.pe.toFixed(2)}</span>
                            </li>
                            <li className="flex justify-between text-sm">
                              <span className="text-gray-600">Market Cap:</span>
                              <span className="font-medium">{formatCurrency(result.keyMetrics.marketCap)}</span>
                            </li>
                            <li className="flex justify-between text-sm">
                              <span className="text-gray-600">Dividend:</span>
                              <span className="font-medium">{formatCurrency(result.keyMetrics.lastDividend)}</span>
                            </li>
                            <li className="flex justify-between text-sm">
                              <span className="text-gray-600">Avg. Volume:</span>
                              <span className="font-medium">{result.keyMetrics.volume.toLocaleString()}</span>
                            </li>
                            <li className="flex justify-between text-sm">
                              <span className="text-gray-600">Exchange:</span>
                              <span className="font-medium">{result.keyMetrics.exchange}</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="projections" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
                        Projected Free Cash Flows (5-Years)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium text-gray-600">Year</th>
                              {result.projectedFCFs.map((_, index) => (
                                <th key={index} className="text-right py-2 font-medium text-gray-600">
                                  Year {index + 1}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-2 text-gray-600">Projected FCF</td>
                              {result.projectedFCFs.map((fcf, index) => (
                                <td key={index} className="text-right py-2 font-medium">
                                  {formatCurrency(fcf)}
                                </td>
                              ))}
                            </tr>
                            <tr className="bg-purple-50">
                              <td className="py-2 text-gray-600">Growth Rate</td>
                              {result.projectedFCFs.map((_, index) => (
                                <td key={index} className="text-right py-2 font-medium">
                                  {formatPercentage(result.assumptions.averageRevenueGrowth)}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        <p className="font-medium">Terminal Value: {formatCurrency(result.terminalValue)}</p>
                        <p className="text-xs mt-1">
                          Calculated using a terminal growth rate of {formatPercentage(result.assumptions.terminalGrowth)} 
                          and a WACC of {formatPercentage(result.assumptions.wacc)}.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="scenarios" className="space-y-4">
                  {result.scenarioAnalysis ? (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <ArrowUpDown className="h-4 w-4 mr-2 text-purple-500" />
                          Scenario Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 font-medium text-gray-600">Scenario</th>
                                <th className="text-right py-2 font-medium text-gray-600">Growth Rate</th>
                                <th className="text-right py-2 font-medium text-gray-600">WACC</th>
                                <th className="text-right py-2 font-medium text-gray-600">Intrinsic Value</th>
                                <th className="text-right py-2 font-medium text-gray-600">Upside</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="bg-amber-50">
                                <td className="py-2 font-medium text-amber-700">Bearish</td>
                                <td className="text-right py-2">{formatPercentage(result.scenarioAnalysis.bearish.growth)}</td>
                                <td className="text-right py-2">{formatPercentage(result.scenarioAnalysis.bearish.wacc)}</td>
                                <td className="text-right py-2 font-medium">{formatCurrency(result.scenarioAnalysis.bearish.intrinsicValue)}</td>
                                <td className="text-right py-2 font-medium text-red-600">
                                  {formatPercentage((result.scenarioAnalysis.bearish.intrinsicValue - (result.currentPrice || currentPrice)) / (result.currentPrice || currentPrice))}
                                </td>
                              </tr>
                              <tr className="bg-blue-50">
                                <td className="py-2 font-medium text-blue-700">Base Case</td>
                                <td className="text-right py-2">{formatPercentage(result.scenarioAnalysis.base.growthRate)}</td>
                                <td className="text-right py-2">{formatPercentage(result.scenarioAnalysis.base.wacc)}</td>
                                <td className="text-right py-2 font-medium">{formatCurrency(result.scenarioAnalysis.base.intrinsicValue)}</td>
                                <td className="text-right py-2 font-medium">
                                  {formatPercentage((result.scenarioAnalysis.base.intrinsicValue - (result.currentPrice || currentPrice)) / (result.currentPrice || currentPrice))}
                                </td>
                              </tr>
                              <tr className="bg-green-50">
                                <td className="py-2 font-medium text-green-700">Bullish</td>
                                <td className="text-right py-2">{formatPercentage(result.scenarioAnalysis.bullish.growth)}</td>
                                <td className="text-right py-2">{formatPercentage(result.scenarioAnalysis.bullish.wacc)}</td>
                                <td className="text-right py-2 font-medium">{formatCurrency(result.scenarioAnalysis.bullish.intrinsicValue)}</td>
                                <td className="text-right py-2 font-medium text-green-600">
                                  {formatPercentage((result.scenarioAnalysis.bullish.intrinsicValue - (result.currentPrice || currentPrice)) / (result.currentPrice || currentPrice))}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                          <p className="font-medium">Scenario Assumptions:</p>
                          <ul className="mt-1 space-y-1 list-disc pl-4">
                            <li><strong>Bearish:</strong> Lower growth rate, higher discount rate</li>
                            <li><strong>Base:</strong> Expected growth and market discount rate</li>
                            <li><strong>Bullish:</strong> Higher growth rate, lower discount rate</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No scenario analysis data available
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="industry" className="space-y-4">
                  {result.industryComparison ? (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Building className="h-4 w-4 mr-2 text-purple-500" />
                          Industry Comparison
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 font-medium text-gray-600">Metric</th>
                                <th className="text-right py-2 font-medium text-gray-600">{symbol}</th>
                                <th className="text-right py-2 font-medium text-gray-600">Industry Avg</th>
                                <th className="text-left py-2 font-medium text-gray-600 pl-4">Comparison</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="py-2 text-gray-600">Revenue Growth</td>
                                <td className="text-right py-2 font-medium">
                                  {formatPercentage(result.industryComparison.revenueGrowth.company)}
                                </td>
                                <td className="text-right py-2">
                                  {formatPercentage(result.industryComparison.revenueGrowth.industry)}
                                </td>
                                <td className="py-2 pl-4 text-xs">
                                  <span className={
                                    result.industryComparison.revenueGrowth.difference.includes('better') 
                                      ? 'text-green-600' 
                                      : result.industryComparison.revenueGrowth.difference.includes('worse')
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                  }>
                                    {result.industryComparison.revenueGrowth.difference}
                                  </span>
                                </td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="py-2 text-gray-600">Profit Margin</td>
                                <td className="text-right py-2 font-medium">
                                  {formatPercentage(result.industryComparison.profitMargin.company)}
                                </td>
                                <td className="text-right py-2">
                                  {formatPercentage(result.industryComparison.profitMargin.industry)}
                                </td>
                                <td className="py-2 pl-4 text-xs">
                                  <span className={
                                    result.industryComparison.profitMargin.difference.includes('better') 
                                      ? 'text-green-600' 
                                      : result.industryComparison.profitMargin.difference.includes('worse')
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                  }>
                                    {result.industryComparison.profitMargin.difference}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-2 text-gray-600">Debt Ratio</td>
                                <td className="text-right py-2 font-medium">
                                  {formatPercentage(result.industryComparison.debtRatio.company)}
                                </td>
                                <td className="text-right py-2">
                                  {formatPercentage(result.industryComparison.debtRatio.industry)}
                                </td>
                                <td className="py-2 pl-4 text-xs">
                                  <span className={
                                    result.industryComparison.debtRatio.difference.includes('better') 
                                      ? 'text-green-600' 
                                      : result.industryComparison.debtRatio.difference.includes('worse')
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                  }>
                                    {result.industryComparison.debtRatio.difference}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                          <p>Analysis based on comparison with peer companies in {result.industry || "the same industry"}.</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No industry comparison data available
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={calculateAIDCF}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <Sparkles className="mr-2 h-3 w-3" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIDCFSection;
