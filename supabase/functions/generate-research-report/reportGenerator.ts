
// Import the necessary utilities and types
import { OpenAI } from "https://esm.sh/openai@4.28.0";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/fetch-utils.ts";
import { ResearchReport } from "./types.ts";

/**
 * Generates a detailed research report using OpenAI's GPT model
 */
export async function generateResearchReport(reportRequest: any): Promise<ResearchReport> {
  console.log("Starting report generation for:", reportRequest.symbol);
  
  try {
    // Initialize OpenAI client with API key from environment
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("OPENAI_API_KEY environment variable not set");
      throw new Error("OpenAI API key not configured");
    }
    
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    // Extract necessary information from the report request
    const {
      symbol,
      companyName,
      sector,
      industry,
      description,
      stockData,
      financials,
      news,
      peers,
      reportType,
      recommendationTrends,
      finnhubNews,
      finnhubPeers,
      earningsCalendar,
      enterpriseValue,
      analystEstimates
    } = reportRequest;
    
    console.log(`Generating ${reportType || 'standard'} research report for ${symbol}`);
    console.log("Data available for report generation:", {
      hasFinancials: !!financials && Object.keys(financials).length > 0,
      financialKeys: financials ? Object.keys(financials) : [],
      hasNews: !!news && news.length > 0,
      newCount: news?.length || 0,
      hasPeers: !!peers && peers.length > 0,
      peerCount: peers?.length || 0,
      hasRecommendationTrends: !!recommendationTrends && recommendationTrends.length > 0,
      hasEnterpriseValue: !!enterpriseValue && enterpriseValue.length > 0,
      hasAnalystEstimates: !!analystEstimates && analystEstimates.length > 0
    });
    
    // Prepare the summary of financial data to include in the prompt
    const financialSummary = prepareFinancialSummary(financials);
    
    // Prepare system message with detailed instructions
    const systemMessage = {
      role: "system",
      content: `You are an expert equity research analyst providing detailed investment reports. 
Create a comprehensive, professional research report for ${companyName} (${symbol}) in the ${industry} industry.

Your report MUST include ALL of the following sections, each with detailed content:
1. Investment Thesis - Provide an overview of investment recommendation with clear rationale
2. Business Overview - Summarize company operations, products, market position
3. Financial Analysis - Analyze revenue, margins, profitability, balance sheet strength
4. Valuation - Evaluate current stock price, compare to peers, estimate fair value
5. Risk Factors - Identify key risks that could impact investment thesis
6. ESG Considerations - Evaluate environmental, social, governance factors

CRITICAL: ENSURE all six sections above are included with substantive content.

Additionally, provide:
- Clear "Buy", "Hold", or "Sell" recommendation
- Target price with justification
- Rating details (financial strength, growth outlook, etc.)
- Scenario analysis (bull, base, bear cases)
- Growth catalysts (short, medium, long-term)

The research report type is "${reportType || 'comprehensive'}", so emphasize ${
  reportType === 'financial' ? 'financial metrics and performance' :
  reportType === 'valuation' ? 'valuation analysis and price targets' :
  'comprehensive analysis across all factors'
}.

Be specific, data-driven, and objective in your analysis. Use the financial data provided.`
    };
    
    // Prepare the user message with company and financial data
    const userMessage = {
      role: "user",
      content: `Generate a research report for ${companyName} (${symbol}) in the ${sector} / ${industry} industry.

Company Description:
${description}

Current Stock Data:
- Price: $${stockData.price.toFixed(2)}
- Change: ${stockData.change > 0 ? '+' : ''}${stockData.change.toFixed(2)} (${stockData.changesPercentage.toFixed(2)}%)
- 52 Week Range: $${stockData.yearLow.toFixed(2)} - $${stockData.yearHigh.toFixed(2)}
- Market Cap: $${(stockData.marketCap / 1000000000).toFixed(2)} billion
${stockData.pe ? `- P/E Ratio: ${stockData.pe.toFixed(2)}` : ''}

Financial Summary:
${financialSummary}

${news && news.length > 0 ? `
Recent News Headlines:
${news.slice(0, 5).map((n: any) => `- ${n.title}`).join('\n')}
` : ''}

${peers && peers.length > 0 ? `
Peer Companies: ${peers.join(', ')}
` : ''}

${recommendationTrends && recommendationTrends.length > 0 ? `
Analyst Consensus: 
- Strong Buy: ${recommendationTrends[0].strongBuy}
- Buy: ${recommendationTrends[0].buy}
- Hold: ${recommendationTrends[0].hold}
- Sell: ${recommendationTrends[0].sell}
- Strong Sell: ${recommendationTrends[0].strongSell}
` : ''}

${analystEstimates && analystEstimates.length > 0 ? `
Analyst Estimates:
${JSON.stringify(analystEstimates[0], null, 2).substring(0, 500)}...
` : ''}

Format the report as a structured JSON object with the following properties:
- symbol
- companyName
- date (current date)
- recommendation (e.g., "Buy", "Hold", "Sell")
- targetPrice (with $ prefix)
- summary (optional executive summary)
- sections (array of objects with title and content)
- ratingDetails (object with ratings for different aspects)
- scenarioAnalysis (object with bull, base, and bear cases)
- catalysts (object with positive and negative catalysts, optional timeline)
`
    };
    
    console.log("Sending request to OpenAI for report generation...");
    console.log("System message length:", systemMessage.content.length);
    console.log("User message length:", userMessage.content.length);
    
    // Call OpenAI API to generate the report
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [systemMessage, userMessage],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
      timeout: 180, // 3 minutes
    });
    
    // Extract the content from the response
    const content = response.choices[0].message.content;
    console.log("Raw response:", content);
    
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }
    
    // Parse the JSON response
    let reportData: any;
    try {
      reportData = JSON.parse(content);
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      console.error("Raw content:", content);
      throw new Error("Failed to parse report data");
    }
    
    // Ensure the report has all required sections and data
    const report = ensureCompleteReport(reportData, symbol, companyName);
    
    console.log("Report generated successfully");
    console.log("Sections included:", report.sections.map(s => s.title));
    
    return report;
  } catch (error) {
    console.error("Error in generateResearchReport:", error);
    throw error;
  }
}

/**
 * Ensures that the report has all the required sections and data
 */
function ensureCompleteReport(report: any, symbol: string, companyName: string): ResearchReport {
  // Create a date string for the report
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Standard sections that should be in every report
  const requiredSections = [
    "Investment Thesis",
    "Business Overview",
    "Financial Analysis",
    "Valuation",
    "Risk Factors",
    "ESG Considerations"
  ];
  
  // If sections array doesn't exist or is empty, create it with placeholder content
  if (!report.sections || !Array.isArray(report.sections) || report.sections.length === 0) {
    console.warn("No sections found in report, creating placeholders");
    report.sections = requiredSections.map(title => ({
      title,
      content: `This ${title.toLowerCase()} section includes analysis of key factors related to the company's ${title.toLowerCase()}.`
    }));
  }
  
  // Check if any required sections are missing
  const existingSectionTitles = report.sections.map((s: any) => s.title);
  console.log("Existing sections:", existingSectionTitles);
  
  for (const requiredSection of requiredSections) {
    const hasSection = existingSectionTitles.some(
      (title: string) => title.includes(requiredSection) || 
                         requiredSection.includes(title) ||
                         title.toLowerCase().includes(requiredSection.toLowerCase())
    );
    
    if (!hasSection) {
      console.warn(`Adding missing required section: ${requiredSection}`);
      report.sections.push({
        title: requiredSection,
        content: `This ${requiredSection.toLowerCase()} section includes analysis of key factors related to the company's ${requiredSection.toLowerCase()}.`
      });
    }
  }
  
  // Ensure report has basic required fields
  const enhancedReport = {
    symbol: report.symbol || symbol,
    companyName: report.companyName || companyName,
    date: report.date || currentDate,
    recommendation: report.recommendation || "Neutral",
    targetPrice: report.targetPrice || "N/A",
    summary: report.summary || `${companyName} (${symbol}) research report generated on ${currentDate}.`,
    sections: report.sections || [],
    ratingDetails: report.ratingDetails || {
      overallRating: "Neutral",
      financialStrength: "Average",
      growthOutlook: "Stable",
      valuationAttractiveness: "Fair",
      competitivePosition: "Established"
    },
    scenarioAnalysis: report.scenarioAnalysis || {
      bullCase: {
        price: "N/A",
        description: "Optimistic scenario based on favorable market conditions and strong execution."
      },
      baseCase: {
        price: "N/A", 
        description: "Most likely scenario based on current market conditions and company performance."
      },
      bearCase: {
        price: "N/A",
        description: "Pessimistic scenario accounting for potential risks and challenges."
      }
    },
    catalysts: report.catalysts || {
      positive: ["Growth in core business", "Market expansion opportunities"],
      negative: ["Competitive pressures", "Regulatory challenges"]
    }
  };
  
  // Log the enhanced report structure
  console.log("Final report structure:", {
    symbol: enhancedReport.symbol,
    companyName: enhancedReport.companyName,
    recommendation: enhancedReport.recommendation,
    targetPrice: enhancedReport.targetPrice,
    numSections: enhancedReport.sections.length,
    sectionTitles: enhancedReport.sections.map((s: any) => s.title),
    hasRatingDetails: !!enhancedReport.ratingDetails,
    hasScenarioAnalysis: !!enhancedReport.scenarioAnalysis,
    hasCatalysts: !!enhancedReport.catalysts
  });
  
  return enhancedReport as ResearchReport;
}

/**
 * Prepares a summary of financial data for inclusion in the prompt
 */
function prepareFinancialSummary(financials: any): string {
  if (!financials) {
    return "No financial data available.";
  }
  
  let summary = "";
  
  // Process income statement data
  if (financials.income && financials.income.length > 0) {
    const latestYear = financials.income[0];
    const previousYear = financials.income[1];
    
    summary += `Income Statement (Latest Year):\n`;
    summary += `- Revenue: $${(latestYear.revenue / 1000000000).toFixed(2)} billion`;
    
    if (previousYear) {
      const yoyGrowth = ((latestYear.revenue - previousYear.revenue) / previousYear.revenue * 100).toFixed(2);
      summary += ` (${yoyGrowth}% YoY)\n`;
    } else {
      summary += `\n`;
    }
    
    summary += `- Gross Profit: $${(latestYear.grossProfit / 1000000000).toFixed(2)} billion (Margin: ${(latestYear.grossProfitRatio * 100).toFixed(2)}%)\n`;
    summary += `- Operating Income: $${(latestYear.operatingIncome / 1000000000).toFixed(2)} billion (Margin: ${(latestYear.operatingIncomeRatio * 100).toFixed(2)}%)\n`;
    summary += `- Net Income: $${(latestYear.netIncome / 1000000000).toFixed(2)} billion (Margin: ${(latestYear.netIncomeRatio * 100).toFixed(2)}%)\n`;
    summary += `- EPS: $${latestYear.epsdiluted}\n\n`;
  }
  
  // Process balance sheet data
  if (financials.balance && financials.balance.length > 0) {
    const latestBalance = financials.balance[0];
    
    summary += `Balance Sheet (Latest):\n`;
    summary += `- Total Assets: $${(latestBalance.totalAssets / 1000000000).toFixed(2)} billion\n`;
    summary += `- Total Liabilities: $${(latestBalance.totalLiabilities / 1000000000).toFixed(2)} billion\n`;
    summary += `- Total Equity: $${(latestBalance.totalEquity / 1000000000).toFixed(2)} billion\n`;
    summary += `- Cash & Equivalents: $${(latestBalance.cashAndCashEquivalents / 1000000000).toFixed(2)} billion\n`;
    summary += `- Total Debt: $${(latestBalance.totalDebt / 1000000000).toFixed(2)} billion\n\n`;
  }
  
  // Process key ratios if available
  if (financials.ratios && financials.ratios.length > 0) {
    const latestRatios = financials.ratios[0];
    
    summary += `Key Ratios (Latest):\n`;
    if (latestRatios.returnOnEquity) summary += `- ROE: ${(latestRatios.returnOnEquity * 100).toFixed(2)}%\n`;
    if (latestRatios.returnOnAssets) summary += `- ROA: ${(latestRatios.returnOnAssets * 100).toFixed(2)}%\n`;
    if (latestRatios.debtEquityRatio) summary += `- Debt/Equity: ${latestRatios.debtEquityRatio.toFixed(2)}\n`;
    if (latestRatios.currentRatio) summary += `- Current Ratio: ${latestRatios.currentRatio.toFixed(2)}\n`;
    if (latestRatios.dividendYield) summary += `- Dividend Yield: ${(latestRatios.dividendYield * 100).toFixed(2)}%\n`;
  }
  
  return summary;
}
