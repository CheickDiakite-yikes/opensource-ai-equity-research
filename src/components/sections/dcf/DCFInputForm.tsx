
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";

interface DCFInputFormProps {
  customParams: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  isCalculating: boolean;
  onCalculate: () => void;
}

const DCFInputForm: React.FC<DCFInputFormProps> = ({
  customParams,
  onInputChange,
  onSelectChange,
  isCalculating,
  onCalculate
}) => {
  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Growth & Profitability</h3>
        
        <div className="space-y-2">
          <label className="text-sm">Revenue Growth (%)</label>
          <Input 
            name="revenueGrowth" 
            value={customParams.revenueGrowth} 
            onChange={onInputChange}
            type="number"
            step="0.1"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm">EBITDA Margin (%)</label>
          <Input 
            name="ebitdaMargin" 
            value={customParams.ebitdaMargin} 
            onChange={onInputChange}
            type="number"
            step="0.1"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm">CapEx (% of Revenue)</label>
          <Input 
            name="capexPercent" 
            value={customParams.capexPercent} 
            onChange={onInputChange}
            type="number"
            step="0.1"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm">Tax Rate (%)</label>
          <Input 
            name="taxRate" 
            value={customParams.taxRate} 
            onChange={onInputChange}
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
            onChange={onInputChange}
            type="number"
            step="0.1"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm">Beta</label>
          <Input 
            name="beta" 
            value={customParams.beta} 
            onChange={onInputChange}
            type="number"
            step="0.01"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm">Risk-Free Rate (%)</label>
          <Input 
            name="riskFreeRate" 
            value={customParams.riskFreeRate} 
            onChange={onInputChange}
            type="number"
            step="0.1"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm">Market Risk Premium (%)</label>
          <Input 
            name="marketRiskPremium" 
            value={customParams.marketRiskPremium} 
            onChange={onInputChange}
            type="number"
            step="0.1"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm">Cost of Debt (%)</label>
          <Input 
            name="costOfDebt" 
            value={customParams.costOfDebt} 
            onChange={onInputChange}
            type="number"
            step="0.1"
          />
        </div>
      </div>
      
      <Button 
        className="w-full mt-4" 
        onClick={onCalculate}
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
  );
};

export default DCFInputForm;
