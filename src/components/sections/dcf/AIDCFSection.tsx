
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, AlertTriangle, BarChart3 } from "lucide-react";
import { fetchAIDCF, AIDCFResult } from "@/services/api/analysis/dcf/aiDCFService";
import { formatCurrency, formatPercent } from "@/utils/financial/formatUtils";

interface AIDCFSectionProps {
  symbol: string;
  currentPrice: number;
}

const AIDCFSection: React.FC<AIDCFSectionProps> = ({ symbol, currentPrice }) => {
  const [result, setResult] = useState<AIDCFResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-700 mb-4">
            Our AI analyzes historical financials and market data to generate intelligent DCF assumptions 
            and calculate an intrinsic value estimation for {symbol}.
          </p>
          
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
                  <h3 className="text-lg font-semibold text-gray-900">Intrinsic Value</h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-3xl font-bold text-purple-700">
                      {formatCurrency(result.intrinsicValuePerShare)}
                    </span>
                    {result.upside !== null && (
                      <span className={`ml-2 px-2 py-1 rounded-md text-sm ${
                        result.upside > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.upside > 0 ? '↑' : '↓'} {formatPercent(Math.abs(result.upside) / 100)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Current Price: {formatCurrency(result.currentPrice || currentPrice)}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                  <h4 className="text-sm font-medium text-purple-800">AI-Generated Assumptions</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Growth Rate:</span>
                      <span className="font-medium">{formatPercent(result.assumptions.averageRevenueGrowth)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">WACC:</span>
                      <span className="font-medium">{formatPercent(result.assumptions.wacc)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Terminal Growth:</span>
                      <span className="font-medium">{formatPercent(result.assumptions.terminalGrowth)}</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
                      Projected Free Cash Flows
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1">
                      {result.projectedFCFs.map((fcf, index) => (
                        <li key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">Year {index + 1}:</span>
                          <span className="font-medium">{formatCurrency(fcf)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Valuation Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1">
                      <li className="flex justify-between text-sm">
                        <span className="text-gray-600">Terminal Value:</span>
                        <span className="font-medium">{formatCurrency(result.terminalValue)}</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span className="text-gray-600">Enterprise Value:</span>
                        <span className="font-medium">{formatCurrency(result.enterpriseValue)}</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span className="text-gray-600">Equity Value:</span>
                        <span className="font-medium">{formatCurrency(result.equityValue)}</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span className="text-gray-600">Shares Outstanding:</span>
                        <span className="font-medium">{result.sharesOutstanding.toLocaleString()}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
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
