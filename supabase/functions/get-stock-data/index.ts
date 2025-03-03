
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
        data = await fetchWithRetry(() => fetchProfile(symbol));
        break;
      case "quote":
        data = await fetchWithRetry(() => fetchQuote(symbol));
        break;
      case "rating":
        data = await fetchWithRetry(() => fetchRating(symbol));
        break;
      case "income-statement":
        data = await fetchWithRetry(() => fetchFinancials(symbol, "income-statement"));
        break;
      case "balance-sheet":
        data = await fetchWithRetry(() => fetchFinancials(symbol, "balance-sheet"));
        break;
      case "cash-flow":
        data = await fetchWithRetry(() => fetchFinancials(symbol, "cash-flow-statement"));
        break;
      case "ratios":
        data = await fetchWithRetry(() => fetchFinancials(symbol, "ratios"));
        break;
      case "historical-price":
        data = await fetchWithRetry(() => fetchHistoricalPrice(symbol));
        break;
      case "news":
        data = await fetchWithRetry(() => fetchNews(symbol));
        break;
      case "peers":
        data = await fetchWithRetry(() => fetchPeers(symbol));
        break;
      case "earning-transcripts":
        data = await fetchWithRetry(() => fetchEarningTranscripts(symbol));
        break;
      case "transcript-content":
        if (!quarter || !year) {
          return new Response(
            JSON.stringify({ error: "Quarter and year are required for transcript content" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        data = await fetchWithRetry(() => fetchTranscriptContent(symbol, quarter, year));
        break;
      case "sec-filings":
        data = await fetchWithRetry(() => fetchSECFilings(symbol));
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Invalid endpoint: ${endpoint}` }),
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
      JSON.stringify({ 
        error: error.message || "An error occurred while processing your request",
        symbol: req.json?.symbol || "unknown"
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

/**
 * Retry a function with exponential backoff
 */
async function fetchWithRetry(fetchFn, retries = 2) {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Retrying... ${retries} attempts left`);
    await new Promise(r => setTimeout(r, 1000)); // 1 second delay
    
    return fetchWithRetry(fetchFn, retries - 1);
  }
}

async function fetchProfile(symbol) {
  // Fetch profile data from FMP API
  const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error (${response.status}): Unable to fetch profile data for ${symbol}`);
  }
  
  const data = await response.json();
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error(`No profile data found for ${symbol}`);
  }
  
  return data;
}

async function fetchQuote(symbol) {
  // Fetch quote data from FMP API
  const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error (${response.status}): Unable to fetch quote data for ${symbol}`);
  }
  
  const data = await response.json();
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error(`No quote data found for ${symbol}`);
  }
  
  return data;
}

async function fetchRating(symbol) {
  // Fetch rating data from FMP API
  const url = `https://financialmodelingprep.com/api/v3/stock_rating/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.warn(`Rating data fetch failed with status ${response.status}`);
    return [{ rating: "N/A" }];
  }
  
  const data = await response.json();
  return data.length > 0 ? data : [{ rating: "N/A" }];
}

async function fetchFinancials(symbol, type) {
  // Fetch financial data from FMP API
  const url = `https://financialmodelingprep.com/api/v3/${type}/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error (${response.status}): Unable to fetch ${type} data for ${symbol}`);
  }
  
  const data = await response.json();
  if (!data || !Array.isArray(data)) {
    throw new Error(`No ${type} data found for ${symbol}`);
  }
  
  return data;
}

async function fetchHistoricalPrice(symbol) {
  // Fetch historical price data from FMP API
  const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error (${response.status}): Unable to fetch historical price data for ${symbol}`);
  }
  
  const data = await response.json();
  return data;
}

async function fetchNews(symbol) {
  // Fetch news data from FMP API
  const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=10&apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.warn(`News data fetch failed with status ${response.status}`);
    return [];
  }
  
  const data = await response.json();
  return data;
}

async function fetchPeers(symbol) {
  // Fetch peers data from FMP API
  const url = `https://financialmodelingprep.com/api/v3/stock-peers?symbol=${symbol}&apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.warn(`Peers data fetch failed with status ${response.status}`);
    return [{ peersList: [] }];
  }
  
  const data = await response.json();
  return data.length > 0 ? data : [{ peersList: [] }];
}

/**
 * Fetch earnings call transcripts from FMP API
 */
async function fetchEarningTranscripts(symbol) {
  try {
    // Use the stable/earning-call-transcript endpoint as shown in the documentation
    const url = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}?apikey=${FMP_API_KEY}`;
    console.log(`Fetching earnings transcripts from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`No earnings transcripts found for ${symbol}`);
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
    return [];
  }
}

/**
 * Fetch specific transcript content by quarter and year
 */
async function fetchTranscriptContent(symbol, quarter, year) {
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

async function fetchSECFilings(symbol) {
  // Fetch SEC filings from FMP API
  const url = `https://financialmodelingprep.com/api/v3/sec_filings/${symbol}?limit=20&apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.warn(`SEC filings fetch failed with status ${response.status}`);
    return [];
  }
  
  const data = await response.json();
  return data;
}
