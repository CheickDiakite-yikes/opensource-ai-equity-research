
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="rates">Rates</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[400px] pr-4">
          <TabsContent value="basic" className="space-y-4">
            <h3 className="text-sm font-medium">Growth & Profitability</h3>
            
            <div className="space-y-2">
              <label className="text-sm">Revenue Growth (decimal)</label>
              <Input 
                name="revenueGrowth" 
                value={customParams.revenueGrowth} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="0.1094"
              />
              <p className="text-xs text-muted-foreground">Example: 0.1094 = 10.94%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">EBITDA Margin (decimal)</label>
              <Input 
                name="ebitdaMargin" 
                value={customParams.ebitdaMargin} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="0.3127"
              />
              <p className="text-xs text-muted-foreground">Example: 0.3127 = 31.27%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">EBIT Percent (decimal)</label>
              <Input 
                name="ebitPercent" 
                value={customParams.ebitPercent} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="0.2781"
              />
              <p className="text-xs text-muted-foreground">Example: 0.2781 = 27.81%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">CapEx (decimal of Revenue)</label>
              <Input 
                name="capexPercent" 
                value={customParams.capexPercent} 
                onChange={onInputChange}
                type="number"
                step="0.001"
                placeholder="0.0306"
              />
              <p className="text-xs text-muted-foreground">Example: 0.0306 = 3.06%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Tax Rate (decimal)</label>
              <Input 
                name="taxRate" 
                value={customParams.taxRate} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="0.2409"
              />
              <p className="text-xs text-muted-foreground">Example: 0.2409 = 24.09%</p>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <h3 className="text-sm font-medium">Working Capital & Cash Flow</h3>
            
            <div className="space-y-2">
              <label className="text-sm">Depreciation & Amortization (decimal)</label>
              <Input 
                name="depreciationAndAmortizationPercent" 
                value={customParams.depreciationAndAmortizationPercent} 
                onChange={onInputChange}
                type="number"
                step="0.001"
                placeholder="0.0345"
              />
              <p className="text-xs text-muted-foreground">Example: 0.0345 = 3.45%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Cash & ST Investments (decimal)</label>
              <Input 
                name="cashAndShortTermInvestmentsPercent" 
                value={customParams.cashAndShortTermInvestmentsPercent} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="0.2344"
              />
              <p className="text-xs text-muted-foreground">Example: 0.2344 = 23.44%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Receivables (decimal)</label>
              <Input 
                name="receivablesPercent" 
                value={customParams.receivablesPercent} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="0.1533"
              />
              <p className="text-xs text-muted-foreground">Example: 0.1533 = 15.33%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Inventories (decimal)</label>
              <Input 
                name="inventoriesPercent" 
                value={customParams.inventoriesPercent} 
                onChange={onInputChange}
                type="number"
                step="0.001"
                placeholder="0.0155"
              />
              <p className="text-xs text-muted-foreground">Example: 0.0155 = 1.55%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Payables (decimal)</label>
              <Input 
                name="payablesPercent" 
                value={customParams.payablesPercent} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="0.1614"
              />
              <p className="text-xs text-muted-foreground">Example: 0.1614 = 16.14%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Operating Cash Flow (decimal)</label>
              <Input 
                name="operatingCashFlowPercent" 
                value={customParams.operatingCashFlowPercent} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="0.2886"
              />
              <p className="text-xs text-muted-foreground">Example: 0.2886 = 28.86%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">SG&A Expenses (decimal)</label>
              <Input 
                name="sellingGeneralAndAdministrativeExpensesPercent" 
                value={customParams.sellingGeneralAndAdministrativeExpensesPercent} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="0.0662"
              />
              <p className="text-xs text-muted-foreground">Example: 0.0662 = 6.62%</p>
            </div>
          </TabsContent>
          
          <TabsContent value="rates" className="space-y-4">
            <h3 className="text-sm font-medium">Discount & Valuation</h3>
            
            <div className="space-y-2">
              <label className="text-sm">Long-Term Growth Rate (%)</label>
              <Input 
                name="longTermGrowthRate" 
                value={customParams.longTermGrowthRate} 
                onChange={onInputChange}
                type="number"
                step="0.1"
                placeholder="4"
              />
              <p className="text-xs text-muted-foreground">Example: 4 = 4%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Cost of Equity (%)</label>
              <Input 
                name="costOfEquity" 
                value={customParams.costOfEquity} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="9.51"
              />
              <p className="text-xs text-muted-foreground">Example: 9.51 = 9.51%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Beta</label>
              <Input 
                name="beta" 
                value={customParams.beta} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="1.244"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Risk-Free Rate (%)</label>
              <Input 
                name="riskFreeRate" 
                value={customParams.riskFreeRate} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="3.64"
              />
              <p className="text-xs text-muted-foreground">Example: 3.64 = 3.64%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Market Risk Premium (%)</label>
              <Input 
                name="marketRiskPremium" 
                value={customParams.marketRiskPremium} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="4.72"
              />
              <p className="text-xs text-muted-foreground">Example: 4.72 = 4.72%</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Cost of Debt (%)</label>
              <Input 
                name="costOfDebt" 
                value={customParams.costOfDebt} 
                onChange={onInputChange}
                type="number"
                step="0.01"
                placeholder="3.64"
              />
              <p className="text-xs text-muted-foreground">Example: 3.64 = 3.64%</p>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
      
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
