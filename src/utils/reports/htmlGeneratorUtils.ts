
import { ResearchReport, ScenarioAnalysis, RatingDetails, GrowthCatalysts } from "@/types/ai-analysis/reportTypes";

// Generate report header HTML
export const generateReportHeader = (report: ResearchReport): string => {
  return `
    <div class="report-header">
      <h1>${report.companyName} (${report.symbol})</h1>
      <div class="report-meta">
        <div class="report-date">Date: ${report.date}</div>
        <div class="report-recommendation">Recommendation: <span class="recommendation">${report.recommendation}</span></div>
        <div class="report-price">Price Target: <span class="target-price">${report.targetPrice}</span></div>
      </div>
    </div>
  `;
};

// Generate executive summary HTML
export const generateExecutiveSummary = (report: ResearchReport): string => {
  return `
    <div class="report-section">
      <h2>Executive Summary</h2>
      <div class="summary-content">
        ${report.summary}
      </div>
    </div>
  `;
};

// Generate scenario analysis HTML
export const generateScenarioAnalysis = (scenarioAnalysis: ScenarioAnalysis): string => {
  if (!scenarioAnalysis) return '';
  
  return `
    <div class="report-section">
      <h3>Scenario Analysis</h3>
      <div class="scenarios">
        <div class="scenario bear-case">
          <h4>Bear Case: ${scenarioAnalysis.bearCase.price}</h4>
          <p>${scenarioAnalysis.bearCase.description}</p>
          ${scenarioAnalysis.bearCase.probability ? `<p>Probability: ${scenarioAnalysis.bearCase.probability}</p>` : ''}
          ${scenarioAnalysis.bearCase.drivers && scenarioAnalysis.bearCase.drivers.length > 0 ? 
            `<div class="drivers">
              <h5>Key Drivers:</h5>
              <ul>${scenarioAnalysis.bearCase.drivers.map(driver => `<li>${driver}</li>`).join('')}</ul>
            </div>` : ''}
        </div>
        
        <div class="scenario base-case">
          <h4>Base Case: ${scenarioAnalysis.baseCase.price}</h4>
          <p>${scenarioAnalysis.baseCase.description}</p>
          ${scenarioAnalysis.baseCase.probability ? `<p>Probability: ${scenarioAnalysis.baseCase.probability}</p>` : ''}
          ${scenarioAnalysis.baseCase.drivers && scenarioAnalysis.baseCase.drivers.length > 0 ? 
            `<div class="drivers">
              <h5>Key Drivers:</h5>
              <ul>${scenarioAnalysis.baseCase.drivers.map(driver => `<li>${driver}</li>`).join('')}</ul>
            </div>` : ''}
        </div>
        
        <div class="scenario bull-case">
          <h4>Bull Case: ${scenarioAnalysis.bullCase.price}</h4>
          <p>${scenarioAnalysis.bullCase.description}</p>
          ${scenarioAnalysis.bullCase.probability ? `<p>Probability: ${scenarioAnalysis.bullCase.probability}</p>` : ''}
          ${scenarioAnalysis.bullCase.drivers && scenarioAnalysis.bullCase.drivers.length > 0 ? 
            `<div class="drivers">
              <h5>Key Drivers:</h5>
              <ul>${scenarioAnalysis.bullCase.drivers.map(driver => `<li>${driver}</li>`).join('')}</ul>
            </div>` : ''}
        </div>
      </div>
    </div>
  `;
};

// Implement growth catalysts generator to support both types
export const generateGrowthCatalysts = (catalysts: GrowthCatalysts | string[] | undefined): string => {
  if (!catalysts) return '';
  
  // Handle string array format (legacy)
  if (Array.isArray(catalysts)) {
    let html = `
      <div class="report-section">
        <h3>Key Growth Catalysts</h3>
        <ul>
    `;
    
    catalysts.forEach(catalyst => {
      html += `<li>${catalyst}</li>`;
    });
    
    html += `
        </ul>
      </div>
    `;
    
    return html;
  }
  
  // Handle GrowthCatalysts object format
  let html = '<div class="report-section">';
  
  // Positive catalysts
  if (catalysts.positive && catalysts.positive.length > 0) {
    html += `
      <h3>Positive Growth Catalysts</h3>
      <ul>
    `;
    
    catalysts.positive.forEach((catalyst: string) => {
      html += `<li>${catalyst}</li>`;
    });
    
    html += '</ul>';
  }
  
  // Negative catalysts
  if (catalysts.negative && catalysts.negative.length > 0) {
    html += `
      <h3>Risk Factors</h3>
      <ul>
    `;
    
    catalysts.negative.forEach((catalyst: string) => {
      html += `<li>${catalyst}</li>`;
    });
    
    html += '</ul>';
  }
  
  // Timeline
  if (catalysts.timeline) {
    html += '<h3>Catalyst Timeline</h3>';
    
    // Short-term
    if (catalysts.timeline.shortTerm && catalysts.timeline.shortTerm.length > 0) {
      html += `
        <h4>Short-term</h4>
        <ul>
      `;
      
      catalysts.timeline.shortTerm.forEach((item: string) => {
        html += `<li>${item}</li>`;
      });
      
      html += '</ul>';
    }
    
    // Medium-term
    if (catalysts.timeline.mediumTerm && catalysts.timeline.mediumTerm.length > 0) {
      html += `
        <h4>Medium-term</h4>
        <ul>
      `;
      
      catalysts.timeline.mediumTerm.forEach((item: string) => {
        html += `<li>${item}</li>`;
      });
      
      html += '</ul>';
    }
    
    // Long-term
    if (catalysts.timeline.longTerm && catalysts.timeline.longTerm.length > 0) {
      html += `
        <h4>Long-term</h4>
        <ul>
      `;
      
      catalysts.timeline.longTerm.forEach((item: string) => {
        html += `<li>${item}</li>`;
      });
      
      html += '</ul>';
    }
  }
  
  html += '</div>';
  
  return html;
};

// Generate report sections HTML
export const generateReportSections = (report: ResearchReport): string => {
  let html = '';
  
  if (report.sections && report.sections.length > 0) {
    report.sections.forEach(section => {
      html += `
        <div class="report-section">
          <h3>${section.title}</h3>
          <div class="section-content">
            ${section.content}
          </div>
        </div>
      `;
    });
  }
  
  return html;
};

// Generate rating details HTML
export const generateRatingDetails = (report: ResearchReport): string => {
  if (!report.ratingDetails) return '';
  
  const ratings = report.ratingDetails;
  
  return `
    <div class="report-section">
      <h3>Rating Details</h3>
      <div class="rating-details">
        <div class="rating-item">
          <span class="rating-label">Overall Rating:</span>
          <span class="rating-value">${ratings.overallRating}</span>
        </div>
        <div class="rating-item">
          <span class="rating-label">Financial Strength:</span>
          <span class="rating-value">${ratings.financialStrength}</span>
        </div>
        <div class="rating-item">
          <span class="rating-label">Growth Outlook:</span>
          <span class="rating-value">${ratings.growthOutlook}</span>
        </div>
        <div class="rating-item">
          <span class="rating-label">Valuation Attractiveness:</span>
          <span class="rating-value">${ratings.valuationAttractiveness}</span>
        </div>
        <div class="rating-item">
          <span class="rating-label">Competitive Position:</span>
          <span class="rating-value">${ratings.competitivePosition}</span>
        </div>
        ${ratings.ratingScale ? 
          `<div class="rating-item">
            <span class="rating-label">Rating Scale:</span>
            <span class="rating-value">${ratings.ratingScale}</span>
          </div>` : ''}
        ${ratings.ratingJustification ? 
          `<div class="rating-justification">
            <h4>Rating Justification</h4>
            <p>${ratings.ratingJustification}</p>
          </div>` : ''}
      </div>
    </div>
  `;
};

// Generate disclaimer HTML
export const generateDisclaimer = (): string => {
  return `
    <div class="report-disclaimer">
      <h3>Disclaimer</h3>
      <p>
        This report is for informational purposes only and does not constitute investment advice. 
        The information contained herein is based on data believed to be reliable but no guarantee 
        is made as to its accuracy or completeness. Past performance is no guarantee of future results. 
        Investing involves risk, including the possible loss of principal.
      </p>
      <p>
        This report was generated with the assistance of artificial intelligence tools and may contain 
        limitations or inaccuracies inherent to such technology. Users should conduct their own research 
        and consult with financial professionals before making investment decisions.
      </p>
    </div>
  `;
};
