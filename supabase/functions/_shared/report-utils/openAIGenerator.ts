
import { OPENAI_MODELS, OPENAI_CONFIG } from "../constants.ts";
import { extractJSONFromText } from "../../predict-stock-price/utils.ts";
import { ResearchReport } from "./reportTypes.ts";

/**
 * Generate a research report using OpenAI
 */
export async function generateReportWithOpenAI(
  formattedData: any, 
  reportRequest: any, 
  openAIApiKey: string
): Promise<ResearchReport> {
  try {
    console.log(`Generating report with OpenAI for ${formattedData.symbol} (type: ${reportRequest.reportType || 'standard'})`);
    
    // Determine which model to use (always o3-mini)
    const model = OPENAI_MODELS.DEFAULT;
    
    // Determine reasoning effort based on report type
    let reasoningEffort = OPENAI_CONFIG.REASONING_EFFORT.MEDIUM;
    
    if (reportRequest.reasoningEffort) {
      reasoningEffort = reportRequest.reasoningEffort;
    } else if (reportRequest.reportType === 'comprehensive') {
      reasoningEffort = OPENAI_CONFIG.REASONING_EFFORT.HIGH;
    } else if (reportRequest.reportType === 'quick') {
      reasoningEffort = OPENAI_CONFIG.REASONING_EFFORT.LOW;
    }
    
    // Set parameters based on report type
    const isComprehensive = reportRequest.reportType === 'comprehensive';
    const temperature = isComprehensive ? 
      OPENAI_CONFIG.TEMPERATURE.BALANCED : 
      OPENAI_CONFIG.TEMPERATURE.PRECISE;
    
    // Use more tokens for comprehensive reports
    const maxTokens = isComprehensive ? 3800 : 2800;
    
    console.log(`Using model: ${model}, reasoning effort: ${reasoningEffort}, temperature: ${temperature}`);
    
    // Create a detailed system prompt with better guidance for structured output
    const systemPrompt = `You are a highly skilled equity research analyst with expertise in financial analysis and stock valuation.
Your task is to create a professional research report for ${formattedData.symbol} (${formattedData.companyName}).

REPORT STRUCTURE:
1. Report should include sections like: Executive Summary, Investment Thesis, Business Overview, Industry Analysis, Financial Analysis, Valuation, Risk Factors, and ESG Considerations.
2. Each section should be detailed but concise, with relevant insights.
3. Include specific company data points to support your analysis.
4. For valuation, consider multiple approaches such as DCF, comparable companies, and growth projections.
5. Provide a clear recommendation: Buy, Hold, Sell, Overweight, or Underweight.

CRITICAL GUIDELINES:
- Use precise financial terminology appropriate for professional investors.
- Back assertions with data from the provided financial information.
- Keep analysis balanced and objective, highlighting both strengths and risks.
- Avoid vague statements; be specific about growth rates, margins, and other financial metrics.
- Format the response as a structured JSON object that follows the required output format.

The final output must be a properly formatted JSON object with no markdown formatting.`;

    // Create detailed user prompt with clear instructions for structured JSON output
    const userPrompt = `Please analyze the following data and create a comprehensive research report for ${formattedData.symbol} (${formattedData.companyName}):

COMPANY OVERVIEW:
${JSON.stringify(formattedData.companyProfile, null, 2)}

FINANCIAL DATA:
${JSON.stringify(formattedData.financials, null, 2)}

MARKET DATA:
${JSON.stringify(formattedData.marketData, null, 2)}

NEWS:
${JSON.stringify(formattedData.news?.slice(0, 5), null, 2)}

INDUSTRY & PEERS:
${JSON.stringify(formattedData.industryData, null, 2)}

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT with the following structure:
{
  "symbol": "${formattedData.symbol}",
  "companyName": "${formattedData.companyName}",
  "date": "current date",
  "recommendation": "Buy/Sell/Hold/Overweight/Underweight",
  "targetPrice": "price with $ symbol",
  "summary": "concise executive summary",
  "sections": [
    {
      "title": "section title",
      "content": "detailed section content"
    },
    ...more sections
  ],
  "ratingDetails": {
    "overallRating": "rating",
    "financialStrength": "rating",
    "growthOutlook": "rating",
    "valuationAttractiveness": "rating",
    "competitivePosition": "rating",
    "ratingScale": "explanation of rating scale",
    "ratingJustification": "explanation of ratings"
  },
  "scenarioAnalysis": {
    "bullCase": {
      "price": "price with $ symbol",
      "description": "description",
      "probability": "percentage",
      "drivers": ["driver1", "driver2"]
    },
    "baseCase": {
      "price": "price with $ symbol",
      "description": "description",
      "probability": "percentage",
      "drivers": ["driver1", "driver2"]
    },
    "bearCase": {
      "price": "price with $ symbol",
      "description": "description",
      "probability": "percentage",
      "drivers": ["driver1", "driver2"]
    }
  },
  "catalysts": {
    "positive": ["catalyst1", "catalyst2"],
    "negative": ["risk1", "risk2"],
    "timeline": {
      "shortTerm": ["event1", "event2"],
      "mediumTerm": ["event1", "event2"],
      "longTerm": ["event1", "event2"]
    }
  }
}

Your report should provide ${isComprehensive ? 'comprehensive' : 'concise'} analysis suitable for ${isComprehensive ? 'professional investors' : 'individual investors'}.`;

    // Make the OpenAI API call
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        reasoning_effort: reasoningEffort,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const responseData = await response.json();
    const content = responseData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    try {
      // Parse the JSON response
      const report = JSON.parse(content);
      
      // Ensure the report has the required structure
      if (!report.symbol || !report.companyName || !report.sections) {
        console.warn("Report missing required fields, attempting to extract JSON from text");
        const extractedReport = extractJSONFromText(content);
        if (!extractedReport.symbol || !extractedReport.companyName) {
          throw new Error("Could not extract valid report from OpenAI response");
        }
        return extractedReport;
      }
      
      return report;
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.log("Raw response:", content);
      
      // Try to extract JSON from text as a fallback
      return extractJSONFromText(content);
    }
  } catch (error) {
    console.error("Error generating report with OpenAI:", error);
    throw error;
  }
}
