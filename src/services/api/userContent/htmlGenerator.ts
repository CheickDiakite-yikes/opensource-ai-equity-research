
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import {
  generateReportHeader,
  generateExecutiveSummary,
  generateScenarioAnalysis,
  generateGrowthCatalysts,
  generateReportSections,
  generateRatingDetails,
  generateDisclaimer
} from "@/utils/reports/htmlGeneratorUtils";
import { getReportStyles } from "@/utils/reports/reportCssStyles";

/**
 * Generate HTML content for a research report
 */
export const generateReportHTML = (report: ResearchReport): string => {
  try {
    console.log("Generating HTML content for report", report.symbol);
    
    // Do some validation checks to make sure we have a valid report
    if (!report || !report.symbol || !report.companyName) {
      console.error("Invalid report data:", report);
      return "";
    }
    
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
      content += generateGrowthCatalysts(report.catalysts);
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
    
    console.log("HTML content generated successfully, length:", htmlContent.length);
    return htmlContent;
  } catch (error) {
    console.error("Error generating HTML content:", error);
    return ""; // Return empty string if there's an error
  }
};
