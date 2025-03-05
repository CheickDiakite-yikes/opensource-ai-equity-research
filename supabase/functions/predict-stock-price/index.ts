
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';
import { StockPrediction } from './types.ts';
import { formatDataForPrediction } from './dataFormatter.ts';
import { generatePredictionWithOpenAI } from './predictionService.ts';
import { createFallbackPrediction } from './fallbackGenerator.ts';

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { symbol, stockData, financials, news, quickMode } = await req.json();
    
    if (!symbol || !stockData) {
      throw new Error('Missing required parameters: symbol and stockData are required');
    }
    
    console.log(`Generating AI price prediction for ${symbol}${quickMode ? ' (quick mode)' : ''}`);
    console.log(`Stock data received: price=${stockData.price}, marketCap=${stockData.marketCap || 'N/A'}`);
    console.log(`Financial data received: ${financials ? 'yes' : 'no'}, News count: ${news?.length || 0}`);
    
    // Validate input data
    if (!stockData.price || typeof stockData.price !== 'number' || stockData.price <= 0) {
      throw new Error(`Invalid price data for ${symbol}: ${stockData.price}`);
    }
    
    const formattedData = formatDataForPrediction(symbol, stockData, financials, news);
    formattedData.quickMode = quickMode === true; // Ensure quickMode is passed through
    
    // Add industry classification for better prediction context
    formattedData.industry = determineIndustry(symbol);
    
    // Attempt to generate AI prediction with a max of 2 retries
    let prediction: StockPrediction | null = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (!prediction && attempts < maxAttempts) {
      attempts++;
      console.log(`Prediction attempt ${attempts}/${maxAttempts} for ${symbol}`);
      
      try {
        // If we're on the last attempt, force fallback to ensure we return something
        if (attempts === maxAttempts) {
          console.log(`Using fallback prediction for ${symbol} on final attempt`);
          prediction = createFallbackPrediction(formattedData);
          break;
        }
        
        prediction = await generatePredictionWithOpenAI(formattedData);
        
        // Critical validation: Ensure prediction is meaningfully different from current price
        const currentPrice = stockData.price;
        
        // Validate one-year prediction
        if (!validatePrediction(prediction, currentPrice)) {
          console.warn(`Invalid prediction generated for ${symbol}, retrying...`);
          prediction = null;
          continue;
        }
        
        console.log(`Valid prediction generated for ${symbol}`);
      } catch (predictionError) {
        console.error(`Error in prediction attempt ${attempts}:`, predictionError);
        prediction = null;
        
        // On last attempt, use fallback
        if (attempts === maxAttempts - 1) {
          console.log(`Falling back to enhanced prediction generator for ${symbol}`);
          prediction = createFallbackPrediction(formattedData);
        }
      }
    }
    
    if (!prediction) {
      throw new Error(`Failed to generate valid prediction for ${symbol} after ${maxAttempts} attempts`);
    }
    
    // Final logging of prediction values
    logPredictionResults(symbol, stockData.price, prediction);
    
    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error generating price prediction:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

/**
 * Validates that prediction values are significantly different from current price
 */
function validatePrediction(prediction: StockPrediction | null, currentPrice: number): boolean {
  if (!prediction || !prediction.predictedPrice) return false;
  
  const oneYearPrice = prediction.predictedPrice.oneYear;
  if (typeof oneYearPrice !== 'number') return false;
  
  // Check one-year prediction (should be at least 1% different)
  const yearDiff = Math.abs((oneYearPrice - currentPrice) / currentPrice);
  if (yearDiff < 0.01) return false;
  
  // Validate other timeframes
  const timeframes = ['oneMonth', 'threeMonths', 'sixMonths'] as const;
  return timeframes.every(timeframe => {
    const price = prediction.predictedPrice[timeframe];
    return typeof price === 'number' && Math.abs((price - currentPrice) / currentPrice) >= 0.005;
  });
}

/**
 * Determine industry for better prediction context
 */
function determineIndustry(symbol: string): string {
  const industries: Record<string, string> = {
    'AAPL': 'Technology',
    'MSFT': 'Technology',
    'GOOG': 'Technology',
    'AMZN': 'Retail',
    'META': 'Technology',
    'TSLA': 'Automotive',
    'NVDA': 'Semiconductor',
    'JPM': 'Financial',
    'BAC': 'Financial',
    'WMT': 'Retail',
    'JNJ': 'Healthcare',
    'PG': 'Consumer Goods',
    'V': 'Financial',
    'MA': 'Financial',
    'DIS': 'Entertainment',
    'NFLX': 'Entertainment'
  };
  
  return industries[symbol] || 'Technology';
}

/**
 * Log detailed prediction results
 */
function logPredictionResults(symbol: string, currentPrice: number, prediction: StockPrediction): void {
  const oneMonthChange = ((prediction.predictedPrice.oneMonth / currentPrice) - 1) * 100;
  const threeMonthChange = ((prediction.predictedPrice.threeMonths / currentPrice) - 1) * 100;
  const sixMonthChange = ((prediction.predictedPrice.sixMonths / currentPrice) - 1) * 100;
  const oneYearChange = ((prediction.predictedPrice.oneYear / currentPrice) - 1) * 100;
  
  console.log(`Final prediction for ${symbol}: 
    Current: $${currentPrice.toFixed(2)}
    1-month: $${prediction.predictedPrice.oneMonth.toFixed(2)} (${oneMonthChange.toFixed(2)}%)
    3-month: $${prediction.predictedPrice.threeMonths.toFixed(2)} (${threeMonthChange.toFixed(2)}%)
    6-month: $${prediction.predictedPrice.sixMonths.toFixed(2)} (${sixMonthChange.toFixed(2)}%)
    1-year: $${prediction.predictedPrice.oneYear.toFixed(2)} (${oneYearChange.toFixed(2)}%)
  `);
}
