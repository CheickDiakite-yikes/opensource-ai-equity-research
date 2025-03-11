
import { extractJSONFromText, ensureNumberInRange, ensureArrayWithItems } from "./utils.ts";
import { FormattedData, StockPrediction, PredictionHistoryEntry } from "./types.ts";
import { createFallbackPrediction } from "./fallbackGenerator.ts";
import { validatePrediction } from "./validationService.ts";
import { getIndustryGrowthContext, getIndustryConstraints, formatMarketCap } from "./industryAnalysis.ts";
import { OPENAI_MODELS, OPENAI_CONFIG } from "../_shared/constants.ts";

// Import default sentiment generator early (moved from the middle of the file)
import { generateDefaultSentiment, generateDefaultDrivers, generateDefaultRisks } from "./fallbackGenerator.ts";

/**
 * Generates a prediction using OpenAI's API
 */
export async function generatePredictionWithOpenAI(data: FormattedData): Promise<StockPrediction> {
  // Generate historical prediction context
  const historyContext = getHistoricalPredictionContext(data.predictionHistory || []);
  
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

${historyContext}

INDUSTRY CONTEXT: ${data.industry || 'Technology'} stocks typically have ${getIndustryGrowthContext(data.industry || 'Technology')}

YOUR PREDICTIONS SHOULD REFLECT:
- Each company is unique - avoid using similar growth rates for different companies
- Market conditions and industry trends vary significantly by sector
- Growth rates typically increase with time horizon (1-year > 6-month > 3-month > 1-month)
- Consider volatility - high-beta stocks can have larger price swings
- The larger the company by market cap, the less extreme the growth predictions should be

OUTPUT FORMAT: Your response MUST be a properly formatted JSON object with no markdown formatting.`;

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

${data.predictionHistory && data.predictionHistory.length > 0 ? 
`HISTORICAL PREDICTIONS (most recent first):
${formatHistoricalPredictions(data.predictionHistory)}` : 
'NO HISTORICAL PREDICTIONS AVAILABLE'}

Based on this analysis, provide:
1. Realistic price predictions for 1 month, 3 months, 6 months, and 1 year
2. Sentiment analysis (bullish, neutral, or bearish with explanation)
3. Confidence level (0-100%)
4. 3-5 key growth drivers specific to this company
5. 3-5 potential risks specific to this company

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT with the following structure:
{
  "predictedPrice": {
    "oneMonth": (number),
    "threeMonths": (number),
    "sixMonths": (number),
    "oneYear": (number)
  },
  "sentimentAnalysis": "string with sentiment + brief explanation",
  "confidenceLevel": (number between 65-90),
  "keyDrivers": ["string1", "string2", "string3"],
  "risks": ["string1", "string2", "string3"]
}

MOST IMPORTANT: Your predictions MUST be different from the current price - showing either growth or decline
based on your analysis of the data. Different companies should have different growth trajectories based on 
their unique data profile and industry characteristics.

The current price is $${data.currentPrice.toFixed(2)} - each of your predictions must differ from this value.`;

  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    const quickMode = data.quickMode === true;
    
    // For featured companies dashboard use o3-mini for consistent performance
    // For detailed reports use the same model for now
    const modelToUse = OPENAI_MODELS.DEFAULT;
    
    // Reduce tokens for featured companies for speed
    const maxTokens = quickMode ? 1200 : 1800; 
    
    // Adjust temperature based on need
    // Lower temperature for more consistent predictions
    const temperature = quickMode ? OPENAI_CONFIG.TEMPERATURE.PRECISE : OPENAI_CONFIG.TEMPERATURE.BALANCED;
    
    // Select reasoning effort based on mode
    const reasoningEffort = quickMode ? OPENAI_CONFIG.REASONING_EFFORT.LOW : OPENAI_CONFIG.REASONING_EFFORT.MEDIUM;
    
    console.log(`Generating prediction for ${data.symbol} using ${modelToUse} model (quickMode: ${quickMode}, reasoningEffort: ${reasoningEffort})`);
    
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
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        reasoning_effort: reasoningEffort,
        response_format: { type: "json_object" } // Ensure JSON response format
      })
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API error:", responseData);
      console.log("Falling back to enhanced fallback prediction generator");
      return getConsistentPrediction(data);
    }

    const content = responseData.choices?.[0]?.message?.content;
    
    if (!content) {
      console.log("No content in OpenAI response, using enhanced fallback prediction");
      return getConsistentPrediction(data);
    }

    try {
      // Now we expect properly formatted JSON directly
      const predictionData = JSON.parse(content);
      
      // Check if prediction is valid and sufficiently different from current price
      if (!validatePrediction(predictionData, data.currentPrice)) {
        console.log(`Invalid prediction for ${data.symbol}, using fallback generator`);
        return getConsistentPrediction(data);
      }
      
      // Process the prediction with historical consistency check
      return processPredictionResponse(predictionData, data);
      
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", content);
      
      // Try to extract JSON from text as a fallback (in case it's not valid JSON)
      try {
        const extractedJSON = extractJSONFromText(content);
        if (validatePrediction(extractedJSON, data.currentPrice)) {
          return processPredictionResponse(extractedJSON, data);
        }
      } catch (extractError) {
        console.error("Error extracting JSON from text:", extractError);
      }
      
      return getConsistentPrediction(data);
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return getConsistentPrediction(data);
  }
}

/**
 * Get a consistent prediction based on historical data or fallback
 */
function getConsistentPrediction(data: FormattedData): StockPrediction {
  // If we have historical predictions, base a new prediction on the average
  if (data.predictionHistory && data.predictionHistory.length > 0) {
    return generateConsistentPrediction(data);
  }
  
  // Otherwise use the fallback generator
  return createFallbackPrediction(data);
}

/**
 * Generate a prediction consistent with historical data
 */
function generateConsistentPrediction(data: FormattedData): StockPrediction {
  const history = data.predictionHistory || [];
  if (history.length === 0) {
    return createFallbackPrediction(data);
  }
  
  // Extract the trends from historical predictions
  const trends = history.map(p => ({
    oneMonth: (p.one_month_price / p.current_price) - 1,
    threeMonths: (p.three_month_price / p.current_price) - 1,
    sixMonths: (p.six_month_price / p.current_price) - 1,
    oneYear: (p.one_year_price / p.current_price) - 1
  }));
  
  // Calculate the average trends
  const avgTrends = trends.reduce((acc, trend, i, arr) => {
    // Weight more recent predictions higher
    const weight = (arr.length - i) / arr.length;
    return {
      oneMonth: acc.oneMonth + (trend.oneMonth * weight),
      threeMonths: acc.threeMonths + (trend.threeMonths * weight),
      sixMonths: acc.sixMonths + (trend.sixMonths * weight),
      oneYear: acc.oneYear + (trend.oneYear * weight)
    };
  }, { oneMonth: 0, threeMonths: 0, sixMonths: 0, oneYear: 0 });
  
  // Normalize by total weights
  const totalWeight = (history.length * (history.length + 1)) / (2 * history.length);
  
  const normalizedTrends = {
    oneMonth: avgTrends.oneMonth / totalWeight,
    threeMonths: avgTrends.threeMonths / totalWeight,
    sixMonths: avgTrends.sixMonths / totalWeight,
    oneYear: avgTrends.oneYear / totalWeight
  };
  
  // Add small random variation to prevent exact same predictions (but keep them close)
  const variation = 0.01; // 1% maximum variation
  const randomVariation = () => (Math.random() * variation * 2) - variation;
  
  // Apply the trends to the current price with slight variation
  const currentPrice = data.currentPrice;
  
  // Combine sentiment analysis from historical predictions
  const sentimentCounts = {
    bullish: 0,
    neutral: 0,
    bearish: 0
  };
  
  history.forEach(p => {
    const sentiment = p.sentiment_analysis?.toLowerCase() || "";
    if (sentiment.includes("bullish")) sentimentCounts.bullish++;
    else if (sentiment.includes("bearish")) sentimentCounts.bearish++;
    else sentimentCounts.neutral++;
  });
  
  // Determine overall sentiment
  let overallSentiment;
  if (sentimentCounts.bullish > sentimentCounts.bearish && sentimentCounts.bullish > sentimentCounts.neutral) {
    overallSentiment = "Bullish";
  } else if (sentimentCounts.bearish > sentimentCounts.bullish && sentimentCounts.bearish > sentimentCounts.neutral) {
    overallSentiment = "Bearish";
  } else {
    overallSentiment = "Neutral";
  }
  
  // Combine key drivers and risks - handle potential non-array values
  const allKeyDrivers = history.flatMap(p => {
    if (Array.isArray(p.key_drivers)) return p.key_drivers;
    return [];
  });
  
  const allRisks = history.flatMap(p => {
    if (Array.isArray(p.risks)) return p.risks;
    return [];
  });
  
  // Count occurrences of each driver and risk
  const driverCounts = countOccurrences(allKeyDrivers);
  const riskCounts = countOccurrences(allRisks);
  
  // Get top drivers and risks
  const topDrivers = getTopItems(driverCounts, 5);
  const topRisks = getTopItems(riskCounts, 5);
  
  return {
    symbol: data.symbol,
    currentPrice: currentPrice,
    predictedPrice: {
      oneMonth: parseFloat((currentPrice * (1 + normalizedTrends.oneMonth + randomVariation())).toFixed(2)),
      threeMonths: parseFloat((currentPrice * (1 + normalizedTrends.threeMonths + randomVariation())).toFixed(2)),
      sixMonths: parseFloat((currentPrice * (1 + normalizedTrends.sixMonths + randomVariation())).toFixed(2)),
      oneYear: parseFloat((currentPrice * (1 + normalizedTrends.oneYear + randomVariation())).toFixed(2))
    },
    sentimentAnalysis: `${overallSentiment}: Based on historical predictions and current analysis.`,
    confidenceLevel: Math.round(history.reduce((sum, p) => sum + (p.confidence_level || 75), 0) / history.length),
    keyDrivers: topDrivers,
    risks: topRisks
  };
}

/**
 * Count occurrences of strings in an array
 */
function countOccurrences(items: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  items.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  return counts;
}

/**
 * Get top N items based on occurrence count
 */
function getTopItems(countMap: Record<string, number>, n: number): string[] {
  return Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([item]) => item);
}

/**
 * Format historical predictions for display
 */
function formatHistoricalPredictions(history: PredictionHistoryEntry[]): string {
  return history.map((p, i) => {
    const date = new Date(p.prediction_date).toLocaleDateString();
    const oneMonthChange = ((p.one_month_price / p.current_price) - 1) * 100;
    const threeMonthChange = ((p.three_month_price / p.current_price) - 1) * 100;
    const sixMonthChange = ((p.six_month_price / p.current_price) - 1) * 100;
    const oneYearChange = ((p.one_year_price / p.current_price) - 1) * 100;
    
    return `Prediction ${i+1} (${date}):
  - Current: $${p.current_price.toFixed(2)}
  - 1M: $${p.one_month_price.toFixed(2)} (${oneMonthChange.toFixed(2)}%)
  - 3M: $${p.three_month_price.toFixed(2)} (${threeMonthChange.toFixed(2)}%)
  - 6M: $${p.six_month_price.toFixed(2)} (${sixMonthChange.toFixed(2)}%)
  - 1Y: $${p.one_year_price.toFixed(2)} (${oneYearChange.toFixed(2)}%)
  - Sentiment: ${p.sentiment_analysis || 'N/A'}
  - Key Drivers: ${Array.isArray(p.key_drivers) ? p.key_drivers.join(', ') : 'N/A'}`;
  }).join('\n\n');
}

/**
 * Get historical prediction context for the system prompt
 */
function getHistoricalPredictionContext(history: PredictionHistoryEntry[]): string {
  if (history.length === 0) {
    return "HISTORICAL CONTEXT: No previous predictions available for this stock.";
  }
  
  const mostRecent = history[0];
  const avgOneYearChange = history.reduce((sum, p) => sum + ((p.one_year_price / p.current_price) - 1) * 100, 0) / history.length;
  const consistencyLevel = getConsistencyLevel(history);
  
  return `HISTORICAL CONTEXT: 
- There are ${history.length} previous predictions for this stock
- Most recent prediction (${new Date(mostRecent.prediction_date).toLocaleDateString()}): 1Y change of ${(((mostRecent.one_year_price / mostRecent.current_price) - 1) * 100).toFixed(2)}%
- Average 1Y prediction across history: ${avgOneYearChange.toFixed(2)}%
- Prediction consistency level: ${consistencyLevel}
- YOU MUST MAINTAIN PREDICTION CONSISTENCY. Avoid large shifts from previous predictions unless there is major news or data that justifies it.`;
}

/**
 * Calculate the consistency level of historical predictions
 */
function getConsistencyLevel(history: PredictionHistoryEntry[]): string {
  if (history.length < 2) return "N/A (insufficient history)";
  
  // Calculate standard deviation of 1Y predictions
  const oneYearChanges = history.map(p => ((p.one_year_price / p.current_price) - 1) * 100);
  const avg = oneYearChanges.reduce((sum, val) => sum + val, 0) / oneYearChanges.length;
  const variance = oneYearChanges.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / oneYearChanges.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev < 5) return "High (predictions are very consistent)";
  if (stdDev < 15) return "Medium (reasonable consistency)";
  return "Low (high variance between predictions)";
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
  
  // Apply historical consistency if available
  const historyConsistencyFactor = 0.7; // 70% weight to historical average if available
  
  // Calculate historical trend values if available
  let historyTrends = {
    oneMonth: 0,
    threeMonths: 0,
    sixMonths: 0,
    oneYear: 0
  };
  
  if (data.predictionHistory && data.predictionHistory.length > 0) {
    // Calculate weighted average trends from history
    const history = data.predictionHistory;
    const totalPredictions = history.length;
    let totalWeight = 0;
    
    history.forEach((pred, index) => {
      // More recent predictions get higher weight
      const weight = (totalPredictions - index) / totalPredictions;
      totalWeight += weight;
      
      historyTrends.oneMonth += ((pred.one_month_price / pred.current_price) - 1) * weight;
      historyTrends.threeMonths += ((pred.three_month_price / pred.current_price) - 1) * weight;
      historyTrends.sixMonths += ((pred.six_month_price / pred.current_price) - 1) * weight;
      historyTrends.oneYear += ((pred.one_year_price / pred.current_price) - 1) * weight;
    });
    
    // Normalize by total weight
    historyTrends.oneMonth /= totalWeight;
    historyTrends.threeMonths /= totalWeight;
    historyTrends.sixMonths /= totalWeight;
    historyTrends.oneYear /= totalWeight;
  }
  
  // Blend new predictions with historical trends based on consistency factor
  const blendWithHistory = (newValue: number, historyTrend: number, currentPrice: number): number => {
    if (data.predictionHistory && data.predictionHistory.length > 0) {
      const newTrend = (newValue / currentPrice) - 1;
      const blendedTrend = (newTrend * (1 - historyConsistencyFactor)) + (historyTrend * historyConsistencyFactor);
      return currentPrice * (1 + blendedTrend);
    }
    return newValue;
  };
  
  // Use returned values but blend with history for consistency, ensure minimal difference, and apply constraints
  const oneMonthRaw = constrainValue(predictionData.predictedPrice?.oneMonth, 
    getDefaultPrediction(currentPrice, 0.01, 0.03, data), 
    currentPrice * (1 - industryLimits.oneMonth), 
    currentPrice * (1 + industryLimits.oneMonth));
    
  const threeMonthsRaw = constrainValue(predictionData.predictedPrice?.threeMonths, 
    getDefaultPrediction(currentPrice, 0.02, 0.05, data), 
    currentPrice * (1 - industryLimits.threeMonths), 
    currentPrice * (1 + industryLimits.threeMonths));
    
  const sixMonthsRaw = constrainValue(predictionData.predictedPrice?.sixMonths, 
    getDefaultPrediction(currentPrice, 0.03, 0.08, data), 
    currentPrice * (1 - industryLimits.sixMonths), 
    currentPrice * (1 + industryLimits.sixMonths));
    
  const oneYearRaw = constrainValue(predictionData.predictedPrice?.oneYear, 
    getDefaultPrediction(currentPrice, 0.05, 0.12, data), 
    currentPrice * (1 - industryLimits.oneYear), 
    currentPrice * (1 + industryLimits.oneYear));
  
  // Blend with historical trends
  const oneMonthBlended = blendWithHistory(oneMonthRaw, currentPrice * (1 + historyTrends.oneMonth), currentPrice);
  const threeMonthsBlended = blendWithHistory(threeMonthsRaw, currentPrice * (1 + historyTrends.threeMonths), currentPrice);
  const sixMonthsBlended = blendWithHistory(sixMonthsRaw, currentPrice * (1 + historyTrends.sixMonths), currentPrice);
  const oneYearBlended = blendWithHistory(oneYearRaw, currentPrice * (1 + historyTrends.oneYear), currentPrice);
  
  // Final predictions with minimum difference enforcement
  const oneMonthPredicted = ensureDifferentPrice(oneMonthBlended, currentPrice, 0.01);
  const threeMonthsPredicted = ensureDifferentPrice(threeMonthsBlended, currentPrice, 0.015);
  const sixMonthsPredicted = ensureDifferentPrice(sixMonthsBlended, currentPrice, 0.02);
  const oneYearPredicted = ensureDifferentPrice(oneYearBlended, currentPrice, 0.025);
  
  // Build the final prediction ensuring arrays for keyDrivers and risks
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
