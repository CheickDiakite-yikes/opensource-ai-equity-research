
/**
 * OpenAI API for research report generation
 */

import { toast } from "sonner";
import { ResearchReport, ReportRequest } from "@/types";
import { callOpenAI, formatFinancialNumber } from "./apiUtils";

/**
 * Generate an equity research report
 */
export async function generateResearchReport(data: ReportRequest): Promise<ResearchReport> {
  // This function is deprecated for security reasons
  // Direct OpenAI API calls with hardcoded keys are disabled
  // Use the proper edge function implementation in services/api/analysis/researchService.ts
  console.error("Direct OpenAI research report generation is disabled for security. Use edge function implementation.");
  toast.error("Direct API calls disabled for security. Use proper backend integration.");
  throw new Error("Direct OpenAI API calls disabled for security");
}

/**
 * Format company financials for the prompt
 */
function formatFinancialsForPrompt(
  income: any[], 
  ratios: any[]
): string {
  let result = "Financial Highlights:\n";
  
  // Get the most recent statements
  const latestIncome = income.length > 0 ? income[0] : null;
  const previousIncome = income.length > 1 ? income[1] : null;
  const latestRatio = ratios.length > 0 ? ratios[0] : null;
  
  if (latestIncome) {
    result += `Revenue: ${formatFinancialNumber(latestIncome.revenue)}`;
    
    if (previousIncome) {
      const revenueDiff = ((latestIncome.revenue - previousIncome.revenue) / previousIncome.revenue * 100).toFixed(2);
      result += ` (${Number(revenueDiff) >= 0 ? '+' : ''}${revenueDiff}% YoY)\n`;
    } else {
      result += "\n";
    }
    
    result += `Net Income: ${formatFinancialNumber(latestIncome.netIncome)}`;
    
    if (previousIncome) {
      const netIncomeDiff = ((latestIncome.netIncome - previousIncome.netIncome) / previousIncome.netIncome * 100).toFixed(2);
      result += ` (${Number(netIncomeDiff) >= 0 ? '+' : ''}${netIncomeDiff}% YoY)\n`;
    } else {
      result += "\n";
    }
    
    result += `EPS: ${formatFinancialNumber(latestIncome.eps)}`;
    
    if (previousIncome) {
      const epsDiff = ((latestIncome.eps - previousIncome.eps) / previousIncome.eps * 100).toFixed(2);
      result += ` (${Number(epsDiff) >= 0 ? '+' : ''}${epsDiff}% YoY)\n`;
    } else {
      result += "\n";
    }
  }
  
  if (latestRatio) {
    result += `P/E Ratio: ${latestRatio.priceEarningsRatio ? latestRatio.priceEarningsRatio.toFixed(2) : 'N/A'}\n`;
    result += `Return on Equity: ${latestRatio.returnOnEquity ? (latestRatio.returnOnEquity * 100).toFixed(2) + '%' : 'N/A'}\n`;
    result += `Profit Margin: ${latestRatio.netProfitMargin ? (latestRatio.netProfitMargin * 100).toFixed(2) + '%' : 'N/A'}\n`;
    result += `Debt to Equity: ${latestRatio.debtEquityRatio ? latestRatio.debtEquityRatio.toFixed(2) : 'N/A'}\n`;
  }
  
  return result;
}

/**
 * Parse the AI-generated report text into structured format
 */
function parseResearchReport(reportText: string, symbol: string, companyName: string): ResearchReport {
  // Default structure
  const report: ResearchReport = {
    symbol,
    companyName,
    date: new Date().toISOString().split('T')[0],
    recommendation: "",
    targetPrice: "",
    summary: "",
    sections: [],
    // Add the required properties based on the updated ResearchReport type
    ratingDetails: {
      overallRating: "Strong Buy",
      financialStrength: "A+",
      growthOutlook: "Positive",
      valuationAttractiveness: "Undervalued",
      competitivePosition: "Market Leader",
      ratingScale: "Scale details here...",
      ratingJustification: "Justification details here..."
    },
    scenarioAnalysis: {
      bullCase: {
        price: "$250",
        description: "In an optimistic scenario, we expect significant revenue growth...",
        probability: "30%",
        drivers: ["Accelerated cloud adoption", "Market share gains", "Margin expansion"]
      },
      baseCase: {
        price: "$200",
        description: "Our base case assumes continued steady growth...",
        probability: "50%",
        drivers: ["Consistent cloud growth", "Stable margins", "New product adoption"]
      },
      bearCase: {
        price: "$150",
        description: "In a pessimistic scenario, growth could slow due to...",
        probability: "20%",
        drivers: ["Increased competition", "Margin pressure", "Slowing enterprise spending"]
      }
    },
    catalysts: {
      positive: ["Company growth potential"],
      negative: ["Market risks"]
    }
  };

  // Extract recommendation (BUY, HOLD, SELL)
  const recommendationRegex = /recommendation:\s*(BUY|HOLD|SELL)|rating:\s*(BUY|HOLD|SELL)|(BUY|HOLD|SELL)\s*recommendation/i;
  const recommendationMatch = reportText.match(recommendationRegex);
  if (recommendationMatch) {
    report.recommendation = (recommendationMatch[1] || recommendationMatch[2] || recommendationMatch[3]).toUpperCase();
  }

  // Extract price target
  const priceTargetRegex = /price target:?\s*\$?(\d+\.?\d*)|target price:?\s*\$?(\d+\.?\d*)|target:\s*\$?(\d+\.?\d*)/i;
  const priceTargetMatch = reportText.match(priceTargetRegex);
  if (priceTargetMatch) {
    report.targetPrice = `$${priceTargetMatch[1] || priceTargetMatch[2] || priceTargetMatch[3]}`;
  }

  // Split text into sections
  const sections = reportText.split(/(?=\n\s*\d+\.\s+[A-Z]|\n\s*[A-Z][A-Za-z\s]+:)/g);
  
  // Process each section
  for (const section of sections) {
    const lines = section.trim().split('\n');
    
    // Extract section title
    const titleLine = lines[0].trim();
    const titleMatch = titleLine.match(/(\d+\.\s+([A-Za-z\s]+)|([A-Za-z\s]+):)/);
    
    if (titleMatch) {
      const title = (titleMatch[2] || titleMatch[3]).trim();
      const content = lines.slice(1).join('\n').trim();
      
      // Identify the summary section
      if (title.toLowerCase().includes('executive summary') || title.toLowerCase().includes('summary')) {
        report.summary = content;
      }
      
      report.sections.push({
        title,
        content
      });
    } else if (lines.length > 0 && !report.sections.length) {
      // If no sections found yet, this might be the introductory paragraph
      report.summary = section.trim();
    }
  }

  // If we couldn't extract certain key elements, use defaults
  if (!report.recommendation) {
    // Try to infer from the text
    if (reportText.toLowerCase().includes('buy')) report.recommendation = 'BUY';
    else if (reportText.toLowerCase().includes('sell')) report.recommendation = 'SELL';
    else report.recommendation = 'HOLD';
  }
  
  if (!report.targetPrice) {
    report.targetPrice = 'See report for details';
  }
  
  if (!report.summary && report.sections.length > 0) {
    report.summary = report.sections[0].content;
  }
  
  // Update the base case target price if we have a valid target price
  if (report.targetPrice && report.targetPrice !== 'See report for details') {
    report.scenarioAnalysis.baseCase.price = report.targetPrice;
  }

  return report;
}
