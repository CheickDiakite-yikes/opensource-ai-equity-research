
import { toast } from "@/components/ui/use-toast";
import { ResearchReport, GrowthCatalysts } from "@/types/ai-analysis/reportTypes";
import {
  generateReportHeader,
  generateExecutiveSummary,
  generateScenarioAnalysis,
  generateGrowthCatalysts,
  generateReportSections,
  generateRatingDetails,
  generateDisclaimer
} from "./htmlGeneratorUtils";
import { getReportStyles } from "./reportCssStyles";

/**
 * Generates and downloads a research report as an HTML file
 */
export const downloadReportAsHTML = (report: ResearchReport) => {
  if (!report) return;
  
  const title = `${report.companyName} (${report.symbol}) - Equity Research Report`;
  
  // Build the content by combining all the sections
  let content = generateReportHeader(report);
  content += generateExecutiveSummary(report);
  
  // Add Scenario Analysis if available
  if (report.scenarioAnalysis) {
    content += generateScenarioAnalysis(report.scenarioAnalysis);
  }
  
  // Add Growth Catalysts if available
  if (report.catalysts) {
    // Handle both GrowthCatalysts object and string array
    if (Array.isArray(report.catalysts)) {
      // If it's a string array, convert to simple GrowthCatalysts format
      const simpleCatalysts: GrowthCatalysts = {
        positive: report.catalysts
      };
      content += generateGrowthCatalysts(simpleCatalysts);
    } else {
      // It's already a GrowthCatalysts object
      content += generateGrowthCatalysts(report.catalysts);
    }
  }
  
  // Add all standard sections from the report
  content += generateReportSections(report);
  
  // Add Rating Details if available
  if (report.ratingDetails) {
    content += generateRatingDetails(report);
  }
  
  // Add Disclaimer
  content += generateDisclaimer();
  
  // Generate full HTML with CSS styling
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        ${getReportStyles()}
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
  
  // Create a Blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.symbol}_research_report.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  toast({
    title: "Report Downloaded",
    description: "Research report has been downloaded as HTML.",
  });
};
