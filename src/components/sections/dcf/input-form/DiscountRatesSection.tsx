
import React from "react";
import InputField from "./InputField";

interface DiscountRatesSectionProps {
  customParams: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DiscountRatesSection: React.FC<DiscountRatesSectionProps> = ({
  customParams,
  onInputChange
}) => {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Discount & Valuation Rates (Enter as Whole Numbers)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField 
          label="Long-Term Growth Rate (%)" 
          name="longTermGrowthRate" 
          value={customParams.longTermGrowthRate} 
          onChange={onInputChange}
          placeholder="4"
          helpText="Enter as whole number (e.g., 4 = 4%)"
          type="percentage"
        />
        
        <InputField 
          label="Cost of Equity (%)" 
          name="costOfEquity" 
          value={customParams.costOfEquity} 
          onChange={onInputChange}
          placeholder="9.51"
          helpText="Enter as whole number (e.g., 9.51 = 9.51%)"
          type="percentage"
        />
        
        <InputField 
          label="Cost of Debt (%)" 
          name="costOfDebt" 
          value={customParams.costOfDebt} 
          onChange={onInputChange}
          placeholder="3.64"
          helpText="Enter as whole number (e.g., 3.64 = 3.64%)"
          type="percentage"
        />
        
        <InputField 
          label="Market Risk Premium (%)" 
          name="marketRiskPremium" 
          value={customParams.marketRiskPremium} 
          onChange={onInputChange}
          placeholder="4.72"
          helpText="Enter as whole number (e.g., 4.72 = 4.72%)"
          type="percentage"
        />
        
        <InputField 
          label="Risk-Free Rate (%)" 
          name="riskFreeRate" 
          value={customParams.riskFreeRate} 
          onChange={onInputChange}
          placeholder="3.64"
          helpText="Enter as whole number (e.g., 3.64 = 3.64%)"
          type="percentage"
        />
        
        <InputField 
          label="Beta" 
          name="beta" 
          value={customParams.beta} 
          onChange={onInputChange}
          placeholder="1.244"
          helpText="Enter the stock's beta value"
          type="number"
        />
      </div>
    </div>
  );
};

export default DiscountRatesSection;
