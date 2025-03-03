
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface DCFInputFormProps {
  customParams: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCalculating: boolean;
  onCalculate: () => void;
}

// Helper component to display input fields with consistent formatting
const InputField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder,
  helpText,
  type = "decimal"
}: { 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  placeholder: string;
  helpText: string;
  type?: "decimal" | "percentage" | "number";
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">{label}</label>
    <Input 
      name={name} 
      value={value} 
      onChange={onChange}
      type="number"
      step={type === "decimal" ? "0.0001" : "0.01"}
      placeholder={placeholder}
      className="bg-white"
    />
    <p className="text-xs text-muted-foreground">{helpText}</p>
  </div>
);

const DCFInputForm: React.FC<DCFInputFormProps> = ({
  customParams,
  onInputChange,
  isCalculating,
  onCalculate
}) => {
  return (
    <div className="space-y-5">
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
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
          </div>

          <Separator />

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
          </div>

          <Separator />

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
          </div>

          <Separator />

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
        </div>
      </ScrollArea>
      
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
