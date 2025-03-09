
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import StockHeader from "./StockHeader";
import StockOverview from "@/components/StockOverview";
import StockAnalysis from "@/components/StockAnalysis";
import ResearchReportGenerator from "@/components/ResearchReportGenerator";
import StockTabsNavigation from "./StockTabsNavigation";

interface StockViewProps {
  symbol: string;
  onClear: () => void;
}

const StockView: React.FC<StockViewProps> = ({ symbol, onClear }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [key, setKey] = useState<number>(0); // Used to force re-render components
  
  // Initialize the active tab from URL or default to overview
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "analysis", "report"].includes(tabParam)) {
      setActiveTab(tabParam);
      console.log("Setting active tab from URL to:", tabParam);
    } else if (!tabParam) {
      // If no tab parameter, default to overview
      setActiveTab("overview");
    }
  }, [searchParams]);

  // Handle tab changes with a unique key to force component remount
  const handleTabChange = useCallback((newTab: string) => {
    console.log(`Tab changed from ${activeTab} to ${newTab}`);
    setActiveTab(newTab);
    // Force re-render the tab content when switching tabs
    setKey(prevKey => prevKey + 1);
  }, [activeTab]);

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <StockOverview key={`overview-${key}-${symbol}`} symbol={symbol} />;
      case "analysis":
        return <StockAnalysis key={`analysis-${key}-${symbol}`} symbol={symbol} />;
      case "report":
        return <ResearchReportGenerator key={`report-${key}-${symbol}`} symbol={symbol} />;
      default:
        return <StockOverview key={`overview-${key}-${symbol}`} symbol={symbol} />;
    }
  };

  return (
    <div className="mt-6 animate-fade-in">
      <StockHeader symbol={symbol} onClear={onClear} />
      
      <StockTabsNavigation 
        symbol={symbol}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      {renderTabContent()}
    </div>
  );
};

export default StockView;
