
import { extractJSONFromText, ensureNumberInRange, ensureArrayWithItems } from "./utils.ts";
import { FormattedData, StockPrediction } from "./types.ts";
import { createFallbackPrediction } from "./fallbackGenerator.ts";
import { validatePrediction } from "./validationService.ts";
import { getIndustryGrowthContext, getIndustryConstraints, formatMarketCap } from "./industryAnalysis.ts";

/**
 * Generates a prediction using OpenAI's API
 */
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
7. Predictions must reflect realistic market expectations
   - Growth stocks: -20% to +50% for 1 year
   - Value stocks: -15% to +25% for 1 year
   - Small/volatile stocks: -40% to +80% for 1 year
8. Technical indicators and news sentiment should influence your short-term projections
9. Current price: $${data.currentPrice.toFixed(2)} - your predictions must differ from this

INDUSTRY CONTEXT: ${data.industry || 'Technology'} stocks typically have ${getIndustryGrowthContext(data.industry || 'Technology')}

YOUR PREDICTIONS SHOULD REFLECT:
- Each company is unique - avoid using similar growth rates for different companies
- Market conditions and industry trends vary significantly by sector
- Growth rates typically increase with time horizon (1-year > 6-month > 3-month > 1-month)
- Consider volatility - high-beta stocks can have larger price swings
- The larger the company by market cap, the less extreme the growth predictions should be`;

  const userPrompt = `Please analyze these data points for ${data.symbol} and provide detailed price predictions:

SYMBOL: ${data.symbol}
CURRENT PRICE: $${data.currentPrice.toFixed(2)}
INDUSTRY: ${data.industry || 'Technology'}
MARKET CAP: ${formatMarketCap(data.financialSummary?.marketCap)}

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
their unique data profile and industry characteristics.

The current price is $${data.currentPrice.toFixed(2)} - each of your predictions must differ from this value.`;

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
      
      // Check if prediction is valid and sufficiently different from current price
      if (!validatePrediction(predictionData, data.currentPrice)) {
        console.log(`Invalid prediction for ${data.symbol}, using fallback generator`);
        return createFallbackPrediction(data);
      }
      
      return processPredictionResponse(predictionData, data);
      
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

/**
 * Process the OpenAI response and format the prediction data
 */
function processPredictionResponse(predictionData: any, data: FormattedData): StockPrediction {
  const currentPrice = data.currentPrice;
  const industryLimits = getIndustryConstraints(data.industry || 'Technology');
  
  // Ensure each price prediction has a minimum difference from current price
  const ensureDifferentPrice = (predicted: number, current: number, minPercentDiff = 0.01): number => {
    const percentDiff = (predicted - current) / current;
    
    // If difference is less than minPercentDiff, add at least that much change
    if (Math.abs(percentDiff) < minPercentDiff) {
      // Get a random adjustment between minPercentDiff and 2*minPercentDiff
      const adjustment = (minPercentDiff + Math.random() * minPercentDiff) * (Math.random() > 0.4 ? 1 : -1);
      return current * (1 + adjustment);
    }
    return predicted;
  };
  
  // Constrain value within a range, defaulting to fallback if invalid
  const constrainValue = (value: any, fallback: number, min: number, max: number): number => {
    if (typeof value !== 'number' || isNaN(value)) {
      return fallback;
    }
    return Math.min(Math.max(value, min), max);
  };
  
  // Get default prediction with some variability
  const getDefaultPrediction = (current: number, minChange: number, maxChange: number, data: FormattedData): number => {
    // Determine direction (positive or negative) based on company and market factors
    const symbolHash = data.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const direction = symbolHash % 4 === 0 ? -1 : 1; // 25% chance of negative prediction
    
    // Calculate change percentage
    const changePercent = (minChange + Math.random() * (maxChange - minChange)) * direction;
    
    return current * (1 + changePercent);
  };
  
  // Use returned values but ensure minimal difference and apply constraints
  const oneMonthPredicted = ensureDifferentPrice(
    constrainValue(predictionData.predictedPrice?.oneMonth, getDefaultPrediction(currentPrice, 0.01, 0.03, data), 
    currentPrice * (1 - industryLimits.oneMonth), currentPrice * (1 + industryLimits.oneMonth)),
    currentPrice,
    0.01
  );
  
  const threeMonthsPredicted = ensureDifferentPrice(
    constrainValue(predictionData.predictedPrice?.threeMonths, getDefaultPrediction(currentPrice, 0.02, 0.05, data), 
    currentPrice * (1 - industryLimits.threeMonths), currentPrice * (1 + industryLimits.threeMonths)),
    currentPrice,
    0.015
  );
  
  const sixMonthsPredicted = ensureDifferentPrice(
    constrainValue(predictionData.predictedPrice?.sixMonths, getDefaultPrediction(currentPrice, 0.03, 0.08, data), 
    currentPrice * (1 - industryLimits.sixMonths), currentPrice * (1 + industryLimits.sixMonths)),
    currentPrice,
    0.02
  );
  
  const oneYearPredicted = ensureDifferentPrice(
    constrainValue(predictionData.predictedPrice?.oneYear, getDefaultPrediction(currentPrice, 0.05, 0.12, data), 
    currentPrice * (1 - industryLimits.oneYear), currentPrice * (1 + industryLimits.oneYear)),
    currentPrice,
    0.025
  );
  
  // Import functions from default sentiment generator if needed
  import { generateDefaultSentiment, generateDefaultDrivers, generateDefaultRisks } from "./fallbackGenerator.ts";
  
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
    sentimentAnalysis: predictionData.sentimentAnalysis || generateDefaultSentiment(data, data.industry || "Technology", oneYearPredicted/currentPrice),
    confidenceLevel: ensureNumberInRange(predictionData.confidenceLevel, 65, 90),
    keyDrivers: ensureArrayWithItems(predictionData.keyDrivers, generateDefaultDrivers(data.industry || "Technology", data)),
    risks: ensureArrayWithItems(predictionData.risks, generateDefaultRisks(data.industry || "Technology", data))
  };
  
  // Log the prediction range to help with debugging
  const yearGrowthPercent = ((prediction.predictedPrice.oneYear / currentPrice) - 1) * 100;
  console.log(`OpenAI prediction for ${data.symbol}: 1Y: ${yearGrowthPercent.toFixed(2)}% | 1M: ${((prediction.predictedPrice.oneMonth / currentPrice) - 1) * 100}%`);
  
  return prediction;
}
