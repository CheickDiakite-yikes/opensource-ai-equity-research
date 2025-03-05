
import { StockPrediction, FormattedData } from "./types.ts";
import { generateDefaultSentiment, generateDefaultDrivers, generateDefaultRisks, createFallbackPrediction } from "./fallbackGenerator.ts";

export async function generatePredictionWithOpenAI(data: FormattedData): Promise<StockPrediction> {
  const systemPrompt = `You are a senior financial analyst specializing in stock market predictions. 
Your task is to analyze the provided data for ${data.symbol} and generate realistic price predictions
for 1 month, 3 months, 6 months, and 1 year time horizons.

CRITICAL INSTRUCTIONS:
1. Each prediction MUST be DIFFERENT from the current price - identical predictions are not acceptable
2. Different time horizons should show logical progression (more variance for longer timeframes)
3. Companies in different industries should have different growth trajectories
4. Consider company-specific factors: larger companies tend to have lower growth rates
5. Technology companies often have higher growth potential than utilities or consumer staples
6. Strong financial performers deserve higher growth projections than underperformers
7. Predictions must reflect reasonable market expectations (typically between -20% to +40% for 1 year)
8. Technical indicators and news sentiment should influence your short-term projections

YOUR PREDICTIONS SHOULD REFLECT:
- Each company is unique - avoid using similar growth rates for different companies
- Market conditions and industry trends vary significantly by sector
- Growth rates typically increase with time horizon (1-year > 6-month > 3-month > 1-month)
- Consider volatility - high-beta stocks can have larger price swings`;

  const userPrompt = `Please analyze these data points for ${data.symbol} and provide detailed price predictions:

SYMBOL: ${data.symbol}
CURRENT PRICE: $${data.currentPrice.toFixed(2)}

FINANCIAL SUMMARY:
${JSON.stringify(data.financialSummary, null, 2)}

TECHNICAL INDICATORS:
${JSON.stringify(data.technicalIndicators, null, 2)}

NEWS SENTIMENT:
${JSON.stringify(data.newsSummary, null, 2)}

Based on this analysis, provide:
1. Realistic price predictions for 1 month, 3 months, 6 months, and 1 year
2. Sentiment analysis (bullish, neutral, or bearish with explanation)
3. Confidence level (0-100%)
4. 3-5 key growth drivers specific to this company
5. 3-5 potential risks specific to this company

MOST IMPORTANT: Your predictions MUST be different from the current price - showing either growth or decline
based on your analysis of the data. Different companies should have different growth trajectories based on 
their unique data profile and industry characteristics.`;

  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    const quickMode = data.quickMode === true;
    
    // For featured companies dashboard use gpt-4o-mini for faster performance
    // For detailed reports use the more powerful model
    const modelToUse = quickMode ? "gpt-4o-mini" : "gpt-4o-mini";
    
    // Reduce tokens for featured companies for speed
    const maxTokens = quickMode ? 1000 : 1500; 
    
    // Higher temperature produces more varied predictions
    const temperature = 0.95; // Increased from 0.7 to get more varied results
    
    console.log(`Generating prediction for ${data.symbol} using ${modelToUse} model (quickMode: ${quickMode})`);
    
    // Skip API call and use enhanced fallback prediction in the following scenarios:
    // 1. If quick mode is enabled and we have limited financial data
    // 2. If we are in the development environment
    const isDevMode = Deno.env.get("ENVIRONMENT") === "development";
    const hasLimitedData = !data.financialSummary || Object.keys(data.financialSummary).length === 0;
    
    if ((quickMode && hasLimitedData) || isDevMode) {
      console.log(`Using enhanced fallback prediction for ${data.symbol} (limited data: ${hasLimitedData}, dev mode: ${isDevMode})`);
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
      
      // CRITICAL VALIDATION: We must never return the same predicted price as current price
      // Make sure all predicted prices differ from current price by at least 1%
      const currentPrice = data.currentPrice;
      const oneYearPrice = predictionData.predictedPrice?.oneYear;
      
      // Check if prediction is valid and sufficiently different from current price
      const isValidYearPrediction = typeof oneYearPrice === 'number' && 
                                   Math.abs((oneYearPrice - currentPrice) / currentPrice) >= 0.01;
      
      if (!isValidYearPrediction) {
        console.log(`Invalid prediction for ${data.symbol}, using fallback generator`);
        return createFallbackPrediction(data);
      }
      
      // Apply realistic constraints to predicted prices (prevent extreme predictions)
      const minOneYearPrice = currentPrice * 0.7;  // Max 30% decrease
      const maxOneYearPrice = currentPrice * 1.6;  // Max 60% increase
      
      const minOneMonthPrice = currentPrice * 0.93; // Max 7% decrease
      const maxOneMonthPrice = currentPrice * 1.1;  // Max 10% increase
      
      const minThreeMonthPrice = currentPrice * 0.85; // Max 15% decrease
      const maxThreeMonthPrice = currentPrice * 1.2;  // Max 20% increase
      
      const minSixMonthPrice = currentPrice * 0.8;  // Max 20% decrease
      const maxSixMonthPrice = currentPrice * 1.35; // Max 35% increase
      
      // Ensure each price prediction has a minimum difference from current price
      const ensureDifferentPrice = (predicted: number, current: number): number => {
        const percentDiff = (predicted - current) / current;
        
        // If difference is less than 1%, add at least 2-5% change
        if (Math.abs(percentDiff) < 0.01) {
          // Get a random adjustment between 2-5%
          const adjustment = (0.02 + Math.random() * 0.03) * (Math.random() > 0.4 ? 1 : -1);
          return current * (1 + adjustment);
        }
        return predicted;
      };
      
      // Use returned values but ensure minimal difference and apply constraints
      const oneMonthPredicted = ensureDifferentPrice(
        constrainValue(predictionData.predictedPrice?.oneMonth, currentPrice * 1.02, minOneMonthPrice, maxOneMonthPrice),
        currentPrice
      );
      
      const threeMonthsPredicted = ensureDifferentPrice(
        constrainValue(predictionData.predictedPrice?.threeMonths, currentPrice * 1.05, minThreeMonthPrice, maxThreeMonthPrice),
        currentPrice
      );
      
      const sixMonthsPredicted = ensureDifferentPrice(
        constrainValue(predictionData.predictedPrice?.sixMonths, currentPrice * 1.08, minSixMonthPrice, maxSixMonthPrice),
        currentPrice
      );
      
      const oneYearPredicted = ensureDifferentPrice(
        constrainValue(predictionData.predictedPrice?.oneYear, currentPrice * 1.12, minOneYearPrice, maxOneYearPrice),
        currentPrice
      );
      
      // Build the final prediction
      const prediction: StockPrediction = {
        symbol: data.symbol,
        currentPrice: data.currentPrice,
        predictedPrice: {
          oneMonth: parseFloat(oneMonthPredicted.toFixed(2)),
          threeMonths: parseFloat(threeMonthsPredicted.toFixed(2)),
          sixMonths: parseFloat(sixMonthsPredicted.toFixed(2)),
          oneYear: parseFloat(oneYearPredicted.toFixed(2))
        },
        sentimentAnalysis: predictionData.sentimentAnalysis || generateDefaultSentiment(data, "Technology", oneYearPredicted/currentPrice),
        confidenceLevel: ensureNumberInRange(predictionData.confidenceLevel, 65, 90),
        keyDrivers: ensureArrayWithItems(predictionData.keyDrivers, generateDefaultDrivers("Technology", data)),
        risks: ensureArrayWithItems(predictionData.risks, generateDefaultRisks("Technology", data))
      };
      
      // Log the prediction range to help with debugging
      const yearGrowthPercent = ((prediction.predictedPrice.oneYear / currentPrice) - 1) * 100;
      console.log(`OpenAI prediction for ${data.symbol}: 1Y: ${yearGrowthPercent.toFixed(2)}% | 1M: ${((prediction.predictedPrice.oneMonth / currentPrice) - 1) * 100}%`);
      
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
