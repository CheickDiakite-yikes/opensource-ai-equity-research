
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';
import { StockPrediction } from './types.ts';
import { formatDataForPrediction } from './dataFormatter.ts';
import { generatePredictionWithOpenAI } from './predictionService.ts';

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
      throw new Error('Missing required parameters');
    }
    
    console.log(`Generating AI price prediction for ${symbol}${quickMode ? ' (quick mode)' : ''}`);
    
    const formattedData = formatDataForPrediction(symbol, stockData, financials, news);
    formattedData.quickMode = quickMode === true; // Ensure quickMode is passed through
    
    const prediction = await generatePredictionWithOpenAI(formattedData);
    
    // Log prediction summary for debugging
    const oneYearGrowth = ((prediction.predictedPrice.oneYear / stockData.price) - 1) * 100;
    console.log(`AI prediction for ${symbol}: 1-year projection: ${oneYearGrowth.toFixed(2)}% growth`);
    
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
