
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import StockHeader from "./StockHeader";
import StockOverview from "@/components/StockOverview";
import StockAnalysis from "@/components/StockAnalysis";
import StockAlternativeData from "@/components/StockAlternativeData";
import ResearchReportGenerator from "@/components/ResearchReportGenerator";
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
  
  // Initialize the active tab from URL or default to overview
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "analysis", "alternative", "report"].includes(tabParam)) {
      setActiveTab(tabParam);
      console.log("Setting active tab from URL to:", tabParam);
    } else if (!tabParam) {
      // If no tab parameter, default to overview
      setActiveTab("overview");
    }
    
    // Short delay to ensure state is updated
    setTimeout(() => {
      setIsReady(true);
    }, 100);
  }, [searchParams]);

  // Handle tab changes with a unique key to force component remount
  const handleTabChange = useCallback((newTab: string) => {
    if (newTab === prevTabRef.current) return; // Avoid unnecessary re-renders
    
    console.log(`Tab changing from ${activeTab} to ${newTab}`);
    
    // Reset error count when changing tabs
    errorCountRef.current = 0;
    
    // Delay state update to avoid React state batch update issues
    setTimeout(() => {
      prevTabRef.current = newTab;
      setActiveTab(newTab);
      
      // Force re-render the tab content when switching tabs
      setKey(prevKey => prevKey + 1);
    }, 10);
  }, [activeTab]);

  // Monitor for errors in the Analysis tab
  const handleComponentError = useCallback((error: Error) => {
    console.error("Component error caught:", error);
    errorCountRef.current += 1;
    
    if (errorCountRef.current >= 3) {
      toast.error("Multiple errors encountered. Try refreshing the page.");
    }
  }, []);

  // Render the active tab content
  const renderTabContent = () => {
    // Only render if ready
    if (!isReady) return null;
    
    // Fallback wrap components to catch errors
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
      case "alternative":
        return (
          <ErrorBoundary>
            <StockAlternativeData key={`alternative-${key}-${symbol}`} symbol={symbol} />
          </ErrorBoundary>
        );
      case "report":
        return (
          <ErrorBoundary>
            <ResearchReportGenerator key={`report-${key}-${symbol}`} symbol={symbol} />
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
