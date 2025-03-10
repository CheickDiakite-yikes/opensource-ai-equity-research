import { OpenAI } from "https://esm.sh/openai@4.28.0";
import { corsHeaders } from "../_shared/cors.ts";
import { ResearchReport } from "./types.ts";

export async function generateResearchReport(reportRequest: any): Promise<ResearchReport> {
  console.log("Starting report generation for:", reportRequest.symbol);
  console.log("Report type:", reportRequest.reportType);
  
  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable not set");
    }
    
    const openai = new OpenAI({ apiKey });
    
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
      reportType
    } = reportRequest;

    console.log("Data available for report generation:", {
      hasFinancials: !!financials && Object.keys(financials).length > 0,
      financialKeys: financials ? Object.keys(financials) : [],
      hasNews: !!news && news.length > 0,
      newsCount: news?.length || 0,
      hasPeers: !!peers && peers.length > 0,
      peerCount: peers?.length || 0,
      reportFocus: reportType
    });

    const financialSummary = prepareFinancialSummary(financials);
    
    let focusInstructions = "";
    
    if (reportType === "financial") {
      focusInstructions = `
Focus heavily on the financial analysis section. Include detailed analysis of:
- Revenue and profit margins trends
- Balance sheet strength and debt levels
- Cash flow analysis and capital allocation
- Key financial ratios compared to industry benchmarks
- Financial outlook and potential challenges

Make the Financial Analysis section the most comprehensive part of the report.`;
    } else if (reportType === "valuation") {
      focusInstructions = `
Focus heavily on the valuation analysis section. Include detailed analysis of:
- Current market valuation metrics (P/E, EV/EBITDA, P/S, etc.)
- Discounted cash flow analysis
- Relative valuation compared to peers
- Historical valuation ranges
- Fair value estimate with clear justification

Make the Valuation section the most comprehensive part of the report.`;
    } else {
      focusInstructions = `
Provide a balanced analysis across all sections with equal depth and attention.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert equity research analyst providing detailed investment reports.
Generate a comprehensive, professional research report for ${reportRequest.companyName} (${reportRequest.symbol}) in the ${reportRequest.industry} industry.

REPORT FOCUS: ${reportRequest.reportType || 'comprehensive'}

Your report MUST include the following sections with ENHANCED details:

1. Executive Summary (at least 300 words):
- Current market position
- Key competitive advantages
- Major growth drivers
- Primary risk factors
- Forward-looking perspective
- Clear investment thesis
- Specific financial metrics and market performance

2. Scenario Analysis (with detailed probabilities):
Bull Case (25-35% probability):
- Specific price target with clear drivers
- Key catalysts that could drive upside
- Required market conditions
- Timeline for realization

Base Case (40-50% probability):
- Most likely scenario price target
- Core assumptions
- Market conditions
- Expected timeline

Bear Case (20-30% probability):
- Downside price target
- Risk factors
- Challenging conditions
- Mitigation strategies

3. Growth Catalysts & Inhibitors:
- Short-term catalysts (0-6 months)
- Medium-term opportunities (6-18 months)
- Long-term growth drivers (18+ months)
- Specific inhibitors and challenges
- Regulatory considerations
- Market-specific factors

Each section must be detailed and specific to ${reportRequest.companyName}'s current situation and market conditions.`
        },
        {
          role: "user",
          content: `Generate a comprehensive research report for ${reportRequest.companyName} (${reportRequest.symbol}) using the latest market data and financial information provided.

Current Stock Data:
- Price: $${reportRequest.stockData.price.toFixed(2)}
- Market Cap: $${(reportRequest.stockData.marketCap / 1000000000).toFixed(2)}B
${reportRequest.stockData.pe ? `- P/E Ratio: ${reportRequest.stockData.pe.toFixed(2)}` : ''}

Financial Metrics:
${prepareFinancialSummary(reportRequest.financials)}

Recent Market Events:
${reportRequest.news ? reportRequest.news.slice(0, 3).map((n: any) => `- ${n.title}`).join('\n') : 'No recent news available'}

Peer Companies: ${reportRequest.peers ? reportRequest.peers.join(', ') : 'No peer data available'}

Additional Data:
- Report Type: ${reportRequest.reportType}
- Report Date: ${reportRequest.reportDate}
- Sector: ${reportRequest.sector}
- Industry: ${reportRequest.industry}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error("No content received from OpenAI");
    }

    console.log("Received response from OpenAI");
    
    try {
      const reportData = JSON.parse(completion.choices[0].message.content);
      
      if (!reportData.scenarioAnalysis) {
        reportData.scenarioAnalysis = {
          bullCase: {
            price: `$${(reportRequest.stockData.price * 1.15).toFixed(2)}`,
            probability: "30%",
            drivers: [
              "Strong product cycle momentum",
              "Market share gains in key segments",
              "Margin expansion opportunities"
            ]
          },
          baseCase: {
            price: `$${(reportRequest.stockData.price * 1.05).toFixed(2)}`,
            probability: "45%",
            drivers: [
              "Stable market conditions",
              "Continued execution on strategy",
              "Moderate growth in core markets"
            ]
          },
          bearCase: {
            price: `$${(reportRequest.stockData.price * 0.85).toFixed(2)}`,
            probability: "25%",
            drivers: [
              "Competitive pressures intensifying",
              "Margin compression risks",
              "Macroeconomic headwinds"
            ]
          }
        };
      }

      const requiredSections = ["Investment Thesis", "Business Overview", "Financial Analysis", "Valuation", "Risk Factors", "ESG Considerations"];
      let missingSecions = [];
      
      for (const requiredSection of requiredSections) {
        if (!reportData.sections || !reportData.sections.some(s => s.title.includes(requiredSection))) {
          missingSecions.push(requiredSection);
        }
      }
      
      if (missingSecions.length > 0) {
        console.warn(`Report missing sections: ${missingSecions.join(", ")}`);
        
        if (!reportData.sections) {
          reportData.sections = [];
        }
        
        for (const missingSection of missingSecions) {
          reportData.sections.push({
            title: missingSection,
            content: `This section on ${missingSection.toLowerCase()} was not generated properly. Please regenerate the report or try a different report focus.`
          });
        }
      }
      
      if (!reportData.ratingDetails) {
        reportData.ratingDetails = {
          overallRating: "Neutral",
          financialStrength: "Average",
          growthOutlook: "Moderate",
          valuationAttractiveness: "Fair",
          competitivePosition: "Average"
        };
      }
      
      if (!reportData.catalysts) {
        reportData.catalysts = {
          positive: ["Product innovation", "Market expansion"],
          negative: ["Competitive pressure", "Regulatory challenges"]
        };
      }

      return reportData as ResearchReport;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response content:", completion.choices[0].message.content);
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
    }
  } catch (error) {
    console.error("Error in generateResearchReport:", error);
    throw new Error(`Failed to generate report: ${error.message}`);
  }
}

function prepareFinancialSummary(financials: any): string {
  if (!financials) return "No financial data available.";
  
  let summary = "";
  
  if (financials.income?.[0]) {
    const latest = financials.income[0];
    summary += `Revenue: $${(latest.revenue / 1e9).toFixed(2)}B\n`;
    summary += `Net Income: $${(latest.netIncome / 1e9).toFixed(2)}B\n`;
    summary += `Operating Margin: ${(latest.operatingIncomeRatio * 100).toFixed(2)}%\n`;
  }
  
  if (financials.balance?.[0]) {
    const latest = financials.balance[0];
    summary += `Total Assets: $${(latest.totalAssets / 1e9).toFixed(2)}B\n`;
    summary += `Total Debt: $${(latest.totalDebt / 1e9).toFixed(2)}B\n`;
  }
  
  if (financials.ratios?.[0]) {
    const latest = financials.ratios[0];
    summary += `ROE: ${(latest.returnOnEquity * 100).toFixed(2)}%\n`;
    summary += `Current Ratio: ${latest.currentRatio?.toFixed(2)}\n`;
  }
  
  return summary;
}
