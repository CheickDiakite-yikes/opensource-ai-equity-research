
import React, { useState, useEffect, useCallback } from "react";
import { Briefcase, BarChart4, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StockOverview from "@/components/StockOverview";
import StockAnalysis from "@/components/StockAnalysis";
import ResearchReportGenerator from "@/components/ResearchReportGenerator";
import StockHeader from "./StockHeader";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface StockViewProps {
  symbol: string;
  onClear: () => void;
}

const StockView: React.FC<StockViewProps> = ({ symbol, onClear }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);
  const [forceRefresh, setForceRefresh] = useState<number>(0);
  
  // Clean up any stale data when the component unmounts or symbol changes
  useEffect(() => {
    return () => {
      console.log("StockView cleanup - symbol changed or component unmounted");
    };
  }, [symbol]);
  
  // Check for tab parameter in URL and set active tab
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "analysis", "report"].includes(tabParam)) {
      setActiveTab(tabParam);
      console.log("Setting active tab to:", tabParam);
    } else {
      // If no valid tab parameter, default to overview and update URL
      setActiveTab("overview");
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", "overview");
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  // Handle tab change to update URL
  const handleTabChange = useCallback((tab: string) => {
    // Don't proceed if we're already on this tab (unless forced)
    if (tab === activeTab && tab !== "analysis") return;
    
    console.log(`Switching to tab: ${tab} from ${activeTab}`);
    
    // Brief loading state to ensure components reinitialize properly
    setIsTabLoading(true);
    
    // Force a full remount of all components when switching tabs
    setTimeout(() => {
      setActiveTab(tab);
      
      // Update URL with new tab parameter while preserving the symbol
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", tab);
      setSearchParams(newParams);
      
      // Force refresh for analysis tab
      if (tab === "analysis") {
        setForceRefresh(prev => prev + 1);
        toast.info(`Loading financial analysis for ${symbol}...`, {
          duration: 3000,
          id: "loading-analysis",
        });
      }
      
      setIsTabLoading(false);
    }, 100); // Small delay to ensure proper state updates
  }, [activeTab, searchParams, setSearchParams, symbol]);

  return (
    <div className="mt-6">
      <StockHeader symbol={symbol} onClear={onClear} />
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 p-1 bg-muted/30">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
            <Briefcase className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analysis" 
            className="flex items-center gap-2 py-3"
            onClick={() => handleTabChange("analysis")}
          >
            <BarChart4 className="h-4 w-4" />
            <span>Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2 py-3">
            <FileText className="h-4 w-4" />
            <span>Research Report</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 animate-fade-in">
          {!isTabLoading && activeTab === "overview" && <StockOverview symbol={symbol} />}
        </TabsContent>
        <TabsContent value="analysis" className="mt-4 animate-fade-in">
          {!isTabLoading && activeTab === "analysis" && (
            <StockAnalysis 
              symbol={symbol} 
              key={`analysis-${symbol}-${forceRefresh}`} 
            />
          )}
        </TabsContent>
        <TabsContent value="report" className="mt-4 animate-fade-in">
          {!isTabLoading && activeTab === "report" && <ResearchReportGenerator symbol={symbol} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockView;
