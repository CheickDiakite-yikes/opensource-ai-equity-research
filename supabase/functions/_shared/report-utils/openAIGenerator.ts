
import { ResearchReport } from "./reportTypes";
import { formatLargeNumber } from "./dataFormatter";
import { createFallbackReport, ensureCompleteReportStructure, createDefaultSections, enhanceSectionContent } from "./fallbackReportGenerator";
import { API_BASE_URLS, OPENAI_MODELS } from "../constants.ts";

// Extract JSON from text response (handles when GPT wraps JSON in markdown code blocks)
export function extractJSONFromText(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    // Continue to next attempt
  }
  
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", e);
    }
  }
  
  const possibleJson = text.match(/\{[\s\S]*\}/);
  if (possibleJson) {
    try {
      return JSON.parse(possibleJson[0]);
    } catch (e) {
      console.error("Failed to parse possible JSON:", e);
    }
  }
  
  throw new Error("Could not extract valid JSON from response");
}

// Generate report using OpenAI
export async function generateReportWithOpenAI(data: any, reportRequest: any, openAIApiKey: string) {
  const { reportType, symbol, companyName } = reportRequest;
  
  const systemPrompt = `You are an expert financial analyst tasked with creating a detailed, professional equity research report for ${companyName} (${symbol}). 
Your report should meet the standards of major investment banks and research firms, with thorough analysis and substantial content in each section.

Based on the report type "${reportType}", emphasize:
${reportType === 'comprehensive' ? '- A balanced, in-depth analysis of all aspects including financials, growth, valuation, and risks, with detailed metrics and industry comparisons.' : ''}
${reportType === 'financial' ? '- Deep financial analysis with extensive ratio analysis, cash flow sustainability assessment, balance sheet strength, and capital structure evaluation.' : ''}
${reportType === 'valuation' ? '- Detailed valuation using multiple methodologies (DCF, multiples) with sensitivity analysis, fair value derivation, and comprehensive target price justification.' : ''}

Structure your report with these detailed sections:
1. Investment Thesis - Key reasons for the recommendation (at least 300 words)
2. Business Overview - Comprehensive company overview including business model, segments, competitive landscape (at least 300 words)
3. Financial Analysis - In-depth assessment of financial performance with multiple metrics and trends (at least 400 words)
4. Valuation - Thorough analysis using multiple methods with detailed justification (at least 300 words)
5. Risk Factors - Comprehensive risk assessment categorized by type (at least 300 words)
6. ESG Considerations - Detailed analysis of environmental, social, and governance factors (at least 200 words)

Your report MUST include:
- Clear, professional recommendation (Strong Buy, Buy, Hold, Sell, or Strong Sell)
- Well-justified target price with methodology explanation
- Detailed executive summary that captures all key points
- Data-driven analysis in each section with specific metrics, figures, and industry comparisons
- Rating details covering multiple business aspects
- Scenario analysis with bull, base, and bear cases
- Comprehensive growth catalysts and inhibitors
- Each section MUST have extensive, professional content; this is CRITICALLY important

Output in JSON format exactly matching the ResearchReport interface with all required fields and detailed content in each section.`;

  const userPrompt = `Create a professional, detailed equity research report for:

COMPANY INFORMATION:
Symbol: ${data.symbol}
Name: ${data.companyName}
Industry: ${data.industry}
Sector: ${data.sector}
Description: ${data.description}
Current Price: $${data.currentPrice}
Market Cap: $${formatLargeNumber(data.marketCap)}
P/E Ratio: ${data.pe}

FINANCIAL HIGHLIGHTS:
${JSON.stringify(data.financialSummary, null, 2)}

RECENT NEWS:
${JSON.stringify(data.newsSummary, null, 2)}

PEER COMPANIES:
${data.peers?.join(", ") || "Major industry competitors"}

Create a comprehensive, professional research report including:
1. Clear investment recommendation with thorough justification
2. Well-supported target price based on fundamental analysis
3. Detailed executive summary covering all key points
4. Extensive analysis in each required section (at least 300-400 words per section)
5. Comprehensive rating details across multiple business aspects
6. Detailed scenario analysis with price targets and probabilities
7. Thorough growth catalysts and risks assessment with timeline

Your report should match the quality and depth of professional equity research from major investment banks.`;

  try {
    console.log("Sending request to OpenAI for professional research report generation...");
    
    const response = await fetch(API_BASE_URLS.OPENAI + "/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODELS.DEFAULT,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API error:", responseData);
      throw new Error(`OpenAI API error: ${responseData.error?.message || "Unknown error"}`);
    }

    const content = responseData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    console.log("Received response from OpenAI, processing...");

    try {
      const reportData = extractJSONFromText(content);
      
      console.log("Extracted JSON from OpenAI response, validating report structure...");
      console.log("Report has sections:", reportData.sections?.length || 0);
      
      const finalReport: ResearchReport = {
        symbol: data.symbol,
        companyName: data.companyName,
        date: new Date().toISOString().split('T')[0],
        recommendation: reportData.recommendation || "Hold",
        targetPrice: reportData.targetPrice || `$${(data.currentPrice * 1.1).toFixed(2)}`,
        summary: reportData.summary || reportData.executive_summary || "",
        sections: reportData.sections && reportData.sections.length > 0 
          ? reportData.sections.map(section => ({
              title: section.title || "Analysis",
              content: section.content || "Content unavailable"
            }))
          : createDefaultSections(data),
        
        ratingDetails: reportData.ratingDetails ? {
          overallRating: reportData.ratingDetails.overallRating || "Neutral",
          financialStrength: reportData.ratingDetails.financialStrength || "Adequate",
          growthOutlook: reportData.ratingDetails.growthOutlook || "Stable",
          valuationAttractiveness: reportData.ratingDetails.valuationAttractiveness || "Fair",
          competitivePosition: reportData.ratingDetails.competitivePosition || "Average",
          ratingScale: reportData.ratingDetails.ratingScale || "1-5 scale (5 is highest)",
          ratingJustification: reportData.ratingDetails.ratingJustification || ""
        } : undefined,
        
        scenarioAnalysis: reportData.scenarioAnalysis ? {
          bullCase: {
            price: reportData.scenarioAnalysis.bullCase?.price || `$${(data.currentPrice * 1.2).toFixed(2)}`,
            description: reportData.scenarioAnalysis.bullCase?.description || "Optimistic scenario",
            probability: reportData.scenarioAnalysis.bullCase?.probability || "25%",
            drivers: reportData.scenarioAnalysis.bullCase?.drivers || []
          },
          baseCase: {
            price: reportData.scenarioAnalysis.baseCase?.price || `$${(data.currentPrice * 1.05).toFixed(2)}`,
            description: reportData.scenarioAnalysis.baseCase?.description || "Most likely scenario",
            probability: reportData.scenarioAnalysis.baseCase?.probability || "50%",
            drivers: reportData.scenarioAnalysis.baseCase?.drivers || []
          },
          bearCase: {
            price: reportData.scenarioAnalysis.bearCase?.price || `$${(data.currentPrice * 0.9).toFixed(2)}`,
            description: reportData.scenarioAnalysis.bearCase?.description || "Pessimistic scenario",
            probability: reportData.scenarioAnalysis.bearCase?.probability || "25%",
            drivers: reportData.scenarioAnalysis.bearCase?.drivers || []
          }
        } : undefined,
        
        catalysts: reportData.catalysts ? {
          positive: reportData.catalysts.positive || [],
          negative: reportData.catalysts.negative || [],
          timeline: reportData.catalysts.timeline ? {
            shortTerm: reportData.catalysts.timeline.shortTerm || [],
            mediumTerm: reportData.catalysts.timeline.mediumTerm || [],
            longTerm: reportData.catalysts.timeline.longTerm || []
          } : undefined
        } : undefined
      };
      
      return finalReport;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", content);
      
      return createFallbackReport(data);
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return createFallbackReport(data);
  }
}
