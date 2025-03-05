
import { StockPrediction, FormattedData } from "./types.ts";
import { generateDefaultSentiment, generateDefaultDrivers, generateDefaultRisks, createFallbackPrediction } from "./fallbackGenerator.ts";

export async function generatePredictionWithOpenAI(data: FormattedData): Promise<StockPrediction> {
  const systemPrompt = `You are a financial analyst specializing in stock price predictions. 
Your task is to analyze the provided financial and market data for ${data.symbol} and generate 
a detailed price prediction for different time horizons: 1 month, 3 months, 6 months, and 1 year.

Your analysis should include:
1. A justification for each predicted price based on financial data and trends
2. A sentiment analysis of the company's prospects
3. A confidence level for your prediction (0-100%)
4. Key drivers that could positively impact the stock price
5. Potential risks that could negatively impact the stock price

Base your predictions on:
- Financial performance and growth trends
- Technical indicators and price action
- Market sentiment from news articles
- Industry and sector dynamics

Your response should be structured as a JSON object matching the StockPrediction interface.`;

  const userPrompt = `Please analyze this data and provide a stock price prediction:

SYMBOL: ${data.symbol}
CURRENT PRICE: $${data.currentPrice}

FINANCIAL DATA:
${JSON.stringify(data.financialSummary, null, 2)}

TECHNICAL INDICATORS:
${JSON.stringify(data.technicalIndicators, null, 2)}

RECENT NEWS:
${JSON.stringify(data.newsSummary, null, 2)}

Based on this data, please provide:
1. Price predictions for 1 month, 3 months, 6 months, and 1 year
2. Sentiment analysis summary
3. Confidence level (0-100%)
4. 3-5 key drivers that could positively impact the stock
5. 3-5 potential risks that could negatively impact the stock

Please ensure your price predictions are realistic based on the data provided and current market conditions.`;

  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    const quickMode = data.quickMode === true;
    
    // Use mini model for all predictions on the featured companies dashboard for faster loading
    // This helps prevent timeouts while still providing reasonable predictions
    const modelToUse = "gpt-4o-mini";
    
    // Reduce tokens for quicker responses on featured companies dashboard
    const maxTokens = quickMode ? 800 : 1200; 
    
    // Slightly higher temperature for quick mode to compensate for fewer tokens
    const temperature = quickMode ? 0.5 : 0.3;
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: temperature,
        max_tokens: maxTokens
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

    try {
      const predictionData = extractJSONFromText(content);
      
      const prediction: StockPrediction = {
        symbol: data.symbol,
        currentPrice: data.currentPrice,
        predictedPrice: {
          oneMonth: ensureNumberValue(predictionData.predictedPrice?.oneMonth, data.currentPrice * 1.01),
          threeMonths: ensureNumberValue(predictionData.predictedPrice?.threeMonths, data.currentPrice * 1.03),
          sixMonths: ensureNumberValue(predictionData.predictedPrice?.sixMonths, data.currentPrice * 1.05),
          oneYear: ensureNumberValue(predictionData.predictedPrice?.oneYear, data.currentPrice * 1.08)
        },
        sentimentAnalysis: predictionData.sentimentAnalysis || generateDefaultSentiment(data),
        confidenceLevel: ensureNumberInRange(predictionData.confidenceLevel, 65, 90),
        keyDrivers: ensureArrayWithItems(predictionData.keyDrivers, generateDefaultDrivers()),
        risks: ensureArrayWithItems(predictionData.risks, generateDefaultRisks())
      };
      
      return prediction;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", content);
      
      return createFallbackPrediction(data);
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return createFallbackPrediction(data);
  }
}

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

export function ensureNumberValue(value: any, defaultValue: number): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  return defaultValue;
}

export function ensureNumberInRange(value: any, min: number, max: number): number {
  const num = Number(value);
  if (isNaN(num)) return (min + max) / 2;
  return Math.min(Math.max(num, min), max);
}

export function ensureArrayWithItems(array: any, defaultArray: string[]): string[] {
  if (Array.isArray(array) && array.length > 0) {
    return array;
  }
  return defaultArray;
}
