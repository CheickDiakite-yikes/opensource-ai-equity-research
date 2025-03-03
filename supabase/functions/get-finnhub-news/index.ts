
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get Finnhub API key from environment variables
const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY') || 'ctphls1r01qqsrsarga0ctphls1r01qqsrsargag';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { category = 'general', minId = 0, limit = 6 } = await req.json();
    
    console.log(`Fetching news articles from Finnhub with category: ${category}, minId: ${minId}, limit: ${limit}`);
    
    // Validate the category (must be one of: general, forex, crypto, merger)
    const validCategories = ['general', 'forex', 'crypto', 'merger'];
    if (!validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Build the Finnhub API URL with the parameters
    const url = `https://finnhub.io/api/v1/news?category=${category}${minId ? `&minId=${minId}` : ''}&token=${FINNHUB_API_KEY}`;
    
    console.log(`Calling Finnhub API: ${url.replace(FINNHUB_API_KEY, 'API_KEY_HIDDEN')}`);
    
    // Fetch data from Finnhub
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Finnhub API error (${response.status}): ${errorText}`);
      throw new Error(`Finnhub API returned ${response.status}: ${response.statusText}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Validate that the response is an array
    if (!Array.isArray(data)) {
      console.error('Unexpected response format from Finnhub:', data);
      throw new Error('Unexpected response format from Finnhub API');
    }
    
    // Limit the number of results and return
    const limitedData = data.slice(0, limit);
    
    console.log(`Successfully fetched ${limitedData.length} news articles`);
    console.log('Sample article:', limitedData.length > 0 ? JSON.stringify(limitedData[0]) : 'No articles');
    
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
