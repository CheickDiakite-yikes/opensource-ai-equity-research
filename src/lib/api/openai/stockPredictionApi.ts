
/**
 * OpenAI API for stock price prediction
 */

import { toast } from "sonner";
import { StockPrediction, StockQuote } from "@/types";
import { callOpenAI, formatFinancialsForPrompt } from "./apiUtils";

/**
 * Generate AI-based stock prediction
 */
export async function generateStockPrediction(
  symbol: string,
  companyName: string,
  quote: StockQuote,
  income: any[],
  ratios: any[],
  news: string[]
): Promise<StockPrediction> {
  try {
    const financialSummary = formatFinancialsForPrompt(income, ratios);
    
    // Build system prompt
    const systemPrompt = `You are an advanced AI stock analyst that specializes in stock price prediction and analysis.
Your task is to predict future stock prices based on financial data, recent news, and market trends.
You should provide a structured analysis with:
1. Price targets for different time horizons (1 month, 3 months, 6 months, 1 year)
2. A sentiment analysis of recent news and market conditions
3. Confidence level in your prediction (0-100%)
4. Key drivers that could affect the stock price
5. Major risks to be aware of

Be precise and data-driven in your analysis. Your output must be structured in JSON format.`;

    // Build user prompt with company data
    const userPrompt = `Generate a stock price prediction analysis for:
    
Company: ${companyName} (${symbol})
Current Price: $${quote.price}
52-Week Range: $${quote.yearLow} - $${quote.yearHigh}
Market Cap: ${formatFinancialsForPrompt(
      income, 
      ratios
    )}
P/E Ratio: ${quote.pe ? quote.pe.toFixed(2) : 'N/A'}

${financialSummary}

Recent News Headlines:
${news.join('\n')}

Based on this information, predict the stock price for different time horizons and provide a comprehensive analysis. Return your response as a JSON object with the following structure:

{
  "predictedPrice": {
    "oneMonth": number,
    "threeMonths": number,
    "sixMonths": number,
    "oneYear": number
  },
  "sentimentAnalysis": string,
  "confidenceLevel": number,
  "keyDrivers": [string, string, string],
  "risks": [string, string, string]
}`;

    // Call OpenAI API with reasoning effort instead of temperature
    const completion = await callOpenAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], "medium", 500); // Using medium reasoning effort for prediction

    // Parse JSON response
    const resultText = completion.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse OpenAI response as JSON");
    }
    
    const predictionData = JSON.parse(jsonMatch[0]);
    
    // Return structured prediction
    return {
      symbol,
      currentPrice: quote.price,
      predictedPrice: predictionData.predictedPrice,
      sentimentAnalysis: predictionData.sentimentAnalysis,
      confidenceLevel: predictionData.confidenceLevel,
      keyDrivers: predictionData.keyDrivers,
      risks: predictionData.risks
    };
  } catch (error) {
    console.error("Error generating stock prediction:", error);
    toast.error("Failed to generate stock prediction");
    
    // Return a default prediction object in case of error
    return {
      symbol,
      currentPrice: quote.price,
      predictedPrice: {
        oneMonth: quote.price,
        threeMonths: quote.price,
        sixMonths: quote.price,
        oneYear: quote.price
      },
      sentimentAnalysis: "Error generating prediction",
      confidenceLevel: 0,
      keyDrivers: ["Unable to determine"],
      risks: ["Unable to determine"]
    };
  }
}
