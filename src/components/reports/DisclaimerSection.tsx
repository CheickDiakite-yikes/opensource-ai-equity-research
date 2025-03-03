
import React from "react";
import { AlertTriangle } from "lucide-react";

export const DisclaimerSection: React.FC = () => {
  return (
    <div className="bg-amber-50 border-amber-200 border rounded-lg p-3 text-xs text-amber-800">
      <div className="flex items-start">
        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
        <p>
          This report is generated using AI and should not be the sole basis for investment decisions.
          Always conduct your own research and consult with a financial advisor.
        </p>
      </div>
    </div>
  );
};
