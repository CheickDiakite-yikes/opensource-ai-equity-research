
import { toast } from "@/components/ui/use-toast";
import { ResearchReport, RatingDetails, ScenarioAnalysis, GrowthCatalysts } from "@/types/ai-analysis/reportTypes";

/**
 * Generates and downloads a research report as an HTML file
 */
export const downloadReportAsHTML = (report: ResearchReport) => {
  if (!report) return;
  
  const title = `${report.companyName} (${report.symbol}) - Equity Research Report`;
  
  // Create the HTML content structure
  let content = `
    <div class="report-header">
      <h1>${title}</h1>
      <p class="date">Report Date: ${report.date}</p>
      
      <div class="rating-section">
        <div class="rating-item">
          <h3>Recommendation</h3>
          <p class="recommendation">${report.recommendation}</p>
        </div>
        
        <div class="rating-item">
          <h3>Price Target</h3>
          <p class="price-target">${report.targetPrice}</p>
        </div>
        
        ${report.ratingDetails && report.ratingDetails.ratingScale ? 
          `<div class="rating-item">
            <h3>Rating Scale</h3>
            <p>${report.ratingDetails.ratingScale}</p>
          </div>` : ''
        }
      </div>
    </div>`;
  
  // Add Executive Summary
  content += `
    <div class="summary">
      <h2>Executive Summary</h2>
      <p>${report.summary || "No summary available"}</p>
    </div>`;
  
  // Add Sensitivity Analysis / Scenario Analysis if available
  if (report.scenarioAnalysis) {
    content += `
      <div class="section scenario-analysis">
        <h2>Sensitivity Analysis</h2>
        
        <div class="scenario bull">
          <h3>Bull Case: ${report.scenarioAnalysis.bullCase?.price || "N/A"}</h3>
          <p>Probability: ${report.scenarioAnalysis.bullCase?.probability || "N/A"}</p>
          ${report.scenarioAnalysis.bullCase?.drivers && report.scenarioAnalysis.bullCase.drivers.length ? 
            `<div class="drivers">
              <h4>Key Drivers:</h4>
              <ul>${report.scenarioAnalysis.bullCase.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
            </div>` : ''
          }
        </div>
        
        <div class="scenario base">
          <h3>Base Case: ${report.scenarioAnalysis.baseCase?.price || "N/A"}</h3>
          <p>Probability: ${report.scenarioAnalysis.baseCase?.probability || "N/A"}</p>
          ${report.scenarioAnalysis.baseCase?.drivers && report.scenarioAnalysis.baseCase.drivers.length ? 
            `<div class="drivers">
              <h4>Key Drivers:</h4>
              <ul>${report.scenarioAnalysis.baseCase.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
            </div>` : ''
          }
        </div>
        
        <div class="scenario bear">
          <h3>Bear Case: ${report.scenarioAnalysis.bearCase?.price || "N/A"}</h3>
          <p>Probability: ${report.scenarioAnalysis.bearCase?.probability || "N/A"}</p>
          ${report.scenarioAnalysis.bearCase?.drivers && report.scenarioAnalysis.bearCase.drivers.length ? 
            `<div class="drivers">
              <h4>Key Drivers:</h4>
              <ul>${report.scenarioAnalysis.bearCase.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
            </div>` : ''
          }
        </div>
      </div>`;
  }
  
  // Add Growth Catalysts & Inhibitors if available
  if (report.catalysts) {
    content += `
      <div class="section catalysts">
        <h2>Growth Catalysts & Inhibitors</h2>
        
        ${report.catalysts.positive && report.catalysts.positive.length ? 
          `<div class="positive-catalysts">
            <h3>Positive Catalysts</h3>
            <ul>${report.catalysts.positive.map(c => `<li>${c}</li>`).join('')}</ul>
          </div>` : ''
        }
        
        ${report.catalysts.negative && report.catalysts.negative.length ? 
          `<div class="negative-catalysts">
            <h3>Negative Catalysts</h3>
            <ul>${report.catalysts.negative.map(c => `<li>${c}</li>`).join('')}</ul>
          </div>` : ''
        }
        
        ${report.catalysts.timeline ? 
          `<div class="catalysts-timeline">
            <h3>Timeline of Expected Catalysts</h3>
            
            ${report.catalysts.timeline.shortTerm && report.catalysts.timeline.shortTerm.length ? 
              `<div class="timeline-section">
                <h4>Short-term</h4>
                <ul>${report.catalysts.timeline.shortTerm.map(c => `<li>${c}</li>`).join('')}</ul>
              </div>` : ''
            }
            
            ${report.catalysts.timeline.mediumTerm && report.catalysts.timeline.mediumTerm.length ? 
              `<div class="timeline-section">
                <h4>Medium-term</h4>
                <ul>${report.catalysts.timeline.mediumTerm.map(c => `<li>${c}</li>`).join('')}</ul>
              </div>` : ''
            }
            
            ${report.catalysts.timeline.longTerm && report.catalysts.timeline.longTerm.length ? 
              `<div class="timeline-section">
                <h4>Long-term</h4>
                <ul>${report.catalysts.timeline.longTerm.map(c => `<li>${c}</li>`).join('')}</ul>
              </div>` : ''
            }
          </div>` : ''
        }
      </div>`;
  }
  
  // Add all standard sections from the report
  report.sections.forEach(section => {
    content += `
      <div class="section ${section.title.toLowerCase().replace(/\s+/g, '-')}">
        <h2>${section.title}</h2>
        <div class="section-content">${section.content}</div>
      </div>`;
  });
  
  // Add Rating Details if available
  if (report.ratingDetails) {
    content += `
      <div class="section rating-details">
        <h2>Rating and Recommendation</h2>
        ${report.ratingDetails.ratingScale ? 
          `<p><strong>Rating Scale:</strong> Our recommendations include: Buy, Sell, Hold, Overweight, and Underweight</p>` : ''
        }
        <p><strong>Recommendation:</strong> ${report.recommendation}</p>
        ${report.ratingDetails.ratingJustification ? 
          `<p><strong>Justification:</strong> ${report.ratingDetails.ratingJustification}</p>` : ''
        }
      </div>`;
  }
  
  // Add updated Disclaimer with more comprehensive text
  content += `
    <div class="disclaimer">
      <h2>Disclaimer</h2>
      <p>This equity research report has been generated using DiDi's proprietary artificial intelligence system and is provided for informational purposes only. The analysis, opinions, and recommendations contained herein do not constitute financial, investment, or professional advice, nor an offer or solicitation to buy or sell securities. DiDi does not guarantee the accuracy, completeness, or reliability of the content, and shall not be liable for any errors, omissions, or losses arising from its use. Investors must conduct their own independent analysis and consult qualified financial advisors before making any investment decisions.</p>
    </div>`;
  
  // Generate full HTML with CSS styling
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #1a365d;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        h2 {
          color: #2a4365;
          margin-top: 30px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e2e8f0;
        }
        h3 {
          color: #1e40af;
          margin-top: 20px;
        }
        h4 {
          color: #3b82f6;
        }
        .date {
          color: #718096;
          font-style: italic;
          margin-bottom: 20px;
        }
        .rating-section {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin: 20px 0;
        }
        .rating-item {
          flex: 1;
          min-width: 200px;
          padding: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          background-color: #f8fafc;
        }
        .rating-item h3 {
          margin-top: 0;
          font-size: 16px;
          color: #64748b;
        }
        .recommendation {
          font-weight: bold;
          font-size: 20px;
          color: #047857;
        }
        .price-target {
          font-weight: bold;
          font-size: 20px;
          color: #0369a1;
        }
        .summary {
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid #3b82f6;
          margin: 20px 0;
        }
        .section {
          margin: 30px 0;
        }
        .scenario {
          padding: 15px;
          margin: 10px 0;
          border-radius: 5px;
        }
        .bull {
          background-color: #ecfdf5;
          border-left: 4px solid #10b981;
        }
        .base {
          background-color: #eff6ff;
          border-left: 4px solid #3b82f6;
        }
        .bear {
          background-color: #fee2e2;
          border-left: 4px solid #ef4444;
        }
        .drivers {
          margin-top: 10px;
        }
        .positive-catalysts {
          background-color: #f0fdf4;
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
        }
        .negative-catalysts {
          background-color: #fef2f2;
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
        }
        .catalysts-timeline {
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .timeline-section {
          margin: 10px 0;
          padding-left: 10px;
          border-left: 2px solid #cbd5e1;
        }
        .disclaimer {
          margin-top: 40px;
          padding: 15px;
          background-color: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 5px;
          font-size: 14px;
        }
        ul {
          padding-left: 20px;
        }
        li {
          margin-bottom: 5px;
        }
        .section-content {
          line-height: 1.8;
        }
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

