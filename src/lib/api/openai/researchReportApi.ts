
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
  try {
    const financialSummary = formatFinancialsForPrompt(
      data.financials.income, 
      data.financials.ratios
    );
    
    // Format recent news
    const recentNews = data.news.slice(0, 5).map(n => 
      `- ${n.publishedDate}: ${n.title}`
    ).join('\n');

    // Build system prompt
    const systemPrompt = `You are an expert equity research analyst at a top investment bank. 
Generate a detailed, professional equity research report for ${data.companyName} (${data.symbol}). 
The report should follow a standard Wall Street equity research format with these sections:

1. Executive Summary: A brief overview of the company, recent performance, and investment recommendation
2. Company Background: Information about the company's business model, products, and market position
3. Industry Analysis: Analysis of the sector and industry trends, competitive landscape
4. Financial Analysis: In-depth assessment of financial performance, trends, and projections
5. Valuation: Detailed valuation methodology and price target calculation
6. Investment Thesis: The core arguments for your recommendation
7. Risk Factors: Key risks to your investment thesis and price target
8. Outlook: Future outlook and catalysts

Include a specific BUY, HOLD, or SELL recommendation and a 12-month price target.
Provide specific, data-driven insights, not generic statements.
Use a formal, professional tone throughout.
Be precise about valuation metrics and methodologies.
Base all analysis on the provided data.`;

    // Build user prompt with company data
    const userPrompt = `Generate an equity research report for:
    
Company: ${data.companyName} (${data.symbol})
Sector: ${data.sector}
Industry: ${data.industry}

Description:
${data.description}

Current Stock Data:
Price: $${data.stockData.price}
Change: ${data.stockData.change > 0 ? '+' : ''}${data.stockData.change} (${data.stockData.changesPercentage > 0 ? '+' : ''}${data.stockData.changesPercentage}%)
52-Week Range: $${data.stockData.yearLow} - $${data.stockData.yearHigh}
Market Cap: ${formatFinancialNumber(data.stockData.marketCap)}
P/E Ratio: ${data.stockData.pe ? data.stockData.pe.toFixed(2) : 'N/A'}

${financialSummary}

Recent News:
${recentNews}

Peer Companies: ${data.peers.join(', ')}

Please provide a comprehensive equity research report based on this data. Structure it according to the standard sections and include a clear BUY/HOLD/SELL recommendation with a 12-month price target. The report should be detailed and professional, suitable for institutional investors.`;

    // Call OpenAI API
    const completion = await callOpenAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], 0.7);

    const reportText = completion.choices[0].message.content;
    
    // Parse the AI response into structured format
    const report = parseResearchReport(reportText, data.symbol, data.companyName);
    
    return report;
  } catch (error) {
    console.error("Error generating research report:", error);
    toast.error("Failed to generate research report");
    throw error;
  }
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
      ratingScale: "Buy / Hold / Sell",
      ratingJustification: "Based on fundamental and technical analysis."
    },
    scenarioAnalysis: {
      bullCase: {
        price: "N/A",
        probability: "25",
        drivers: ["Positive market conditions"]
      },
      baseCase: {
        price: "N/A",
        probability: "50",
        drivers: ["Expected market conditions"]
      },
      bearCase: {
        price: "N/A",
        probability: "25",
        drivers: ["Negative market conditions"]
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
