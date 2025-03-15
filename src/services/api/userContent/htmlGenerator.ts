
import { ResearchReport } from "@/types/ai-analysis/reportTypes";

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
    
    // Simple HTML generation - in a real app this would be more comprehensive
    let content = `<h1>${title}</h1>`;
    content += `<div class="summary"><h2>Executive Summary</h2><p>${report.summary || 'No summary available'}</p></div>`;
    
    // Add recommendation if available
    if (report.recommendation) {
      content += `<div class="recommendation"><h2>Recommendation</h2><p>${report.recommendation}</p></div>`;
    }
    
    // Add target price if available
    if (report.targetPrice) {
      content += `<div class="target-price"><h2>Target Price</h2><p>$${report.targetPrice}</p></div>`;
    }
    
    // Add all sections from the report
    if (report.sections && report.sections.length > 0) {
      report.sections.forEach(section => {
        content += `<div class="section"><h2>${section.title}</h2><div>${section.content}</div></div>`;
      });
    }
    
    // Generate full HTML with basic styling
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          h2 { color: #3498db; margin-top: 25px; }
          .recommendation, .target-price { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .section { margin-bottom: 30px; }
        </style>
      </head>
      <body>
        ${content}
        <footer>
          <p><small>Generated report for ${report.companyName} (${report.symbol}). This is for informational purposes only.</small></p>
        </footer>
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
