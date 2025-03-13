
import React from "react";
import { AlertTriangle } from "lucide-react";

export const DisclaimerSection: React.FC = () => {
  return (
    <div className="bg-amber-50 border-amber-200 border rounded-lg p-3 text-xs text-amber-800">
      <div className="flex items-start">
        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
        <p>
          This equity research report has been generated using DiDi's proprietary artificial intelligence system and is provided for informational purposes only. The analysis, opinions, and recommendations contained herein do not constitute financial, investment, or professional advice, nor an offer or solicitation to buy or sell securities. DiDi does not guarantee the accuracy, completeness, or reliability of the content, and shall not be liable for any errors, omissions, or losses arising from its use. Investors must conduct their own independent analysis and consult qualified financial advisors before making any investment decisions.
        </p>
      </div>
    </div>
  );
};
