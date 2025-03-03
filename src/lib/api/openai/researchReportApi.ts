
/**
 * OpenAI API for research report generation
 */

import { toast } from "sonner";
import { ResearchReport, ResearchReportSection, ReportRequest } from "@/types";
import { callOpenAI, formatFinancialsForPrompt } from "./apiUtils";

/**
 * Generate a comprehensive research report for a company
 */
export async function generateResearchReport(reportRequest: ReportRequest): Promise<ResearchReport> {
  try {
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

    // Format financial data for the prompt
    const financialSummary = formatFinancialsForPrompt(
      financials.income,
      financials.ratios
    );

    // Build system prompt
    const systemPrompt = `You are an expert financial analyst specializing in equity research reports.
Your task is to create a comprehensive ${reportType} research report for ${companyName} (${symbol}).
Use all available financial data, market information, and company details.
Structure the report professionally with clear sections.
For each insight, provide specific data points and analysis.
The report should be data-driven and based on factual information.
Include a clear recommendation (Buy, Hold, Sell) with a price target.
Format your response as a JSON object with specific sections.`;

    // Build user prompt with all financial data
    const userPrompt = `Generate a professional ${reportType} research report for:

Company: ${companyName} (${symbol})
Sector: ${sector}
Industry: ${industry}
Current Price: $${stockData.price}
Description: ${description}

Key Financial Metrics:
${financialSummary}

Recent News:
${news.map((item) => `- ${item.title}`).join("\n")}

Peer Companies: ${peers.join(", ")}

Required sections:
1. Executive Summary
2. Company Overview
3. Financial Analysis
4. Valuation Analysis
5. Risk Factors
6. Investment Thesis
7. Price Target & Recommendation

Include a scenario analysis with bull, base, and bear cases.
Format the response as a structured JSON object with the following format:

{
  "companyName": "${companyName}",
  "symbol": "${symbol}",
  "reportDate": "current date",
  "summary": "brief executive summary",
  "rating": "Buy/Hold/Sell rating",
  "targetPrice": number,
  "currentPrice": number,
  "upside": number,
  "sections": [
    {
      "title": "section title",
      "content": "detailed content",
      "type": "section type",
      "insights": ["key insight 1", "key insight 2"]
    }
  ],
  "scenarioAnalysis": {
    "bullCase": {
      "price": number,
      "probability": number,
      "drivers": ["driver 1", "driver 2"]
    },
    "baseCase": {
      "price": number,
      "probability": number,
      "drivers": ["driver 1", "driver 2"]
    },
    "bearCase": {
      "price": number,
      "probability": number,
      "drivers": ["driver 1", "driver 2"]
    }
  },
  "disclaimer": "standard disclaimer text",
  "date": "current date",
  "recommendation": "Buy/Hold/Sell with justification"
}`;

    // Call OpenAI API
    const completion = await callOpenAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      0.7
    );

    // Parse JSON response
    const resultText = completion.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse OpenAI response as JSON");
    }
    
    const reportData = JSON.parse(jsonMatch[0]);
    
    // Ensure all required properties are present and of the correct type
    const targetPrice = typeof reportData.targetPrice === 'string' ? 
      parseFloat(reportData.targetPrice) : reportData.targetPrice;
      
    const currentPrice = typeof reportData.currentPrice === 'string' ? 
      parseFloat(reportData.currentPrice) : reportData.currentPrice;
      
    const upside = typeof reportData.upside === 'string' ? 
      parseFloat(reportData.upside) : reportData.upside;

    // Ensure sections have all required properties
    const sections = reportData.sections.map((section: any) => {
      return {
        title: section.title,
        content: section.content,
        type: section.type || "standard",
        insights: section.insights || []
      } as ResearchReportSection;
    });
    
    // Process scenario analysis to ensure proper types
    const scenarioAnalysis = reportData.scenarioAnalysis ? {
      bullCase: {
        price: typeof reportData.scenarioAnalysis.bullCase.price === 'string' ? 
          parseFloat(reportData.scenarioAnalysis.bullCase.price) : 
          reportData.scenarioAnalysis.bullCase.price,
        probability: typeof reportData.scenarioAnalysis.bullCase.probability === 'string' ? 
          parseFloat(reportData.scenarioAnalysis.bullCase.probability) : 
          reportData.scenarioAnalysis.bullCase.probability,
        drivers: reportData.scenarioAnalysis.bullCase.drivers
      },
      baseCase: {
        price: typeof reportData.scenarioAnalysis.baseCase.price === 'string' ? 
          parseFloat(reportData.scenarioAnalysis.baseCase.price) : 
          reportData.scenarioAnalysis.baseCase.price,
        probability: typeof reportData.scenarioAnalysis.baseCase.probability === 'string' ? 
          parseFloat(reportData.scenarioAnalysis.baseCase.probability) : 
          reportData.scenarioAnalysis.baseCase.probability,
        drivers: reportData.scenarioAnalysis.baseCase.drivers
      },
      bearCase: {
        price: typeof reportData.scenarioAnalysis.bearCase.price === 'string' ? 
          parseFloat(reportData.scenarioAnalysis.bearCase.price) : 
          reportData.scenarioAnalysis.bearCase.price,
        probability: typeof reportData.scenarioAnalysis.bearCase.probability === 'string' ? 
          parseFloat(reportData.scenarioAnalysis.bearCase.probability) : 
          reportData.scenarioAnalysis.bearCase.probability,
        drivers: reportData.scenarioAnalysis.bearCase.drivers
      }
    } : undefined;
    
    // Return structured report
    return {
      id: reportData.id,
      companyName: reportData.companyName,
      symbol: reportData.symbol,
      reportDate: reportData.reportDate,
      summary: reportData.summary,
      rating: reportData.rating,
      targetPrice: targetPrice,
      currentPrice: currentPrice,
      upside: upside,
      sections: sections,
      disclaimer: reportData.disclaimer,
      analysts: reportData.analysts,
      date: reportData.date || new Date().toISOString().split('T')[0],
      recommendation: reportData.recommendation || reportData.rating,
      ratingDetails: reportData.ratingDetails,
      scenarioAnalysis: scenarioAnalysis,
      catalysts: reportData.catalysts
    };
  } catch (error) {
    console.error("Error generating research report:", error);
    toast.error("Failed to generate research report");
    throw error;
  }
}
