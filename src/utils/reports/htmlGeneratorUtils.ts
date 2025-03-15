/**
 * Generate the HTML for the report header
 */
export const generateReportHeader = (report: any): string => {
  return `
    <div class="report-header">
      <h1>${report.companyName}</h1>
      <h2>${report.symbol} - Equity Research Report</h2>
      <p>Date: ${report.date}</p>
      <p>Recommendation: ${report.recommendation}</p>
      <p>Target Price: ${report.targetPrice}</p>
    </div>
  `;
};

/**
 * Generate the HTML for the executive summary section
 */
export const generateExecutiveSummary = (report: any): string => {
  return `
    <div class="report-section">
      <h2>Executive Summary</h2>
      <p>${report.summary}</p>
    </div>
  `;
};

/**
 * Generate the HTML for scenario analysis section
 */
export const generateScenarioAnalysis = (scenarioAnalysis: any): string => {
  return `
    <div class="report-section">
      <h2>Scenario Analysis</h2>
      <div class="scenario">
        <h3>Bull Case</h3>
        <p>Price: ${scenarioAnalysis.bullCase.price}</p>
        <p>Description: ${scenarioAnalysis.bullCase.description}</p>
        ${scenarioAnalysis.bullCase.probability ? `<p>Probability: ${scenarioAnalysis.bullCase.probability}</p>` : ''}
        ${scenarioAnalysis.bullCase.drivers ? `<p>Drivers: ${scenarioAnalysis.bullCase.drivers.join(', ')}</p>` : ''}
      </div>
      <div class="scenario">
        <h3>Base Case</h3>
        <p>Price: ${scenarioAnalysis.baseCase.price}</p>
        <p>Description: ${scenarioAnalysis.baseCase.description}</p>
        ${scenarioAnalysis.baseCase.probability ? `<p>Probability: ${scenarioAnalysis.baseCase.probability}</p>` : ''}
        ${scenarioAnalysis.baseCase.drivers ? `<p>Drivers: ${scenarioAnalysis.baseCase.drivers.join(', ')}</p>` : ''}
      </div>
      <div class="scenario">
        <h3>Bear Case</h3>
        <p>Price: ${scenarioAnalysis.bearCase.price}</p>
        <p>Description: ${scenarioAnalysis.bearCase.description}</p>
        ${scenarioAnalysis.bearCase.probability ? `<p>Probability: ${scenarioAnalysis.bearCase.probability}</p>` : ''}
        ${scenarioAnalysis.bearCase.drivers ? `<p>Drivers: ${scenarioAnalysis.bearCase.drivers.join(', ')}</p>` : ''}
      </div>
    </div>
  `;
};

/**
 * Generate the HTML for growth catalysts section
 */
export const generateGrowthCatalysts = (catalysts: any): string => {
  if (!catalysts) return "";
  
  // Handle if catalysts is a simple string array (legacy format)
  if (Array.isArray(catalysts)) {
    return `
      <div class="report-section">
        <h2>Key Catalysts</h2>
        <ul>
          ${catalysts.map(catalyst => `<li>${catalyst}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  // Handle GrowthCatalysts object format
  let html = `
    <div class="report-section">
      <h2>Growth Catalysts</h2>
  `;
  
  // Add positive catalysts if available
  if (catalysts.positive && catalysts.positive.length > 0) {
    html += `
      <div class="subsection">
        <h3>Positive Catalysts</h3>
        <ul class="positive">
          ${catalysts.positive.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  // Add negative catalysts if available
  if (catalysts.negative && catalysts.negative.length > 0) {
    html += `
      <div class="subsection">
        <h3>Negative Catalysts</h3>
        <ul class="negative">
          ${catalysts.negative.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  // Add timeline if available
  if (catalysts.timeline) {
    html += `<div class="subsection"><h3>Catalyst Timeline</h3>`;
    
    if (catalysts.timeline.shortTerm && catalysts.timeline.shortTerm.length > 0) {
      html += `
        <h4>Short-term (0-6 months)</h4>
        <ul>
          ${catalysts.timeline.shortTerm.map(item => `<li>${item}</li>`).join('')}
        </ul>
      `;
    }
    
    if (catalysts.timeline.mediumTerm && catalysts.timeline.mediumTerm.length > 0) {
      html += `
        <h4>Medium-term (6-18 months)</h4>
        <ul>
          ${catalysts.timeline.mediumTerm.map(item => `<li>${item}</li>`).join('')}
        </ul>
      `;
    }
    
    if (catalysts.timeline.longTerm && catalysts.timeline.longTerm.length > 0) {
      html += `
        <h4>Long-term (18+ months)</h4>
        <ul>
          ${catalysts.timeline.longTerm.map(item => `<li>${item}</li>`).join('')}
        </ul>
      `;
    }
    
    html += `</div>`;
  }
  
  html += `</div>`;
  return html;
};

/**
 * Generate the HTML for report sections
 */
export const generateReportSections = (report: any): string => {
  if (!report.sections || report.sections.length === 0) {
    return '<div class="report-section"><h2>No sections available</h2><p>No content to display.</p></div>';
  }
  
  let sectionsHTML = '';
  report.sections.forEach(section => {
    sectionsHTML += `
      <div class="report-section">
        <h2>${section.title}</h2>
        <p>${section.content}</p>
      </div>
    `;
  });
  return sectionsHTML;
};

/**
 * Generate the HTML for rating details section
 */
export const generateRatingDetails = (report: any): string => {
  if (!report.ratingDetails) {
    return '';
  }
  
  const { ratingDetails } = report;
  
  return `
    <div class="report-section">
      <h2>Rating Details</h2>
      <p>Overall Rating: ${ratingDetails.overallRating}</p>
      <p>Financial Strength: ${ratingDetails.financialStrength}</p>
      <p>Growth Outlook: ${ratingDetails.growthOutlook}</p>
      <p>Valuation Attractiveness: ${ratingDetails.valuationAttractiveness}</p>
      <p>Competitive Position: ${ratingDetails.competitivePosition}</p>
      ${ratingDetails.ratingScale ? `<p>Rating Scale: ${ratingDetails.ratingScale}</p>` : ''}
      ${ratingDetails.ratingJustification ? `<p>Rating Justification: ${ratingDetails.ratingJustification}</p>` : ''}
    </div>
  `;
};

/**
 * Generate the HTML for the disclaimer section
 */
export const generateDisclaimer = (): string => {
  return `
    <div class="report-section disclaimer">
      <h2>Disclaimer</h2>
      <p>
        This report is for informational purposes only and should not be considered financial advice. 
        Please consult with a financial advisor before making any investment decisions.
      </p>
    </div>
  `;
};
