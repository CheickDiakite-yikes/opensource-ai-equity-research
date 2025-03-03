
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ResearchReport } from "@/types";

interface GrowthCatalystsProps {
  catalysts: ResearchReport["catalysts"];
}

export const GrowthCatalysts: React.FC<GrowthCatalystsProps> = ({ catalysts }) => {
  if (!catalysts) return null;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positive Catalysts */}
        <div className="p-3 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1.5" />
            Positive Catalysts
          </h4>
          <ul className="space-y-2">
            {catalysts.positive.map((catalyst, index) => (
              <li key={index} className="text-sm text-green-700 pl-2 border-l-2 border-green-300">
                {catalyst}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Negative Catalysts */}
        <div className="p-3 bg-red-50 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2 flex items-center">
            <TrendingDown className="h-4 w-4 mr-1.5" />
            Growth Inhibitors
          </h4>
          <ul className="space-y-2">
            {catalysts.negative.map((catalyst, index) => (
              <li key={index} className="text-sm text-red-700 pl-2 border-l-2 border-red-300">
                {catalyst}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Timeline if available */}
      {catalysts.timeline && (
        <div className="mt-4 pt-3 border-t">
          <h4 className="font-medium mb-2">Catalyst Timeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-2 bg-gray-50 rounded">
              <span className="text-xs font-medium text-gray-600 block mb-1">Short Term</span>
              <ul className="text-sm list-disc pl-5 space-y-1">
                {catalysts.timeline.shortTerm.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <span className="text-xs font-medium text-gray-600 block mb-1">Medium Term</span>
              <ul className="text-sm list-disc pl-5 space-y-1">
                {catalysts.timeline.mediumTerm.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <span className="text-xs font-medium text-gray-600 block mb-1">Long Term</span>
              <ul className="text-sm list-disc pl-5 space-y-1">
                {catalysts.timeline.longTerm.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
