
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, RefreshCw, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, formatLargeNumber, formatPercentage } from "@/lib/utils";
import { CustomDCFResult, YearlyDCFData } from "@/types";
import { DCFType } from "@/services/api/analysis/dcfService";
import DCFInputForm from "./DCFInputForm";
import DCFResultsDisplay from "./DCFResultsDisplay";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CustomDCFSectionProps {
  symbol: string;
  currentPrice: number;
  isCalculating: boolean;
  customDCFResult: CustomDCFResult | null;
  projectedData: YearlyDCFData[];
  error: string | null;
  customParams: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onCalculate: () => void;
  onCalculateStandard: () => void;
  onCalculateLevered: () => void;
  dcfModel: DCFType;
  onModelChange: (model: DCFType) => void;
}

const CustomDCFSection: React.FC<CustomDCFSectionProps> = ({
  symbol,
  currentPrice,
  isCalculating,
  customDCFResult,
  projectedData,
  error,
  customParams,
  onInputChange,
  onSelectChange,
  onCalculate,
  onCalculateStandard,
  onCalculateLevered,
  dcfModel,
  onModelChange
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>DCF Model Selection</CardTitle>
          <CardDescription>Choose DCF calculation method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <RadioGroup 
              value={dcfModel} 
              onValueChange={(value) => onModelChange(value as DCFType)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={DCFType.STANDARD} id="standard" />
                <Label htmlFor="standard">Standard DCF</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={DCFType.LEVERED} id="levered" />
                <Label htmlFor="levered">Levered DCF</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={DCFType.CUSTOM_ADVANCED} id="custom-advanced" />
                <Label htmlFor="custom-advanced">Custom DCF (Advanced)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={DCFType.CUSTOM_LEVERED} id="custom-levered" />
                <Label htmlFor="custom-levered">Custom DCF (Levered)</Label>
              </div>
            </RadioGroup>
            
            <div className="pt-2 flex flex-col gap-2">
              {(dcfModel === DCFType.STANDARD) && (
                <Button onClick={onCalculateStandard} disabled={isCalculating}>
                  {isCalculating ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Calculating...</>
                  ) : (
                    <>Calculate Standard DCF</>
                  )}
                </Button>
              )}
              
              {(dcfModel === DCFType.LEVERED) && (
                <Button onClick={onCalculateLevered} disabled={isCalculating}>
                  {isCalculating ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Calculating...</>
                  ) : (
                    <>Calculate Levered DCF</>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          {(dcfModel === DCFType.CUSTOM_ADVANCED || dcfModel === DCFType.CUSTOM_LEVERED) && (
            <DCFInputForm 
              customParams={customParams}
              onInputChange={onInputChange}
              onSelectChange={onSelectChange}
              isCalculating={isCalculating}
              onCalculate={onCalculate}
            />
          )}
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>DCF Results</CardTitle>
          <CardDescription>
            {customDCFResult ? (
              `Generated for ${symbol} using ${
                dcfModel === DCFType.STANDARD ? "Standard" :
                dcfModel === DCFType.LEVERED ? "Levered" :
                dcfModel === DCFType.CUSTOM_ADVANCED ? "Custom Advanced" :
                "Custom Levered"
              } DCF model`
            ) : (
              "Select a DCF model and calculate to generate valuation results"
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
              <h3 className="text-lg font-medium mb-2">Ready for Analysis</h3>
              <p className="text-muted-foreground max-w-md">
                {dcfModel === DCFType.STANDARD || dcfModel === DCFType.LEVERED ? 
                  "Click 'Calculate' to perform a DCF analysis with standard parameters." :
                  "Adjust the parameters to tailor your DCF model, then click Calculate to see custom valuation results."
                }
              </p>
            </div>
          )}
          
          {customDCFResult && (
            <DCFResultsDisplay 
              customDCFResult={customDCFResult} 
              projectedData={projectedData}
              currentPrice={currentPrice} 
              dcfModel={dcfModel}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomDCFSection;
