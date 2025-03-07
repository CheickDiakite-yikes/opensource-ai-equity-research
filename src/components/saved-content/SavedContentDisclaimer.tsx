
import React from "react";
import { Info, AlertTriangle, Clock, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface SavedContentDisclaimerProps {
  type: "reports" | "predictions";
}

const SavedContentDisclaimer: React.FC<SavedContentDisclaimerProps> = ({ type }) => {
  return (
    <Alert className="bg-gradient-to-br from-secondary/20 via-secondary/30 to-background border border-primary/10 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in">
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="p-1.5 bg-primary/10 rounded-full">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-primary/90 tracking-tight">
              Important Disclaimer
            </h4>
            <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
              {type === "reports" 
                ? "Research reports are generated using AI and should be used alongside traditional research methods."
                : "Price predictions are estimates based on AI analysis and historical patterns and should not be the sole basis for investment decisions."
              }
            </AlertDescription>
          </div>
        </div>

        <Separator className="bg-primary/5" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 bg-secondary/20 p-1.5 rounded-md group hover:bg-secondary/30 transition-colors">
            <div className="p-1 bg-background rounded-full group-hover:bg-primary/5 transition-colors">
              <Clock className="h-3 w-3 text-primary/70" />
            </div>
            <span className="animate-slide-in-right">Auto-deleted after 7 days</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs bg-secondary/20 p-1.5 rounded-md group hover:bg-secondary/30 transition-colors">
            <div className="p-1 bg-background rounded-full group-hover:bg-primary/5 transition-colors">
              <AlertTriangle className="h-3 w-3 text-primary/70" />
            </div>
            <span className="text-primary/80 animate-slide-in-right">Perform your own research</span>
          </div>
        </div>
        
        <Button 
          variant="link" 
          size="sm" 
          className="text-xs h-auto p-0 text-muted-foreground/60 hover:text-primary hover:no-underline transition-colors w-full flex justify-end"
          onClick={(e) => e.preventDefault()}
        >
          <Info className="h-3 w-3 mr-1" />
          <span>Learn more about {type}</span>
        </Button>
      </div>
    </Alert>
  );
};

export default SavedContentDisclaimer;
