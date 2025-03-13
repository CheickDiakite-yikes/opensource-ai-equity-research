
/**
 * Utilities for generating HTML content for research reports
 */

import { ResearchReport, ScenarioAnalysis, GrowthCatalysts } from "@/types/ai-analysis/reportTypes";

/**
 * Generates the HTML header section for a research report
 */
export const generateReportHeader = (report: ResearchReport): string => {
  const title = `${report.companyName} (${report.symbol}) - Equity Research Report`;
  
  return `
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
        
        <div class="rating-item">
          <h3>Rating Scale</h3>
          <p>Buy, Sell, Hold, Overweight, Underweight</p>
        </div>
      </div>
    </div>`;
};

/**
 * Generates the executive summary HTML section for a research report
 */
export const generateExecutiveSummary = (report: ResearchReport): string => {
  return `
    <div class="summary">
      <h2>Executive Summary</h2>
      <p>${report.summary || "No summary available"}</p>
    </div>`;
};

/**
 * Generates the scenario analysis HTML section for a research report
 */
export const generateScenarioAnalysis = (scenarioAnalysis?: ScenarioAnalysis): string => {
  if (!scenarioAnalysis) return '';
  
  return `
    <div class="section scenario-analysis">
      <h2>Sensitivity Analysis</h2>
      
      <div class="scenario bull">
        <h3>Bull Case: ${scenarioAnalysis.bullCase?.price || "N/A"}</h3>
        <p>Probability: ${scenarioAnalysis.bullCase?.probability || "N/A"}</p>
        ${scenarioAnalysis.bullCase?.drivers && scenarioAnalysis.bullCase.drivers.length ? 
          `<div class="drivers">
            <h4>Key Drivers:</h4>
            <ul>${scenarioAnalysis.bullCase.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>` : ''
        }
      </div>
      
      <div class="scenario base">
        <h3>Base Case: ${scenarioAnalysis.baseCase?.price || "N/A"}</h3>
        <p>Probability: ${scenarioAnalysis.baseCase?.probability || "N/A"}</p>
        ${scenarioAnalysis.baseCase?.drivers && scenarioAnalysis.baseCase.drivers.length ? 
          `<div class="drivers">
            <h4>Key Drivers:</h4>
            <ul>${scenarioAnalysis.baseCase.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>` : ''
        }
      </div>
      
      <div class="scenario bear">
        <h3>Bear Case: ${scenarioAnalysis.bearCase?.price || "N/A"}</h3>
        <p>Probability: ${scenarioAnalysis.bearCase?.probability || "N/A"}</p>
        ${scenarioAnalysis.bearCase?.drivers && scenarioAnalysis.bearCase.drivers.length ? 
          `<div class="drivers">
            <h4>Key Drivers:</h4>
            <ul>${scenarioAnalysis.bearCase.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>` : ''
        }
      </div>
    </div>`;
};

/**
 * Generates growth catalysts HTML section for a research report
 */
export const generateGrowthCatalysts = (catalysts?: GrowthCatalysts): string => {
  if (!catalysts) return '';
  
  return `
    <div class="section catalysts">
      <h2>Growth Catalysts & Inhibitors</h2>
      
      ${catalysts.positive && catalysts.positive.length ? 
        `<div class="positive-catalysts">
          <h3>Positive Catalysts</h3>
          <ul>${catalysts.positive.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>` : ''
      }
      
      ${catalysts.negative && catalysts.negative.length ? 
        `<div class="negative-catalysts">
          <h3>Negative Catalysts</h3>
          <ul>${catalysts.negative.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>` : ''
      }
      
      ${catalysts.timeline ? 
        `<div class="catalysts-timeline">
          <h3>Timeline of Expected Catalysts</h3>
          
          ${catalysts.timeline.shortTerm && catalysts.timeline.shortTerm.length ? 
            `<div class="timeline-section">
              <h4>Short-term</h4>
              <ul>${catalysts.timeline.shortTerm.map(c => `<li>${c}</li>`).join('')}</ul>
            </div>` : ''
          }
          
          ${catalysts.timeline.mediumTerm && catalysts.timeline.mediumTerm.length ? 
            `<div class="timeline-section">
              <h4>Medium-term</h4>
              <ul>${catalysts.timeline.mediumTerm.map(c => `<li>${c}</li>`).join('')}</ul>
            </div>` : ''
          }
          
          ${catalysts.timeline.longTerm && catalysts.timeline.longTerm.length ? 
            `<div class="timeline-section">
              <h4>Long-term</h4>
              <ul>${catalysts.timeline.longTerm.map(c => `<li>${c}</li>`).join('')}</ul>
            </div>` : ''
          }
        </div>` : ''
      }
    </div>`;
};

/**
 * Generates the report sections HTML for a research report
 */
export const generateReportSections = (report: ResearchReport): string => {
  let sectionsContent = '';
  
  report.sections.forEach(section => {
    sectionsContent += `
      <div class="section ${section.title.toLowerCase().replace(/\s+/g, '-')}">
        <h2>${section.title}</h2>
        <div class="section-content">${section.content}</div>
      </div>`;
  });
  
  return sectionsContent;
};

/**
 * Generates the rating details HTML section for a research report
 */
export const generateRatingDetails = (report: ResearchReport): string => {
  if (!report.ratingDetails) return '';
  
  return `
    <div class="section rating-details">
      <h2>Rating and Recommendation</h2>
      <p><strong>Rating Scale:</strong> Our recommendations include: Buy, Sell, Hold, Overweight, and Underweight</p>
      <p><strong>Recommendation:</strong> ${report.recommendation}</p>
      ${report.ratingDetails.ratingJustification ? 
        `<p><strong>Justification:</strong> ${report.ratingDetails.ratingJustification}</p>` : ''
      }
    </div>`;
};

/**
 * Generates the disclaimer HTML section
 */
export const generateDisclaimer = (): string => {
  return `
    <div class="disclaimer">
      <h2>Disclaimer</h2>
      <p>This equity research report has been generated using DiDi's proprietary artificial intelligence system and is provided for informational purposes only. The analysis, opinions, and recommendations contained herein do not constitute financial, investment, or professional advice, nor an offer or solicitation to buy or sell securities. DiDi does not guarantee the accuracy, completeness, or reliability of the content, and shall not be liable for any errors, omissions, or losses arising from its use. Investors must conduct their own independent analysis and consult qualified financial advisors before making any investment decisions.</p>
    </div>`;
};
