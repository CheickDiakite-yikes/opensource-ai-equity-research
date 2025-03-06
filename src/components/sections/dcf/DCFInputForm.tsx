
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import GrowthParametersSection from "./input-form/GrowthParametersSection";
import CashFlowProfitabilitySection from "./input-form/CashFlowProfitabilitySection";
import WorkingCapitalSection from "./input-form/WorkingCapitalSection";
import DiscountRatesSection from "./input-form/DiscountRatesSection";
import CalculateButton from "./input-form/CalculateButton";

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
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
          <GrowthParametersSection 
            customParams={customParams} 
            onInputChange={onInputChange} 
          />
          
          <CashFlowProfitabilitySection 
            customParams={customParams} 
            onInputChange={onInputChange} 
          />
          
          <WorkingCapitalSection 
            customParams={customParams} 
            onInputChange={onInputChange} 
          />
          
          <DiscountRatesSection 
            customParams={customParams} 
            onInputChange={onInputChange} 
          />
        </div>
      </ScrollArea>
      
      <CalculateButton 
        isCalculating={isCalculating}
        onCalculate={onCalculate}
      />
    </div>
  );
};

export default DCFInputForm;
