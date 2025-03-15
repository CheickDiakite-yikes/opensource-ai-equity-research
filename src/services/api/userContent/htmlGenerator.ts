
import { ResearchReport } from "@/types/ai-analysis/reportTypes";

/**
 * Generate HTML content for a research report
 */
export const generateReportHTML = (report: ResearchReport): string => {
  if (!report || !report.sections || report.sections.length === 0) {
    console.error("Cannot generate HTML for invalid report");
    return "";
  }

  try {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Research Report: ${report.symbol} - ${report.companyName || ""}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; }
          h1 { color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
          h2 { color: #2c5282; margin-top: 2rem; }
          h3 { color: #2b6cb0; }
          .header { display: flex; justify-content: space-between; align-items: center; }
          .recommendation { display: inline-block; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: bold; }
          .buy { background-color: #c6f6d5; color: #22543d; }
          .hold { background-color: #fefcbf; color: #744210; }
          .sell { background-color: #fed7d7; color: #822727; }
          .summary { background-color: #ebf8ff; padding: 1rem; border-radius: 0.5rem; margin: 1.5rem 0; }
          .section { margin-bottom: 2rem; }
          .footer { margin-top: 3rem; border-top: 1px solid #e2e8f0; padding-top: 1rem; font-size: 0.875rem; color: #718096; }
          table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
          th, td { padding: 0.75rem; border: 1px solid #e2e8f0; }
          th { background-color: #f7fafc; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${report.symbol} - ${report.companyName || ""} Research Report</h1>
          <div class="recommendation ${report.recommendation?.toLowerCase() || 'hold'}">${report.recommendation || 'HOLD'}</div>
        </div>
        
        <div class="summary">
          <h3>Executive Summary</h3>
          <p>${report.summary || "No summary available."}</p>
        </div>
        
        ${report.sections.map(section => `
          <div class="section">
            <h2>${section.title}</h2>
            <div>${section.content.replace(/\n/g, '<br>')}</div>
          </div>
        `).join('')}

        ${report.catalysts ? `
        <div class="section">
          <h2>Growth Catalysts</h2>
          <ul>
            ${report.catalysts.map(catalyst => `
              <li>
                <h3>${catalyst.title}</h3>
                <p>${catalyst.description}</p>
                <p><strong>Impact:</strong> ${catalyst.impact}</p>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>This report was generated on ${new Date().toLocaleDateString()} using AI analysis.</p>
          <p>Disclaimer: This is an AI-generated research report and should not be considered financial advice. Always consult with a qualified financial advisor before making investment decisions.</p>
        </div>
      </body>
      </html>
    `;

    return html;
  } catch (error) {
    console.error("Error generating HTML report:", error);
    return "";
  }
};
