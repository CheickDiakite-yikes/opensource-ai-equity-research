
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from environment variables
    const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
    
    if (!FINNHUB_API_KEY) {
      console.error('FINNHUB_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'API key configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    const requestData = await req.json();
    const { limit = 6, symbol = 'AAPL' } = requestData;
    
    console.log(`Fetching press releases for symbol: ${symbol}, limit: ${limit}`);
    
    // Construct URL for press releases endpoint
    const url = `https://finnhub.io/api/v1/press-releases?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    console.log(`Request URL: ${url.replace(FINNHUB_API_KEY, 'REDACTED')}`);
    
    // Fetch data from Finnhub
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Finnhub API error (${response.status}): ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Failed to fetch press releases: ${response.statusText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse response data
    const data = await response.json();
    console.log('Finnhub API response structure:', Object.keys(data));
    
    if (!data.majorDevelopment || !Array.isArray(data.majorDevelopment)) {
      console.warn('Unexpected response format from Finnhub API', data);
      return new Response(
        JSON.stringify({ error: 'Unexpected response format from Finnhub API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Map and clean the data
    const pressReleases = data.majorDevelopment
      .slice(0, limit)
      .map(item => {
        // Validate URL
        let url = item.url || '';
        // Ensure URL has proper http/https prefix
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
          url = `https://${url}`;
        }
        
        return {
          category: 'press-release',
          datetime: new Date(item.datetime).getTime() / 1000, // Convert to Unix timestamp
          headline: item.headline,
          id: Math.floor(Math.random() * 1000000), // Generate a random ID
          image: '', // Press releases don't typically include images
          related: item.symbol,
          source: 'Finnhub Press Release',
          summary: item.description,
          url: url,
          publishedDate: item.datetime,
          title: item.headline,
          text: item.description,
          site: 'Finnhub',
          symbol: item.symbol
        };
      })
      .filter(item => {
        // Filter out items with invalid/empty URLs
        if (!item.url || item.url === 'https://') {
          console.warn('Filtered out press release with invalid URL:', item.headline);
          return false;
        }
        return true;
      });
    
    console.log(`Returning ${pressReleases.length} press releases`);
    if (pressReleases.length > 0) {
      console.log('Sample press release:', pressReleases[0]);
    }
    
    // Return the mapped data
    return new Response(
      JSON.stringify(pressReleases),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in get-finnhub-news function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
