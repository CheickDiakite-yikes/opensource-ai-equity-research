import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { symbol, endpoint, quarter, year } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`Processing ${endpoint} request for ${symbol}`);
    
    let data;
    
    switch (endpoint) {
      case "profile":
        data = await fetchProfile(symbol);
        break;
      case "quote":
        data = await fetchQuote(symbol);
        break;
      case "rating":
        data = await fetchRating(symbol);
        break;
      case "earning-transcripts":
        data = await fetchEarningTranscripts(symbol);
        break;
      case "transcript-content":
        if (!quarter || !year) {
          return new Response(
            JSON.stringify({ error: "Quarter and year are required for transcript content" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        data = await fetchTranscriptContent(symbol, quarter, year);
        break;
      case "sec-filings":
        data = await fetchSECFilings(symbol);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid endpoint" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }
    
    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

async function fetchProfile(symbol: string) {
  // Fetch profile data from FMP API
  const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data[0]; // Return the first profile
}

async function fetchQuote(symbol: string) {
  // Fetch quote data from FMP API
  const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data[0]; // Return the first quote
}

async function fetchRating(symbol: string) {
  // Fetch rating data from FMP API
  const url = `https://financialmodelingprep.com/api/v3/stock_rating/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data[0]; // Return the first rating
}

/**
 * Fetch earnings call transcripts from FMP API
 */
async function fetchEarningTranscripts(symbol: string) {
  try {
    // Use the stable/earning-call-transcript endpoint as shown in the documentation
    const url = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}?apikey=${FMP_API_KEY}`;
    console.log(`Fetching earnings transcripts from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.warn(`Unexpected response format for earnings transcripts: ${JSON.stringify(data).substring(0, 100)}...`);
      return [];
    }
    
    // Format the response to match our EarningsCall type
    return data.map(transcript => ({
      symbol: transcript.symbol,
      quarter: transcript.quarter || transcript.period,
      year: transcript.year,
      date: transcript.date,
      content: transcript.content,
      title: `${symbol} ${transcript.quarter || transcript.period} ${transcript.year} Earnings Call`,
      url: `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}/${transcript.quarter || transcript.period}/${transcript.year}`
    }));
  } catch (error) {
    console.error(`Error fetching earnings transcripts for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch specific transcript content by quarter and year
 */
async function fetchTranscriptContent(symbol: string, quarter: string, year: string) {
  try {
    const url = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}/${quarter}/${year}?apikey=${FMP_API_KEY}`;
    console.log(`Fetching transcript content from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`No transcript found for ${symbol} ${quarter} ${year}`);
    }
    
    // Return the first transcript's content
    return { content: data[0].content };
  } catch (error) {
    console.error(`Error fetching transcript content for ${symbol} ${quarter} ${year}:`, error);
    throw error;
  }
}

async function fetchSECFilings(symbol: string) {
  // Fetch SEC filings from FMP API
  const url = `https://financialmodelingprep.com/api/v3/sec_filings/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data; // Return the SEC filings
}
