
import { OpenAI } from "https://esm.sh/openai@4.28.0";
import { corsHeaders } from "../_shared/cors.ts";
import { ResearchReport } from "./types.ts";

export async function generateResearchReport(reportRequest: any): Promise<ResearchReport> {
  console.log("Starting report generation for:", reportRequest.symbol);
  
  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable not set");
    }
    
    const openai = new OpenAI({ apiKey });
    
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
      reportType
    } = reportRequest;

    console.log("Data available for report generation:", {
      hasFinancials: !!financials && Object.keys(financials).length > 0,
      financialKeys: financials ? Object.keys(financials) : [],
      hasNews: !!news && news.length > 0,
      newsCount: news?.length || 0,
      hasPeers: !!peers && peers.length > 0,
      peerCount: peers?.length || 0
    });

    // Prepare financial summary for the prompt
    const financialSummary = prepareFinancialSummary(financials);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert equity research analyst providing detailed investment reports.
Generate a comprehensive, professional research report for ${companyName} (${symbol}) in the ${industry} industry.

Your report MUST include ALL of the following sections, each with detailed content:
1. Investment Thesis
2. Business Overview
3. Financial Analysis
4. Valuation
5. Risk Factors
6. ESG Considerations

Each section should be at least 200 words long with detailed, specific analysis.
Include specific numbers, ratios, and comparisons where relevant.
Base your analysis on the provided financial data, news, and market information.

IMPORTANT: Return the report as a JSON object with the following structure:
{
  "symbol": "${symbol}",
  "companyName": "${companyName}",
  "date": "YYYY-MM-DD",
  "recommendation": "Buy/Hold/Sell",
  "targetPrice": "$XX.XX",
  "summary": "Brief executive summary",
  "sections": [
    { "title": "Section Title", "content": "Detailed analysis..." }
  ],
  "ratingDetails": {
    "overallRating": "Strong/Neutral/Weak",
    "financialStrength": "Strong/Average/Weak",
    "growthOutlook": "Strong/Moderate/Limited",
    "valuationAttractiveness": "Attractive/Fair/Expensive",
    "competitivePosition": "Strong/Average/Weak"
  }
}`
        },
        {
          role: "user",
          content: `Generate a ${reportType || 'comprehensive'} research report for ${companyName} (${symbol}).

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

${peers && peers.length > 0 ? `Peer Companies: ${peers.join(', ')}` : ''}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error("No content received from OpenAI");
    }

    const reportData = JSON.parse(completion.choices[0].message.content);
    console.log("Generated report data:", {
      sections: reportData.sections?.map((s: any) => s.title),
      hasRatingDetails: !!reportData.ratingDetails,
      recommendation: reportData.recommendation
    });

    return reportData as ResearchReport;
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
