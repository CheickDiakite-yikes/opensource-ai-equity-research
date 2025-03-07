
import React from "react";
import { Info, AlertTriangle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SavedContentDisclaimerProps {
  type: "reports" | "predictions";
}

const SavedContentDisclaimer: React.FC<SavedContentDisclaimerProps> = ({ type }) => {
  return (
    <Alert className="bg-secondary/30 border-primary/10">
      <div className="flex gap-1.5 items-start">
        <Info className="h-4 w-4 text-primary mt-0.5" />
        <div className="space-y-2 text-sm text-muted-foreground">
          <AlertDescription className="text-xs">
            {type === "reports" 
              ? "Research reports are generated using AI and should be used alongside traditional research methods."
              : "Price predictions are estimates based on AI analysis and historical patterns and should not be the sole basis for investment decisions."
            }
          </AlertDescription>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground/80">
            <Clock className="h-3 w-3" />
            <span>Saved {type} are automatically deleted after 7 days</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-primary/80">
            <AlertTriangle className="h-3 w-3" />
            <span>Always perform your own due diligence before investing</span>
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default SavedContentDisclaimer;
