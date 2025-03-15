
import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock,
  CalendarRange
} from "lucide-react";
import { GrowthCatalysts as GrowthCatalystsType } from "@/types/ai-analysis/reportTypes";

interface GrowthCatalystsProps {
  catalysts: GrowthCatalystsType | string[] | undefined;
}

export const GrowthCatalysts: React.FC<GrowthCatalystsProps> = ({ catalysts }) => {
  if (!catalysts) return null;
  
  // Handle string array format (legacy)
  if (Array.isArray(catalysts)) {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600 mr-1.5" />
            <h4 className="font-medium">Key Catalysts</h4>
          </div>
          <ul className="pl-6 space-y-1.5">
            {catalysts.map((catalyst, i) => (
              <li key={i} className="text-sm list-disc text-muted-foreground">
                {catalyst}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  
  // Handle GrowthCatalysts object format
  return (
    <div className="space-y-4">
      {/* Positive Catalysts */}
      {catalysts.positive && catalysts.positive.length > 0 && (
        <div>
          <div className="flex items-center mb-2">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1.5" />
            <h4 className="font-medium">Positive Catalysts</h4>
          </div>
          <ul className="pl-6 space-y-1.5">
            {catalysts.positive.map((catalyst, i) => (
              <li key={i} className="text-sm list-disc text-muted-foreground">
                {catalyst}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Negative Catalysts */}
      {catalysts.negative && catalysts.negative.length > 0 && (
        <div>
          <div className="flex items-center mb-2">
            <TrendingDown className="h-4 w-4 text-red-600 mr-1.5" />
            <h4 className="font-medium">Negative Catalysts</h4>
          </div>
          <ul className="pl-6 space-y-1.5">
            {catalysts.negative.map((catalyst, i) => (
              <li key={i} className="text-sm list-disc text-muted-foreground">
                {catalyst}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Timeline of Expected Catalysts */}
      {catalysts.timeline && (
        <div className="pt-2">
          <h4 className="font-medium mb-3">Timeline of Expected Catalysts</h4>
          
          {/* Short-term */}
          {catalysts.timeline.shortTerm && catalysts.timeline.shortTerm.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center mb-1">
                <Clock className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
                <h5 className="text-sm font-medium">Short-term</h5>
              </div>
              <ul className="pl-6 space-y-1">
                {catalysts.timeline.shortTerm.map((item, i) => (
                  <li key={i} className="text-xs list-disc text-muted-foreground">{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Medium-term */}
          {catalysts.timeline.mediumTerm && catalysts.timeline.mediumTerm.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center mb-1">
                <Clock className="h-3.5 w-3.5 text-indigo-600 mr-1.5" />
                <h5 className="text-sm font-medium">Medium-term</h5>
              </div>
              <ul className="pl-6 space-y-1">
                {catalysts.timeline.mediumTerm.map((item, i) => (
                  <li key={i} className="text-xs list-disc text-muted-foreground">{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Long-term */}
          {catalysts.timeline.longTerm && catalysts.timeline.longTerm.length > 0 && (
            <div>
              <div className="flex items-center mb-1">
                <CalendarRange className="h-3.5 w-3.5 text-purple-600 mr-1.5" />
                <h5 className="text-sm font-medium">Long-term</h5>
              </div>
              <ul className="pl-6 space-y-1">
                {catalysts.timeline.longTerm.map((item, i) => (
                  <li key={i} className="text-xs list-disc text-muted-foreground">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
