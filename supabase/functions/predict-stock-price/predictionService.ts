
import { StockPrediction, FormattedData } from "./types.ts";
import { generateDefaultSentiment, generateDefaultDrivers, generateDefaultRisks, createFallbackPrediction } from "./fallbackGenerator.ts";

export async function generatePredictionWithOpenAI(data: FormattedData): Promise<StockPrediction> {
  const systemPrompt = `You are a financial analyst specializing in stock price predictions. 
Your task is to analyze the provided financial and market data for ${data.symbol} and generate 
a detailed price prediction for different time horizons: 1 month, 3 months, 6 months, and 1 year.

IMPORTANT INSTRUCTIONS:
1. Be realistic with your predictions - they should vary based on the company's financials, industry, and market position
2. Each stock should have DIFFERENT growth percentages - avoid using the same growth rate across all companies
3. Strong financial performers may deserve higher growth projections, while others may deserve more conservative estimates
4. Consider the specific industry dynamics for this stock - some industries grow faster than others
5. Technical indicators should influence your short-term projections
6. News sentiment should be factored into your analysis
7. Predictions must be data-driven and justified by the information provided

Base your predictions on:
- Financial performance and growth trends
- Technical indicators and price action
- Market sentiment from news articles
- Industry and sector dynamics

Your response should be structured as a JSON object matching the StockPrediction interface.`;

  const userPrompt = `Please analyze this data and provide a stock price prediction:

SYMBOL: ${data.symbol}
CURRENT PRICE: $${data.currentPrice.toFixed(2)}

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

IMPORTANT: Your predictions must be unique to this company and should NOT follow a standard growth pattern (like all 12% growth). 
Different companies should have different growth trajectories based on their specific data.`;

  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    const quickMode = data.quickMode === true;
    
    // For featured companies dashboard use gpt-4o-mini for faster performance
    // For detailed reports use the more powerful model
    const modelToUse = quickMode ? "gpt-4o-mini" : "gpt-4o-mini";
    
    // Reduce tokens for featured companies for speed
    const maxTokens = quickMode ? 1000 : 1500; 
    
    // Higher temperature produces more varied predictions
    const temperature = 0.7;
    
    console.log(`Generating prediction for ${data.symbol} using ${modelToUse} model (quickMode: ${quickMode})`);
    
    // If the quick mode is enabled and we have very limited financial data,
    // use the enhanced fallback predictions to avoid API call
    if (quickMode && (!data.financialSummary || Object.keys(data.financialSummary).length === 0)) {
      console.log(`Using enhanced fallback prediction for ${data.symbol} due to limited financial data`);
      return createFallbackPrediction(data);
    }
    
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
      console.log("Falling back to enhanced fallback prediction generator");
      return createFallbackPrediction(data);
    }

    const content = responseData.choices?.[0]?.message?.content;
    
    if (!content) {
      console.log("No content in OpenAI response, using enhanced fallback prediction");
      return createFallbackPrediction(data);
    }

    try {
      const predictionData = extractJSONFromText(content);
      
      // Ensure prediction values make sense and aren't too extreme
      // For one year, we'll allow from -20% to +50% change max
      const currentPrice = data.currentPrice;
      const minOneYearPrice = currentPrice * 0.8; // -20% minimum
      const maxOneYearPrice = currentPrice * 1.5; // +50% maximum
      
      // For shorter periods, constrain the ranges further
      const minOneMonthPrice = currentPrice * 0.95; // -5% minimum
      const maxOneMonthPrice = currentPrice * 1.1;  // +10% maximum
      
      const minThreeMonthPrice = currentPrice * 0.9; // -10% minimum
      const maxThreeMonthPrice = currentPrice * 1.2; // +20% maximum
      
      const minSixMonthPrice = currentPrice * 0.85; // -15% minimum
      const maxSixMonthPrice = currentPrice * 1.3;  // +30% maximum
      
      const oneMonthPredicted = constrainValue(predictionData.predictedPrice?.oneMonth, currentPrice, minOneMonthPrice, maxOneMonthPrice);
      const threeMonthsPredicted = constrainValue(predictionData.predictedPrice?.threeMonths, currentPrice, minThreeMonthPrice, maxThreeMonthPrice);
      const sixMonthsPredicted = constrainValue(predictionData.predictedPrice?.sixMonths, currentPrice, minSixMonthPrice, maxSixMonthPrice);
      const oneYearPredicted = constrainValue(predictionData.predictedPrice?.oneYear, currentPrice, minOneYearPrice, maxOneYearPrice);
      
      const prediction: StockPrediction = {
        symbol: data.symbol,
        currentPrice: data.currentPrice,
        predictedPrice: {
          oneMonth: oneMonthPredicted,
          threeMonths: threeMonthsPredicted,
          sixMonths: sixMonthsPredicted,
          oneYear: oneYearPredicted
        },
        sentimentAnalysis: predictionData.sentimentAnalysis || generateDefaultSentiment(data, "Technology", oneYearPredicted/currentPrice),
        confidenceLevel: ensureNumberInRange(predictionData.confidenceLevel, 65, 90),
        keyDrivers: ensureArrayWithItems(predictionData.keyDrivers, generateDefaultDrivers("Technology", data)),
        risks: ensureArrayWithItems(predictionData.risks, generateDefaultRisks("Technology", data))
      };
      
      // Log the prediction range to help with debugging
      const yearGrowthPercent = ((prediction.predictedPrice.oneYear / data.currentPrice) - 1) * 100;
      console.log(`Prediction for ${data.symbol}: 1Y: ${yearGrowthPercent.toFixed(2)}% | 1M: ${((prediction.predictedPrice.oneMonth / data.currentPrice) - 1) * 100}%`);
      
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

// Constrain a value within a range, defaulting to fallback if invalid
function constrainValue(value: any, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || isNaN(value)) {
    return fallback;
  }
  return Math.min(Math.max(value, min), max);
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
