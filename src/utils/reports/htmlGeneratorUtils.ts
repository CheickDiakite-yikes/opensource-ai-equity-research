
import { 
  ResearchReport, 
  ScenarioAnalysis, 
  GrowthCatalysts,
  RatingDetails 
} from "@/types/ai-analysis/reportTypes";

/**
 * Generate HTML for the report header section
 */
export const generateReportHeader = (report: ResearchReport): string => {
  return `
    <div class="report-header">
      <h1>${report.companyName} (${report.symbol})</h1>
      <div class="report-meta">
        <p class="report-date">Report Date: ${report.date}</p>
        <p class="report-recommendation">Recommendation: <span class="recommendation">${report.recommendation}</span></p>
        <p class="report-target">Target Price: <span class="target-price">${report.targetPrice}</span></p>
      </div>
    </div>
  `;
};

/**
 * Generate HTML for the executive summary section
 */
export const generateExecutiveSummary = (report: ResearchReport): string => {
  if (!report.summary) return '';
  
  return `
    <div class="report-section">
      <h2>Executive Summary</h2>
      <div class="summary-content">
        <p>${report.summary}</p>
      </div>
    </div>
  `;
};

/**
 * Generate HTML for scenario analysis section
 */
export const generateScenarioAnalysis = (scenarios: ScenarioAnalysis): string => {
  return `
    <div class="report-section">
      <h2>Scenario Analysis</h2>
      <div class="scenarios">
        <div class="scenario bull">
          <h3>Bull Case</h3>
          <p class="scenario-price">${scenarios.bullCase.price}</p>
          <p>${scenarios.bullCase.description}</p>
          ${scenarios.bullCase.probability ? `<p><strong>Probability:</strong> ${scenarios.bullCase.probability}</p>` : ''}
          ${scenarios.bullCase.drivers && scenarios.bullCase.drivers.length > 0 ? `
            <div class="drivers">
              <h4>Key Drivers</h4>
              <ul>
                ${scenarios.bullCase.drivers.map(driver => `<li>${driver}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        
        <div class="scenario base">
          <h3>Base Case</h3>
          <p class="scenario-price">${scenarios.baseCase.price}</p>
          <p>${scenarios.baseCase.description}</p>
          ${scenarios.baseCase.probability ? `<p><strong>Probability:</strong> ${scenarios.baseCase.probability}</p>` : ''}
          ${scenarios.baseCase.drivers && scenarios.baseCase.drivers.length > 0 ? `
            <div class="drivers">
              <h4>Key Drivers</h4>
              <ul>
                ${scenarios.baseCase.drivers.map(driver => `<li>${driver}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        
        <div class="scenario bear">
          <h3>Bear Case</h3>
          <p class="scenario-price">${scenarios.bearCase.price}</p>
          <p>${scenarios.bearCase.description}</p>
          ${scenarios.bearCase.probability ? `<p><strong>Probability:</strong> ${scenarios.bearCase.probability}</p>` : ''}
          ${scenarios.bearCase.drivers && scenarios.bearCase.drivers.length > 0 ? `
            <div class="drivers">
              <h4>Key Drivers</h4>
              <ul>
                ${scenarios.bearCase.drivers.map(driver => `<li>${driver}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
};

/**
 * Generate HTML for growth catalysts section
 */
export const generateGrowthCatalysts = (catalysts: GrowthCatalysts | string[]): string => {
  // Handle string array case
  if (Array.isArray(catalysts)) {
    return `
      <div class="report-section">
        <h2>Growth Catalysts</h2>
        <ul class="catalysts-list">
          ${catalysts.map(catalyst => `<li>${catalyst}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  // Handle GrowthCatalysts object case
  const positiveCatalysts = catalysts.positive && catalysts.positive.length > 0 ? `
    <div class="positive-catalysts">
      <h3>Positive Catalysts</h3>
      <ul>
        ${catalysts.positive.map(catalyst => `<li>${catalyst}</li>`).join('')}
      </ul>
    </div>
  ` : '';
  
  const negativeCatalysts = catalysts.negative && catalysts.negative.length > 0 ? `
    <div class="negative-catalysts">
      <h3>Negative Catalysts</h3>
      <ul>
        ${catalysts.negative.map(catalyst => `<li>${catalyst}</li>`).join('')}
      </ul>
    </div>
  ` : '';
  
  const timelineSection = catalysts.timeline ? `
    <div class="catalysts-timeline">
      <h3>Timeline of Expected Catalysts</h3>
      
      ${catalysts.timeline.shortTerm && catalysts.timeline.shortTerm.length > 0 ? `
        <div class="short-term">
          <h4>Short-term</h4>
          <ul>
            ${catalysts.timeline.shortTerm.map(catalyst => `<li>${catalyst}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${catalysts.timeline.mediumTerm && catalysts.timeline.mediumTerm.length > 0 ? `
        <div class="medium-term">
          <h4>Medium-term</h4>
          <ul>
            ${catalysts.timeline.mediumTerm.map(catalyst => `<li>${catalyst}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${catalysts.timeline.longTerm && catalysts.timeline.longTerm.length > 0 ? `
        <div class="long-term">
          <h4>Long-term</h4>
          <ul>
            ${catalysts.timeline.longTerm.map(catalyst => `<li>${catalyst}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  ` : '';
  
  return `
    <div class="report-section">
      <h2>Growth Catalysts & Inhibitors</h2>
      ${positiveCatalysts}
      ${negativeCatalysts}
      ${timelineSection}
    </div>
  `;
};

/**
 * Generate HTML for all report sections
 */
export const generateReportSections = (report: ResearchReport): string => {
  if (!report.sections || report.sections.length === 0) return '';
  
  return report.sections.map(section => `
    <div class="report-section">
      <h2>${section.title}</h2>
      <div class="section-content">
        ${section.content.replace(/\n/g, '<br>')}
      </div>
    </div>
  `).join('');
};

/**
 * Generate HTML for rating details section
 */
export const generateRatingDetails = (report: ResearchReport): string => {
  if (!report.ratingDetails) return '';
  
  const ratings = report.ratingDetails;
  
  return `
    <div class="report-section rating-details">
      <h2>Rating Details</h2>
      <div class="ratings-grid">
        <div class="rating-item">
          <h3>Overall Rating</h3>
          <p class="rating-value">${ratings.overallRating}</p>
        </div>
        <div class="rating-item">
          <h3>Financial Strength</h3>
          <p class="rating-value">${ratings.financialStrength}</p>
        </div>
        <div class="rating-item">
          <h3>Growth Outlook</h3>
          <p class="rating-value">${ratings.growthOutlook}</p>
        </div>
        <div class="rating-item">
          <h3>Valuation Attractiveness</h3>
          <p class="rating-value">${ratings.valuationAttractiveness}</p>
        </div>
        <div class="rating-item">
          <h3>Competitive Position</h3>
          <p class="rating-value">${ratings.competitivePosition}</p>
        </div>
      </div>
      ${ratings.ratingScale ? `
        <div class="rating-scale">
          <h3>Rating Scale</h3>
          <p>${ratings.ratingScale}</p>
        </div>
      ` : ''}
      ${ratings.ratingJustification ? `
        <div class="rating-justification">
          <h3>Rating Justification</h3>
          <p>${ratings.ratingJustification}</p>
        </div>
      ` : ''}
    </div>
  `;
};

/**
 * Generate HTML for the disclaimer section
 */
export const generateDisclaimer = (): string => {
  return `
    <div class="disclaimer">
      <h3>Important Disclaimers</h3>
      <p>This report is for informational purposes only and does not constitute investment advice. The analysis contained herein is based on information that is believed to be reliable, but its accuracy and completeness cannot be guaranteed. Opinions expressed are subject to change without notice.</p>
      <p>Past performance is not indicative of future results. All investments involve risk, including the potential loss of principal. Investors should conduct their own due diligence before making any investment decisions.</p>
      <p>This report was generated with the assistance of artificial intelligence. The AI engine analyzes financial data and patterns to provide insights, but the resulting analysis should be reviewed by a qualified financial professional before making investment decisions.</p>
    </div>
  `;
};
