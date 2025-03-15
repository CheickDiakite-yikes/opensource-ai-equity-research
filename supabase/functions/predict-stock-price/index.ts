
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';
import { StockPrediction } from './types.ts';
import { formatDataForPrediction } from './dataFormatter.ts';
import { generatePredictionWithOpenAI } from './predictionService.ts';
import { createFallbackPrediction } from './fallbackGenerator.ts';
import { validatePrediction } from './validationService.ts';
import { determineIndustry } from './industryAnalysis.ts';
import { processPredictionPrices } from './utils.ts';

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create clients with different permissions
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Create a separate client with service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

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
    console.log(`Stock data received: price=${stockData.price}, market cap=${stockData.marketCap || 'N/A'}`);
    console.log(`Financial data received: ${financials ? 'yes' : 'no'}, News count: ${news?.length || 0}`);
    
    // Enhanced input validation
    if (!stockData.price || typeof stockData.price !== 'number' || stockData.price <= 0) {
      throw new Error(`Invalid price data for ${symbol}: ${stockData.price}`);
    }
    
    const formattedData = formatDataForPrediction(symbol, stockData, financials, news);
    formattedData.quickMode = quickMode === true; // Ensure quickMode is passed through
    
    // Add industry classification for better prediction context
    formattedData.industry = determineIndustry(symbol);
    
    // Try to generate prediction with a max of 3 retries
    let prediction: StockPrediction | null = null;
    let attempts = 0;
    const maxAttempts = 4;
    
    while (!prediction && attempts < maxAttempts) {
      attempts++;
      console.log(`Prediction attempt ${attempts}/${maxAttempts} for ${symbol}`);
      
      try {
        if (attempts === maxAttempts) {
          console.log(`Using fallback prediction for ${symbol} on final attempt`);
          prediction = createFallbackPrediction(formattedData);
          break;
        }
        
        prediction = await generatePredictionWithOpenAI(formattedData);
        
        // Process and validate prediction values
        if (prediction) {
          // Ensure prediction values are within realistic bounds
          prediction.predictedPrice = processPredictionPrices(
            prediction.predictedPrice, 
            stockData.price
          );
          
          // Validate the processed prediction
          if (!validatePrediction(prediction, stockData.price)) {
            console.warn(`Invalid prediction generated for ${symbol}, retrying...`);
            prediction = null;
            continue;
          }
          
          console.log(`Valid prediction generated for ${symbol}`);
        }
      } catch (predictionError) {
        console.error(`Error in prediction attempt ${attempts}:`, predictionError);
        prediction = null;
        
        if (attempts === maxAttempts - 1) {
          console.log(`Falling back to enhanced prediction generator for ${symbol}`);
          prediction = createFallbackPrediction(formattedData);
        }
      }
    }
    
    if (!prediction) {
      throw new Error(`Failed to generate valid prediction for ${symbol} after ${maxAttempts} attempts`);
    }
    
    // Log the final prediction values
    console.log(`Final prediction for ${symbol}:`, {
      current: prediction.currentPrice,
      oneMonth: prediction.predictedPrice.oneMonth,
      threeMonths: prediction.predictedPrice.threeMonths,
      sixMonths: prediction.predictedPrice.sixMonths,
      oneYear: prediction.predictedPrice.oneYear
    });
    
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
