
import React from "react";
import { FileText, Search, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface EmptyContentStateProps {
  type: "reports" | "predictions";
}

const EmptyContentState: React.FC<EmptyContentStateProps> = ({ type }) => {
  const Icon = type === "reports" ? FileText : TrendingUp;
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className={cn(
        "rounded-full p-4",
        type === "reports" ? "bg-primary/10" : "bg-amber-500/10"
      )}>
        <Icon className={cn(
          "h-8 w-8",
          type === "reports" ? "text-primary" : "text-amber-500"
        )} />
      </div>
      
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-medium">No saved {type}</h3>
        <p className="text-muted-foreground">
          You haven't saved any {type === "reports" ? "research reports" : "price predictions"} yet. 
          Generate and save a {type === "reports" ? "report" : "prediction"} to see it here.
        </p>
      </div>
      
      <Alert className="max-w-md mt-6 bg-muted/50">
        <Search className="h-4 w-4" />
        <AlertTitle>How to get started</AlertTitle>
        <AlertDescription className="text-sm">
          {type === "reports" 
            ? "Search for a stock, go to the Research tab, and click 'Generate Research Report'. Then click 'Save' to keep it." 
            : "Search for a stock, go to the Research tab, and click 'Generate Price Prediction'. Then click 'Save' to keep it."}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EmptyContentState;
