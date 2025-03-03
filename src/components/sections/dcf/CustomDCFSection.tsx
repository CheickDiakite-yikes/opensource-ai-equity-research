
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, RefreshCw, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, formatLargeNumber, formatPercentage } from "@/lib/utils";
import { CustomDCFResult } from "@/types";
import DCFInputForm from "./DCFInputForm";
import DCFResultsDisplay from "./DCFResultsDisplay";

interface CustomDCFSectionProps {
  symbol: string;
  currentPrice: number;
  isCalculating: boolean;
  customDCFResult: CustomDCFResult | null;
  error: string | null;
  customParams: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onCalculate: () => void;
}

const CustomDCFSection: React.FC<CustomDCFSectionProps> = ({
  symbol,
  currentPrice,
  isCalculating,
  customDCFResult,
  error,
  customParams,
  onInputChange,
  onSelectChange,
  onCalculate
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Custom DCF Inputs</CardTitle>
          <CardDescription>Adjust parameters to customize your DCF model</CardDescription>
        </CardHeader>
        <CardContent>
          <DCFInputForm 
            customParams={customParams}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            isCalculating={isCalculating}
            onCalculate={onCalculate}
          />
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
            <DCFResultsDisplay 
              customDCFResult={customDCFResult} 
              currentPrice={currentPrice} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomDCFSection;
