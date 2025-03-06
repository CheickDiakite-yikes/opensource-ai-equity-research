
import React, { useState, useEffect } from "react";
import { Briefcase, BarChart4, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StockOverview from "@/components/StockOverview";
import StockAnalysis from "@/components/StockAnalysis";
import ResearchReportGenerator from "@/components/ResearchReportGenerator";
import StockHeader from "./StockHeader";
import { useSearchParams } from "react-router-dom";

interface StockViewProps {
  symbol: string;
  onClear: () => void;
}

const StockView: React.FC<StockViewProps> = ({ symbol, onClear }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Check for tab parameter in URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "analysis", "report"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="mt-6">
      <StockHeader symbol={symbol} onClear={onClear} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 p-1 bg-muted/30">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
            <Briefcase className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2 py-3">
            <BarChart4 className="h-4 w-4" />
            <span>Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2 py-3">
            <FileText className="h-4 w-4" />
            <span>Research Report</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 animate-fade-in">
          <StockOverview symbol={symbol} />
        </TabsContent>
        <TabsContent value="analysis" className="mt-4 animate-fade-in">
          <StockAnalysis symbol={symbol} />
        </TabsContent>
        <TabsContent value="report" className="mt-4 animate-fade-in">
          <ResearchReportGenerator symbol={symbol} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockView;
