
import React from "react";
import InputField from "./InputField";
import { Separator } from "@/components/ui/separator";

interface CashFlowProfitabilitySectionProps {
  customParams: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CashFlowProfitabilitySection: React.FC<CashFlowProfitabilitySectionProps> = ({
  customParams,
  onInputChange
}) => {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Cash Flow & Profitability (Enter as Decimals)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField 
          label="EBIT Percent" 
          name="ebitPercent" 
          value={customParams.ebitPercent} 
          onChange={onInputChange}
          placeholder="0.2781"
          helpText="Enter as decimal (e.g., 0.2781 = 27.81%)"
          type="decimal"
        />
        
        <InputField 
          label="CapEx (of Revenue)" 
          name="capexPercent" 
          value={customParams.capexPercent} 
          onChange={onInputChange}
          placeholder="0.0306"
          helpText="Enter as decimal (e.g., 0.0306 = 3.06%)"
          type="decimal"
        />
        
        <InputField 
          label="Depreciation & Amortization" 
          name="depreciationAndAmortizationPercent" 
          value={customParams.depreciationAndAmortizationPercent} 
          onChange={onInputChange}
          placeholder="0.0345"
          helpText="Enter as decimal (e.g., 0.0345 = 3.45%)"
          type="decimal"
        />
        
        <InputField 
          label="Operating Cash Flow" 
          name="operatingCashFlowPercent" 
          value={customParams.operatingCashFlowPercent} 
          onChange={onInputChange}
          placeholder="0.2886"
          helpText="Enter as decimal (e.g., 0.2886 = 28.86%)"
          type="decimal"
        />
        
        <InputField 
          label="SG&A Expenses" 
          name="sellingGeneralAndAdministrativeExpensesPercent" 
          value={customParams.sellingGeneralAndAdministrativeExpensesPercent} 
          onChange={onInputChange}
          placeholder="0.0662"
          helpText="Enter as decimal (e.g., 0.0662 = 6.62%)"
          type="decimal"
        />
        
        <InputField 
          label="Tax Rate" 
          name="taxRate" 
          value={customParams.taxRate} 
          onChange={onInputChange}
          placeholder="0.2409"
          helpText="Enter as decimal (e.g., 0.2409 = 24.09%)"
          type="decimal"
        />
      </div>
      <Separator className="mt-6" />
    </div>
  );
};

export default CashFlowProfitabilitySection;
