
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Briefcase, BarChart4, FileText, Signal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StockTabsNavigationProps {
  symbol: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const StockTabsNavigation: React.FC<StockTabsNavigationProps> = ({ 
  symbol, 
  activeTab, 
  onTabChange 
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const handleTabClick = (tabName: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tabName);
    
    navigate(`/?symbol=${symbol}&${newParams.toString()}`, { replace: true });
    onTabChange(tabName);
  };

  const tabs = [
    { 
      id: "overview", 
      label: "Overview", 
      icon: <Briefcase className="h-4 w-4" /> 
    },
    { 
      id: "analysis", 
      label: "Analysis", 
      icon: <BarChart4 className="h-4 w-4" /> 
    },
    { 
      id: "report", 
      label: "Research Report", 
      icon: <FileText className="h-4 w-4" /> 
    },
    { 
      id: "alternative", 
      label: "Alternative Data", 
      icon: <Signal className="h-4 w-4" /> 
    }
  ];

  return (
    <div className="w-full border-b border-border mb-6">
      {isMobile ? (
        <ScrollArea className="pb-2">
          <div className="flex space-x-1 min-w-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex items-center gap-1 min-w-max px-3 py-2 text-xs font-medium relative whitespace-nowrap",
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                <span>{isMobile && tab.label === "Research Report" ? "Report" : tab.label}</span>
                
                {activeTab === tab.id && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                    layoutId="activeTabIndicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 font-medium text-sm relative",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              
              {activeTab === tab.id && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                  layoutId="activeTabIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockTabsNavigation;
