
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Briefcase, BarChart4, FileText, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

  const handleTabClick = (tabName: string) => {
    // Create a new URLSearchParams object based on current params
    const newParams = new URLSearchParams(searchParams);
    // Update the tab parameter
    newParams.set("tab", tabName);
    
    // Update URL without reloading the page
    navigate(`/?symbol=${symbol}&${newParams.toString()}`, { replace: true });
    
    // Call the onTabChange callback
    onTabChange(tabName);
  };
  
  // Tab configuration for easier management
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
      id: "alternative", 
      label: "Alternative Data", 
      icon: <Database className="h-4 w-4" /> 
    },
    { 
      id: "report", 
      label: "Research Report", 
      icon: <FileText className="h-4 w-4" /> 
    }
  ];

  return (
    <div className="w-full flex border-b border-border mb-6">
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
            
            {/* Active indicator line */}
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
    </div>
  );
};

export default StockTabsNavigation;
