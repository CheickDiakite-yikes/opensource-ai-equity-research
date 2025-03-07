
import React from "react";
import { AlertTriangle, Clock, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SavedContentDisclaimerProps {
  type: "reports" | "predictions";
}

const SavedContentDisclaimer: React.FC<SavedContentDisclaimerProps> = ({ type }) => {
  return (
    <div className="text-xs text-muted-foreground mt-4 p-4 bg-muted/30 rounded-md flex items-start gap-2 border border-border/50">
      <div className="flex-shrink-0 mt-0.5">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
      </div>
      
      <div className="space-y-2">
        <p>
          {type === "reports" ? "Reports" : "Predictions"} are automatically deleted after 7 days. 
          You can save a maximum of 10 {type}.
        </p>
        
        <div className="flex items-center gap-4 pt-1 text-[11px]">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>7-day retention</span>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1 cursor-help">
                <HelpCircle className="h-3 w-3" />
                <span>Need help?</span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-64">
                  {type === "reports" 
                    ? "HTML downloads are available for research reports. Click the download button to save a permanent copy to your device." 
                    : "Make sure to take notes of important predictions before they expire."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default SavedContentDisclaimer;
