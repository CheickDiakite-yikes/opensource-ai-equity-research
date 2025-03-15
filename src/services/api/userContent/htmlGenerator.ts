
import { ResearchReport } from "@/types/ai-analysis/reportTypes";

/**
 * Generate HTML content for a research report
 */
export const generateReportHTML = (report: ResearchReport): string => {
  if (!report) {
    console.error("Cannot generate HTML for undefined report");
    return "";
  }

  try {
    const css = `
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1100px;
        margin: 0 auto;
        padding: 20px;
      }
      h1 {
        color: #2d3748;
        border-bottom: 2px solid #eaeaea;
        padding-bottom: 10px;
      }
      h2 {
        color: #4a5568;
        margin-top: 30px;
      }
      h3 {
        color: #718096;
      }
      .report-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .company-info {
        margin-bottom: 30px;
      }
      .recommendation {
        font-size: 1.25rem;
        font-weight: bold;
        color: #ffffff;
        padding: 5px 15px;
        border-radius: 20px;
        display: inline-block;
      }
      .Buy { background-color: #48bb78; }
      .Sell { background-color: #f56565; }
      .Hold { background-color: #ed8936; }
      .Neutral { background-color: #718096; }
      .Overweight { background-color: #667eea; }
      .Underweight { background-color: #fc8181; }
      .target-price {
        font-size: 1.25rem;
        font-weight: bold;
        margin-left: 20px;
      }
      .report-section {
        margin-bottom: 30px;
      }
      .ratings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      .rating-item {
        background-color: #f7fafc;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #4299e1;
      }
      .rating-item h4 {
        margin-top: 0;
        color: #4a5568;
      }
      .rating-value {
        font-weight: bold;
        color: #2b6cb0;
      }
      .disclaimer {
        margin-top: 50px;
        padding: 15px;
        background-color: #f7fafc;
        border-left: 4px solid #cbd5e0;
        font-size: 0.9rem;
        color: #718096;
      }
      .table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      .table th, .table td {
        border: 1px solid #e2e8f0;
        padding: 8px 12px;
        text-align: left;
      }
      .table th {
        background-color: #f7fafc;
      }
      .table tr:nth-child(even) {
        background-color: #f7fafc;
      }
    `;

    // Format catalysts as a list if it's an array
    let catalystsHtml = '';
    if (report.catalysts) {
      const catalystsArray = Array.isArray(report.catalysts) 
        ? report.catalysts 
        : typeof report.catalysts === 'object' ? Object.values(report.catalysts) : [report.catalysts];
      
      catalystsHtml = `
        <div class="report-section">
          <h2>Growth Catalysts</h2>
          <ul>
            ${catalystsArray.map(catalyst => `<li>${catalyst}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Generate the HTML
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${report.symbol} Research Report</title>
        <style>${css}</style>
      </head>
      <body>
        <div class="report-header">
          <div>
            <h1>${report.companyName} (${report.symbol})</h1>
            <div class="company-info">
              <div>
                <span class="recommendation ${report.recommendation}">${report.recommendation}</span>
                <span class="target-price">Target: $${report.targetPrice}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="report-section">
          <h2>Executive Summary</h2>
          <p>${report.summary}</p>
        </div>
        
        ${report.ratingDetails ? `
        <div class="report-section">
          <h2>Rating Details</h2>
          <div class="ratings-grid">
            ${report.ratingDetails.financialStrength ? `
            <div class="rating-item">
              <h4>Financial Strength</h4>
              <div class="rating-value">${report.ratingDetails.financialStrength}</div>
            </div>` : ''}
            
            ${report.ratingDetails.growthOutlook ? `
            <div class="rating-item">
              <h4>Growth Outlook</h4>
              <div class="rating-value">${report.ratingDetails.growthOutlook}</div>
            </div>` : ''}
            
            ${report.ratingDetails.competitivePosition ? `
            <div class="rating-item">
              <h4>Competitive Position</h4>
              <div class="rating-value">${report.ratingDetails.competitivePosition}</div>
            </div>` : ''}
            
            ${report.ratingDetails.valuationAttractiveness ? `
            <div class="rating-item">
              <h4>Valuation</h4>
              <div class="rating-value">${report.ratingDetails.valuationAttractiveness}</div>
            </div>` : ''}
          </div>
        </div>` : ''}
        
        ${report.sections.map(section => `
        <div class="report-section">
          <h2>${section.title}</h2>
          <div>${section.content.replace(/\n/g, '<br>')}</div>
        </div>
        `).join('')}
        
        ${catalystsHtml}
        
        ${report.scenarioAnalysis ? `
        <div class="report-section">
          <h2>Scenario Analysis</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Target Price</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${report.scenarioAnalysis.bullCase ? `
              <tr>
                <td>Bull Case</td>
                <td>$${report.scenarioAnalysis.bullCase.price}</td>
                <td>${report.scenarioAnalysis.bullCase.description}</td>
              </tr>` : ''}
              
              ${report.scenarioAnalysis.baseCase ? `
              <tr>
                <td>Base Case</td>
                <td>$${report.scenarioAnalysis.baseCase.price}</td>
                <td>${report.scenarioAnalysis.baseCase.description}</td>
              </tr>` : ''}
              
              ${report.scenarioAnalysis.bearCase ? `
              <tr>
                <td>Bear Case</td>
                <td>$${report.scenarioAnalysis.bearCase.price}</td>
                <td>${report.scenarioAnalysis.bearCase.description}</td>
              </tr>` : ''}
            </tbody>
          </table>
        </div>` : ''}
        
        <div class="disclaimer">
          <h3>Disclaimer</h3>
          <p>This research report is for informational purposes only. It should not be considered as financial advice or a recommendation to buy or sell any security. The analyses and projections contained herein are based on information believed to be reliable but cannot be guaranteed. Past performance is not indicative of future results. All investments involve risk, including the loss of principal.</p>
        </div>
      </body>
      </html>
    `;
  } catch (error) {
    console.error("Error generating HTML:", error);
    return "";
  }
};
