import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import StockHeader from "./StockHeader";
import StockOverview from "@/components/StockOverview";
import StockAnalysis from "@/components/StockAnalysis";
import ResearchReportGenerator from "@/components/ResearchReportGenerator";
import AlternativeDataView from "@/components/alternative/AlternativeDataView";
import StockTabsNavigation from "./StockTabsNavigation";
import { toast } from "sonner";

interface StockViewProps {
  symbol: string;
  onClear: () => void;
}

const StockView: React.FC<StockViewProps> = ({ symbol, onClear }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isReady, setIsReady] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0); // Used to force re-render components
  const prevTabRef = useRef<string>("overview");
  const errorCountRef = useRef<number>(0);
  
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "analysis", "report", "alternative"].includes(tabParam)) {
      setActiveTab(tabParam);
      console.log("Setting active tab from URL to:", tabParam);
    } else if (!tabParam) {
      setActiveTab("overview");
    }
    
    setTimeout(() => {
      setIsReady(true);
    }, 100);
  }, [searchParams]);

  const handleTabChange = useCallback((newTab: string) => {
    if (newTab === prevTabRef.current) return;
    
    console.log(`Tab changing from ${activeTab} to ${newTab}`);
    
    errorCountRef.current = 0;
    
    setTimeout(() => {
      prevTabRef.current = newTab;
      setActiveTab(newTab);
      
      setKey(prevKey => prevKey + 1);
    }, 10);
  }, [activeTab]);

  const handleComponentError = useCallback((error: Error) => {
    console.error("Component error caught:", error);
    errorCountRef.current += 1;
    
    if (errorCountRef.current >= 3) {
      toast.error("Multiple errors encountered. Try refreshing the page.");
    }
  }, []);

  const renderTabContent = () => {
    if (!isReady) return null;
    
    const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      try {
        return <>{children}</>;
      } catch (error) {
        handleComponentError(error as Error);
        return (
          <div className="p-6 text-center bg-red-50 rounded-lg">
            <h3 className="text-lg font-medium text-red-600">Something went wrong</h3>
            <p className="text-sm text-red-500 mt-2">
              We encountered an error loading this content. Please try switching tabs or refreshing the page.
            </p>
          </div>
        );
      }
    };
    
    switch (activeTab) {
      case "overview":
        return (
          <ErrorBoundary>
            <StockOverview key={`overview-${key}-${symbol}`} symbol={symbol} />
          </ErrorBoundary>
        );
      case "analysis":
        return (
          <ErrorBoundary>
            <StockAnalysis key={`analysis-${key}-${symbol}`} symbol={symbol} />
          </ErrorBoundary>
        );
      case "report":
        return (
          <ErrorBoundary>
            <ResearchReportGenerator key={`report-${key}-${symbol}`} symbol={symbol} />
          </ErrorBoundary>
        );
      case "alternative":
        return (
          <ErrorBoundary>
            <AlternativeDataView key={`alternative-${key}-${symbol}`} symbol={symbol} />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <StockOverview key={`overview-${key}-${symbol}`} symbol={symbol} />
          </ErrorBoundary>
        );
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
