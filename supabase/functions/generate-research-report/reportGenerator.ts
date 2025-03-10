
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
      peerCount: peers?.length || 0,
      reportFocus: reportType
    });

    // Prepare financial summary for the prompt
    const financialSummary = prepareFinancialSummary(financials);
    
    // Define focus-specific instructions based on reportType
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
      // Default to comprehensive analysis
      focusInstructions = `
Provide a balanced analysis across all sections with equal depth and attention.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert equity research analyst providing detailed investment reports.
Generate a comprehensive, professional research report for ${companyName} (${symbol}) in the ${industry} industry.

REPORT FOCUS: ${reportType || 'comprehensive'}

${focusInstructions}

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
  },
  "scenarioAnalysis": {
    "bullCase": {
      "price": "$XX.XX",
      "description": "Bull case scenario description"
    },
    "baseCase": {
      "price": "$XX.XX",
      "description": "Base case scenario description"
    },
    "bearCase": {
      "price": "$XX.XX",
      "description": "Bear case scenario description"
    }
  },
  "catalysts": {
    "positive": ["Positive catalyst 1", "Positive catalyst 2"],
    "negative": ["Negative catalyst 1", "Negative catalyst 2"]
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

    console.log("Received response from OpenAI");
    
    try {
      const reportData = JSON.parse(completion.choices[0].message.content);
      console.log("Generated report data:", {
        sections: reportData.sections?.map((s: any) => s.title),
        hasRatingDetails: !!reportData.ratingDetails,
        recommendation: reportData.recommendation,
        hasSections: reportData.sections?.length > 0
      });
      
      // Validation to ensure all required sections exist
      const requiredSections = ["Investment Thesis", "Business Overview", "Financial Analysis", "Valuation", "Risk Factors", "ESG Considerations"];
      let missingSecions = [];
      
      for (const requiredSection of requiredSections) {
        if (!reportData.sections || !reportData.sections.some(s => s.title.includes(requiredSection))) {
          missingSecions.push(requiredSection);
        }
      }
      
      if (missingSecions.length > 0) {
        console.warn(`Report missing sections: ${missingSecions.join(", ")}`);
        
        // Add missing sections with placeholder content
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
      
      // Ensure required properties exist
      if (!reportData.ratingDetails) {
        reportData.ratingDetails = {
          overallRating: "Neutral",
          financialStrength: "Average",
          growthOutlook: "Moderate",
          valuationAttractiveness: "Fair",
          competitivePosition: "Average"
        };
      }
      
      if (!reportData.scenarioAnalysis) {
        const basePrice = parseFloat(stockData.price);
        reportData.scenarioAnalysis = {
          bullCase: {
            price: `$${(basePrice * 1.2).toFixed(2)}`,
            description: "Optimistic growth scenario based on positive market conditions."
          },
          baseCase: {
            price: `$${(basePrice * 1.05).toFixed(2)}`,
            description: "Expected scenario based on current market trends."
          },
          bearCase: {
            price: `$${(basePrice * 0.85).toFixed(2)}`,
            description: "Pessimistic scenario considering market risks."
          }
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
