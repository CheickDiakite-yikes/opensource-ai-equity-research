
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
  Leaf,
  Star
} from "lucide-react";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
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

  // Create a Rating and Recommendation section if report has ratingDetails
  const ratingAndRecommendationSection = report.ratingDetails ? {
    title: "Rating and Recommendation",
    content: (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          <span className="font-medium">Rating Scale: {report.ratingDetails.ratingScale}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Recommendation: {report.recommendation}</span>
        </div>
        {report.ratingDetails.ratingJustification && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">{report.ratingDetails.ratingJustification}</p>
          </div>
        )}
      </div>
    ),
    icon: <Star className="h-4 w-4" />
  } : null;

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

  // Find the position of ESG Considerations section if it exists
  const esgIndex = allSections.findIndex(section => 
    section.title.toLowerCase().includes('esg') || 
    section.title.toLowerCase().includes('environmental')
  );

  // If ESG section exists and we have rating details, insert the rating section after ESG
  if (esgIndex !== -1 && ratingAndRecommendationSection) {
    allSections.splice(esgIndex + 1, 0, ratingAndRecommendationSection);
  } else if (ratingAndRecommendationSection) {
    // Otherwise add it to the end
    allSections.push(ratingAndRecommendationSection);
  }

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
