
import React from "react";
import { FileText, TrendingUp, PlusCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface EmptyContentStateProps {
  type: "reports" | "predictions";
}

const EmptyContentState: React.FC<EmptyContentStateProps> = ({ type }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleNavigateToSearch = () => {
    navigate("/");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center p-10 text-center rounded-xl border border-dashed border-primary/20 bg-gradient-to-b from-primary/5 to-background shadow-sm"
    >
      <div className="flex flex-col items-center max-w-md py-8">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          {type === "reports" ? (
            <FileText className="h-10 w-10 text-primary" />
          ) : (
            <TrendingUp className="h-10 w-10 text-primary" />
          )}
        </div>
        
        <h3 className="text-2xl font-medium mb-3">
          No Saved {type === "reports" ? "Research Reports" : "Price Predictions"}
        </h3>
        
        <p className="text-muted-foreground mb-8 px-4">
          {type === "reports" 
            ? "Research reports provide in-depth analysis of companies, including financials, risks, and growth opportunities."
            : "Price predictions offer AI-powered forecasts of stock performance over different time horizons."
          }
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button 
            onClick={handleNavigateToSearch}
            className="gap-2 shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New {type === "reports" ? "Report" : "Prediction"}</span>
          </Button>
          
          <Button variant="outline" className="gap-2">
            <Info className="h-4 w-4" />
            <span>Learn More</span>
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10 text-sm text-muted-foreground">
          <p>
            Start by searching for a company and generating a {type === "reports" ? "research report" : "price prediction"}.
            All your {type} will be automatically saved here.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(EmptyContentState);
