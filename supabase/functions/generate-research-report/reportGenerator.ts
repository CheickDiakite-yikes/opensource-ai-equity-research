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
- Revenue and profit margins trends with YoY growth rates
- Balance sheet strength and debt levels with key ratios
- Cash flow analysis and capital allocation effectiveness
- Working capital management and efficiency metrics
- Financial outlook and forward-looking metrics

Make the Financial Analysis section the most comprehensive part of the report.`;
    } else if (reportType === "valuation") {
      focusInstructions = `
Focus heavily on the valuation analysis section. Include detailed analysis of:
- Current market valuation metrics (P/E, EV/EBITDA, P/S etc.)
- Discounted cash flow analysis with key assumptions
- Relative valuation compared to peers with multiple comparisons
- Historical valuation ranges and mean reversion potential
- Fair value estimate with clear justification and sensitivity analysis

Make the Valuation section the most comprehensive part of the report.`;
    } else {
      focusInstructions = `
Provide a balanced analysis across all sections with enhanced focus on:
- Executive summary with clear investment thesis
- Business model analysis and competitive advantages
- Financial health and growth drivers
- Valuation and price targets
- Risk factors and ESG considerations`;
    }

    const scenarioInstructions = `
The scenario analysis section must include:
- Bull case: Aggressive but realistic upside case (25-30% probability)
  • Specific price target with clear drivers
  • Required market conditions
  • Growth catalysts and timeline
  • Margin expansion potential
  • Multiple re-rating factors
  
- Base case: Most likely scenario (45-50% probability)
  • Conservative price target based on current trends
  • Core assumptions clearly stated
  • Market conditions expected
  • Growth trajectory
  • Competitive position maintenance
  
- Bear case: Downside risk scenario (20-25% probability)
  • Lower bound price target
  • Risk factors that could materialize
  • Market headwinds considered
  • Margin compression scenarios
  • Competitive threats`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert equity research analyst specializing in detailed, data-driven investment reports. Output a JSON report following this exact response format for a professional equity research report on ${companyName} (${symbol}). The report MUST include the following sections with enhanced details:

Executive Summary (minimum 500 words):
- Clear and compelling investment thesis
- Key competitive advantages quantified
- Growth drivers with market size
- Risk factors with mitigation strategies
- Clear link to price target and recommendation
- Forward-looking perspective with timeline
- Key performance metrics and financial highlights

${focusInstructions}

${scenarioInstructions}

Growth Catalysts section must organize catalysts by:
- Short-term (0-6 months): Immediate impact events
- Medium-term (6-18 months): Strategic initiatives
- Long-term (18+ months): Market and product expansion
- Include probability and potential impact for each

Output format: Return ONLY a JSON object matching the ResearchReport interface structure with each section fully populated. Start your response with the opening curly brace {`
        },
        {
          role: "user",
          content: `Generate a professional equity research report in JSON format for ${symbol} using this data:

Current Market Data:
- Price: $${stockData.price}
- Market Cap: $${(stockData.marketCap / 1e9).toFixed(2)}B
- P/E Ratio: ${stockData.pe || 'N/A'}

Financial Summary:
${financialSummary}

Sector: ${sector}
Industry: ${industry}
Business Description: ${description}

Recent Company News:
${news ? news.slice(0, 3).map((n: any) => `- ${n.title}`).join('\n') : 'No recent news available'}

Peer Companies: ${peers ? peers.join(', ') : 'No peer data available'}

Additional Context:
- Report Type: ${reportType}
- Report Date: ${new Date().toISOString().split('T')[0]}

Return the analysis as a complete JSON object matching the ResearchReport interface.`
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
      console.log("Successfully parsed JSON response");
      
      return {
        ...reportData,
        date: new Date().toISOString().split('T')[0]
      };
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", completion.choices[0].message.content);
      throw new Error("Failed to parse OpenAI response");
    }
  } catch (error) {
    console.error("Error in generateResearchReport:", error);
    throw error;
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
