
import { toast } from "@/components/ui/use-toast";
import { ResearchReport } from "@/types";
import { generateReportHTML } from "@/lib/utils";

/**
 * Generates and downloads a research report as an HTML file
 */
export const downloadReportAsHTML = (report: ResearchReport) => {
  if (!report) return;
  
  const title = `${report.companyName} (${report.symbol}) - Equity Research Report`;
  
  let content = `<h1>${title}</h1>`;
  content += `<p class="date">Date: ${report.date}</p>`;
  content += `<p class="recommendation"><strong>Recommendation:</strong> ${report.recommendation}</p>`;
  content += `<p class="price-target"><strong>Price Target:</strong> ${report.targetPrice}</p>`;
  
  content += `<div class="summary">
    <h2>Executive Summary</h2>
    <p>${report.summary}</p>
  </div>`;
  
  // Add scenarios if they exist
  if (report.scenarioAnalysis) {
    content += `<div class="scenario-analysis">
      <h2>Scenario Analysis</h2>
      <div class="scenario bull">
        <h3>Bull Case: ${report.scenarioAnalysis.bullCase.price}</h3>
        <p>Probability: ${report.scenarioAnalysis.bullCase.probability}</p>
        <ul>${report.scenarioAnalysis.bullCase.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
      </div>
      <div class="scenario base">
        <h3>Base Case: ${report.scenarioAnalysis.baseCase.price}</h3>
        <p>Probability: ${report.scenarioAnalysis.baseCase.probability}</p>
        <ul>${report.scenarioAnalysis.baseCase.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
      </div>
      <div class="scenario bear">
        <h3>Bear Case: ${report.scenarioAnalysis.bearCase.price}</h3>
        <p>Probability: ${report.scenarioAnalysis.bearCase.probability}</p>
        <ul>${report.scenarioAnalysis.bearCase.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
      </div>
    </div>`;
  }
  
  // Add catalysts if they exist
  if (report.catalysts) {
    content += `<div class="catalysts">
      <h2>Growth Catalysts & Inhibitors</h2>
      <div class="positive">
        <h3>Positive Catalysts</h3>
        <ul>${report.catalysts.positive.map(c => `<li>${c}</li>`).join('')}</ul>
      </div>
      <div class="negative">
        <h3>Negative Catalysts</h3>
        <ul>${report.catalysts.negative.map(c => `<li>${c}</li>`).join('')}</ul>
      </div>
    </div>`;
  }
  
  // Add rating details if they exist
  if (report.ratingDetails) {
    content += `<div class="rating-details">
      <h2>Rating Details</h2>
      <p><strong>Rating Scale:</strong> ${report.ratingDetails.ratingScale}</p>
      <p><strong>Justification:</strong> ${report.ratingDetails.ratingJustification}</p>
    </div>`;
  }
  
  // Add all the standard sections
  report.sections.forEach(section => {
    content += `<div class="section">
      <h2>${section.title}</h2>
      <div>${section.content}</div>
    </div>`;
  });
  
  const htmlContent = generateReportHTML(title, content);
  
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
