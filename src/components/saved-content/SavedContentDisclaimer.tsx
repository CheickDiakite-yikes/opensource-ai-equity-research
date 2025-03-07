
import React from "react";
import { AlertTriangle } from "lucide-react";

interface SavedContentDisclaimerProps {
  type: "reports" | "predictions";
}

const SavedContentDisclaimer: React.FC<SavedContentDisclaimerProps> = ({ type }) => {
  return (
    <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/20 rounded-md flex items-start gap-2">
      <AlertTriangle className="h-3.5 w-3.5 mt-0.5" />
      <p>
        {type === "reports" ? "Reports" : "Predictions"} are automatically deleted after 7 days. 
        You can save a maximum of 10 {type}.
      </p>
    </div>
  );
};

export default SavedContentDisclaimer;
