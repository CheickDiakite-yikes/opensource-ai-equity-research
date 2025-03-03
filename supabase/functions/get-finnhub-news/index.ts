
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Type for Finnhub news response
interface FinnhubNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category = "general", limit = 6 } = await req.json();
    
    // Get the API key from environment variable
    const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");
    
    if (!FINNHUB_API_KEY) {
      console.error("FINNHUB_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Fetching news for category: ${category}, limit: ${limit}`);
    
    // Fetch news from Finnhub API
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=${category}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Finnhub API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch news from Finnhub API", 
          details: errorText
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the response
    const news: FinnhubNewsItem[] = await response.json();
    console.log(`Retrieved ${news.length} news items`);
    
    // Log a sample item if available to debug URL issues
    if (news.length > 0) {
      console.log("Sample news item URL:", news[0].url);
    }
    
    // Validate and ensure each news item has a valid URL
    const validatedNews = news
      .slice(0, limit)
      .map(item => {
        // Make sure URL is absolute and properly formatted
        if (item.url && !item.url.startsWith('http')) {
          item.url = `https://${item.url}`;
        }
        return item;
      });

    // Return the news items
    return new Response(JSON.stringify(validatedNews), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in get-finnhub-news function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
