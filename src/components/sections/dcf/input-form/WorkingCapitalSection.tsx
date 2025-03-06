
import React from "react";
import InputField from "./InputField";
import { Separator } from "@/components/ui/separator";

interface WorkingCapitalSectionProps {
  customParams: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const WorkingCapitalSection: React.FC<WorkingCapitalSectionProps> = ({
  customParams,
  onInputChange
}) => {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Working Capital (Enter as Decimals)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField 
          label="Cash & ST Investments" 
          name="cashAndShortTermInvestmentsPercent" 
          value={customParams.cashAndShortTermInvestmentsPercent} 
          onChange={onInputChange}
          placeholder="0.2344"
          helpText="Enter as decimal (e.g., 0.2344 = 23.44%)"
          type="decimal"
        />
        
        <InputField 
          label="Receivables" 
          name="receivablesPercent" 
          value={customParams.receivablesPercent} 
          onChange={onInputChange}
          placeholder="0.1533"
          helpText="Enter as decimal (e.g., 0.1533 = 15.33%)"
          type="decimal"
        />
        
        <InputField 
          label="Inventories" 
          name="inventoriesPercent" 
          value={customParams.inventoriesPercent} 
          onChange={onInputChange}
          placeholder="0.0155"
          helpText="Enter as decimal (e.g., 0.0155 = 1.55%)"
          type="decimal"
        />
        
        <InputField 
          label="Payables" 
          name="payablesPercent" 
          value={customParams.payablesPercent} 
          onChange={onInputChange}
          placeholder="0.1614"
          helpText="Enter as decimal (e.g., 0.1614 = 16.14%)"
          type="decimal"
        />
      </div>
      <Separator className="mt-6" />
    </div>
  );
};

export default WorkingCapitalSection;
