
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Growth Parameters</h3>
        <div className="grid grid-cols-1 gap-y-4">
          <div className="space-y-2">
            <Label htmlFor="revenueGrowth">Revenue Growth (%)</Label>
            <Input
              id="revenueGrowth"
              name="revenueGrowth"
              type="number"
              step="0.1"
              value={customParams.revenueGrowth}
              onChange={onInputChange}
              placeholder="10.94"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ebitdaMargin">EBITDA Margin (%)</Label>
            <Input
              id="ebitdaMargin"
              name="ebitdaMargin"
              type="number"
              step="0.1"
              value={customParams.ebitdaMargin}
              onChange={onInputChange}
              placeholder="31.27"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="capexPercent">CAPEX % of Revenue</Label>
            <Input
              id="capexPercent"
              name="capexPercent"
              type="number"
              step="0.01"
              value={customParams.capexPercent}
              onChange={onInputChange}
              placeholder="3.06"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              name="taxRate"
              type="number"
              step="0.1"
              value={customParams.taxRate}
              onChange={onInputChange}
              placeholder="24.09"
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Discount Parameters</h3>
        <div className="grid grid-cols-1 gap-y-4">
          <div className="space-y-2">
            <Label htmlFor="longTermGrowthRate">Long Term Growth Rate (%)</Label>
            <Input
              id="longTermGrowthRate"
              name="longTermGrowthRate"
              type="number"
              step="0.1"
              value={customParams.longTermGrowthRate}
              onChange={onInputChange}
              placeholder="4.0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="costOfEquity">Cost of Equity (%)</Label>
            <Input
              id="costOfEquity"
              name="costOfEquity"
              type="number"
              step="0.01"
              value={customParams.costOfEquity}
              onChange={onInputChange}
              placeholder="9.51"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="costOfDebt">Cost of Debt (%)</Label>
            <Input
              id="costOfDebt"
              name="costOfDebt"
              type="number"
              step="0.01"
              value={customParams.costOfDebt}
              onChange={onInputChange}
              placeholder="3.64"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="beta">Beta</Label>
            <Input
              id="beta"
              name="beta"
              type="number"
              step="0.001"
              value={customParams.beta}
              onChange={onInputChange}
              placeholder="1.244"
            />
          </div>
        </div>
      </div>
      
      <Button 
        onClick={onCalculate} 
        disabled={isCalculating} 
        className="w-full"
      >
        {isCalculating ? (
          <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Calculating...</>
        ) : (
          <>Calculate Custom DCF</>
        )}
      </Button>
    </div>
  );
};

export default DCFInputForm;
