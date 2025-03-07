
import React from "react";
import { FileText, Search, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EmptyContentStateProps {
  type: "reports" | "predictions";
}

const EmptyContentState: React.FC<EmptyContentStateProps> = ({ type }) => {
  return (
    <Alert>
      <Search className="h-4 w-4" />
      <AlertTitle>No saved {type}</AlertTitle>
      <AlertDescription>
        You haven't saved any {type === "reports" ? "research reports" : "price predictions"} yet. 
        Generate and save a {type === "reports" ? "report" : "prediction"} to see it here.
      </AlertDescription>
    </Alert>
  );
};

export default EmptyContentState;
