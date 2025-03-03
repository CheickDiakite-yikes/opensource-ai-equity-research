
import React from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ResearchReport } from "@/types";

interface SensitivityAnalysisProps {
  scenarioAnalysis: ResearchReport["scenarioAnalysis"];
  expandedScenarios: string | null;
  toggleScenario: (scenario: string) => void;
}

export const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({ 
  scenarioAnalysis, 
  expandedScenarios, 
  toggleScenario 
}) => {
  if (!scenarioAnalysis) return null;
  
  return (
    <div className="space-y-3">
      {/* Bull Case */}
      <div className="cursor-pointer" onClick={() => toggleScenario('bull')}>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
            <span className="font-medium">Bull Case</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-semibold">
              {scenarioAnalysis.bullCase?.price || "N/A"}
            </span>
            <span className="text-xs text-muted-foreground">
              ({scenarioAnalysis.bullCase?.probability || "N/A"} probability)
            </span>
          </div>
        </div>
        <Progress 
          value={parseInt(scenarioAnalysis.bullCase?.probability || "25") || 25} 
          className="h-2 bg-gray-100" 
          indicatorClassName="bg-green-600" 
        />
        
        {expandedScenarios === 'bull' && (
          <div className="mt-2 p-3 bg-green-50 rounded-md">
            <p className="text-sm font-medium text-green-800 mb-1">Key Drivers:</p>
            <ul className="text-sm list-disc pl-5 text-green-700 space-y-1">
              {scenarioAnalysis.bullCase?.drivers?.map((driver, idx) => (
                <li key={idx}>{driver}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Base Case */}
      <div className="cursor-pointer" onClick={() => toggleScenario('base')}>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <Activity className="h-4 w-4 text-blue-600 mr-2" />
            <span className="font-medium">Base Case</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-semibold">
              {scenarioAnalysis.baseCase?.price || "N/A"}
            </span>
            <span className="text-xs text-muted-foreground">
              ({scenarioAnalysis.baseCase?.probability || "N/A"} probability)
            </span>
          </div>
        </div>
        <Progress 
          value={parseInt(scenarioAnalysis.baseCase?.probability || "50") || 50} 
          className="h-2 bg-gray-100" 
          indicatorClassName="bg-blue-600" 
        />
        
        {expandedScenarios === 'base' && (
          <div className="mt-2 p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-blue-800 mb-1">Key Drivers:</p>
            <ul className="text-sm list-disc pl-5 text-blue-700 space-y-1">
              {scenarioAnalysis.baseCase?.drivers?.map((driver, idx) => (
                <li key={idx}>{driver}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Bear Case */}
      <div className="cursor-pointer" onClick={() => toggleScenario('bear')}>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
            <span className="font-medium">Bear Case</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-semibold">
              {scenarioAnalysis.bearCase?.price || "N/A"}
            </span>
            <span className="text-xs text-muted-foreground">
              ({scenarioAnalysis.bearCase?.probability || "N/A"} probability)
            </span>
          </div>
        </div>
        <Progress 
          value={parseInt(scenarioAnalysis.bearCase?.probability || "25") || 25} 
          className="h-2 bg-gray-100" 
          indicatorClassName="bg-red-600" 
        />
        
        {expandedScenarios === 'bear' && (
          <div className="mt-2 p-3 bg-red-50 rounded-md">
            <p className="text-sm font-medium text-red-800 mb-1">Key Drivers:</p>
            <ul className="text-sm list-disc pl-5 text-red-700 space-y-1">
              {scenarioAnalysis.bearCase?.drivers?.map((driver, idx) => (
                <li key={idx}>{driver}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
