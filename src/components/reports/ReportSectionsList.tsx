
import React from "react";
import { 
  ChevronRight, 
  Target, 
  Lightbulb, 
  LineChart, 
  Building2, 
  BarChart4, 
  DollarSign, 
  AlertTriangle, 
  Leaf 
} from "lucide-react";
import { ResearchReport } from "@/types";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { GrowthCatalysts } from "./GrowthCatalysts";

interface ReportSectionsListProps {
  report: ResearchReport;
  expandedScenarios: string | null;
  toggleScenario: (scenario: string) => void;
}

export const ReportSectionsList: React.FC<ReportSectionsListProps> = ({ 
  report, 
  expandedScenarios, 
  toggleScenario 
}) => {
  // Helper function to get icon based on section title
  const getSectionIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('sensitivity') || lowerTitle.includes('scenario')) {
      return <Target className="h-4 w-4" />;
    } else if (lowerTitle.includes('catalyst') || lowerTitle.includes('growth')) {
      return <Lightbulb className="h-4 w-4" />;
    } else if (lowerTitle.includes('investment') || lowerTitle.includes('thesis')) {
      return <LineChart className="h-4 w-4" />;
    } else if (lowerTitle.includes('business') || lowerTitle.includes('overview')) {
      return <Building2 className="h-4 w-4" />;
    } else if (lowerTitle.includes('financial') || lowerTitle.includes('analysis')) {
      return <BarChart4 className="h-4 w-4" />;
    } else if (lowerTitle.includes('valuation')) {
      return <DollarSign className="h-4 w-4" />;
    } else if (lowerTitle.includes('risk')) {
      return <AlertTriangle className="h-4 w-4" />;
    } else if (lowerTitle.includes('esg') || lowerTitle.includes('environmental')) {
      return <Leaf className="h-4 w-4" />;
    }
    
    // Default icon
    return <ChevronRight className="h-4 w-4" />;
  };

  // Create an array of all report sections including the new ones
  const allSections = [
    // Add Sensitivity Analysis if available
    ...(report.scenarioAnalysis ? [{
      title: "Sensitivity Analysis",
      content: <SensitivityAnalysis 
                 scenarioAnalysis={report.scenarioAnalysis} 
                 expandedScenarios={expandedScenarios} 
                 toggleScenario={toggleScenario} 
               />,
      icon: <Target className="h-4 w-4" />
    }] : []),
    
    // Add Growth Catalysts if available
    ...(report.catalysts ? [{
      title: "Growth Catalysts & Inhibitors",
      content: <GrowthCatalysts catalysts={report.catalysts} />,
      icon: <Lightbulb className="h-4 w-4" />
    }] : []),
    
    // Add the standard sections
    ...report.sections.map(section => ({
      title: section.title,
      content: <div dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br>') }} />,
      icon: getSectionIcon(section.title)
    }))
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted p-3">
        <h3 className="font-medium">Report Sections</h3>
      </div>
      <div className="divide-y">
        {allSections.map((section, index) => (
          <details key={index} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-muted/50">
              <div className="flex items-center">
                {section.icon}
                <h4 className="font-medium ml-2">{section.title}</h4>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-4 pt-0">
              <div className="text-sm text-muted-foreground prose-sm max-w-none">
                {section.content}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};
