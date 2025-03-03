
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Finnhub API base URL
const FINNHUB_API_BASE = "https://finnhub.io/api/v1";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the FINNHUB_API_KEY from environment variables
    const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
    
    if (!FINNHUB_API_KEY) {
      console.error("Missing FINNHUB_API_KEY in environment variables");
      return new Response(
        JSON.stringify({ error: "API key configuration error" }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    // Parse request body for parameters
    const reqData = await req.json().catch(() => ({}));
    console.log("Request data:", JSON.stringify(reqData));
    
    // Extract parameters with defaults (following the Python example format)
    const category = reqData.category || "general";
    const limit = reqData.limit || 6;
    const minId = reqData.minId || 0;

    console.log(`Fetching general news with category: ${category}, limit: ${limit}, minId: ${minId}`);
    
    // Build Finnhub API URL for general news - using the correct general_news endpoint
    const url = `${FINNHUB_API_BASE}/news?category=${category}&minId=${minId}&token=${FINNHUB_API_KEY}`;
    
    console.log(`Calling Finnhub API: ${url.replace(FINNHUB_API_KEY, "API_KEY_HIDDEN")}`);
    
    // Fetch data from Finnhub
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Finnhub API error (${response.status}): ${errorText}`);
      throw new Error(`Finnhub API error: ${response.statusText}`);
    }
    
    // Parse response data
    const newsData = await response.json();
    
    console.log(`Received ${Array.isArray(newsData) ? newsData.length : 0} news items from Finnhub`);
    
    // Validate and process the response data
    if (!Array.isArray(newsData)) {
      console.error("Invalid response format from Finnhub API:", newsData);
      throw new Error("Invalid response format from Finnhub API");
    }
    
    // Process the news articles to ensure valid URLs and limit the response
    const processedNews = newsData
      .slice(0, limit)
      .map(article => {
        // Ensure URL is valid
        let validUrl = article.url;
        if (validUrl && !validUrl.startsWith('http')) {
          validUrl = `https://${validUrl}`;
        }
        
        // Validate image URL as well
        let validImageUrl = article.image;
        if (validImageUrl && !validImageUrl.startsWith('http')) {
          validImageUrl = `https://${validImageUrl}`;
        }
        
        return {
          ...article,
          url: validUrl,
          image: validImageUrl
        };
      })
      .filter(article => {
        // Filter out items with invalid URLs
        return article.url && 
              (article.url.startsWith('http://') || article.url.startsWith('https://')) &&
              article.url !== 'http://' && 
              article.url !== 'https://';
      });
    
    if (processedNews.length > 0) {
      console.log("Sample news item:", JSON.stringify(processedNews[0], null, 2));
    } else {
      console.warn("No valid news items found after processing");
    }
    
    console.log(`Returning ${processedNews.length} news articles`);
    
    // Return the processed news articles
    return new Response(
      JSON.stringify(processedNews),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred fetching market news" }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
