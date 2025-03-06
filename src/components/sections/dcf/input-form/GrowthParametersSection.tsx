
import React from "react";
import InputField from "./InputField";
import { Separator } from "@/components/ui/separator";

interface GrowthParametersSectionProps {
  customParams: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const GrowthParametersSection: React.FC<GrowthParametersSectionProps> = ({
  customParams,
  onInputChange
}) => {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Growth Parameters (Enter as Decimals)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField 
          label="Revenue Growth" 
          name="revenueGrowth" 
          value={customParams.revenueGrowth} 
          onChange={onInputChange}
          placeholder="0.1094"
          helpText="Enter as decimal (e.g., 0.1094 = 10.94%)"
          type="decimal"
        />
        
        <InputField 
          label="EBITDA Margin" 
          name="ebitdaMargin" 
          value={customParams.ebitdaMargin} 
          onChange={onInputChange}
          placeholder="0.3127"
          helpText="Enter as decimal (e.g., 0.3127 = 31.27%)"
          type="decimal"
        />
      </div>
      <Separator className="mt-6" />
    </div>
  );
};

export default GrowthParametersSection;
