
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Finnhub API key - this should be moved to Supabase secrets in production
const FINNHUB_API_KEY = 'ctphls1r01qqsrsarga0ctphls1r01qqsrsargag';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { category = 'general', limit = 6 } = await req.json();
    
    console.log(`Fetching ${limit} news articles from Finnhub with category: ${category}`);
    
    // Validate the category (must be one of: general, forex, crypto, merger)
    const validCategories = ['general', 'forex', 'crypto', 'merger'];
    if (!validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Build the Finnhub API URL
    const url = `https://finnhub.io/api/v1/news?category=${category}&token=${FINNHUB_API_KEY}`;
    
    // Fetch data from Finnhub
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Finnhub API returned ${response.status}: ${response.statusText}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Limit the number of results and return
    const limitedData = Array.isArray(data) ? data.slice(0, limit) : [];
    
    console.log(`Successfully fetched ${limitedData.length} news articles`);
    
    return new Response(
      JSON.stringify(limitedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-finnhub-news function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
