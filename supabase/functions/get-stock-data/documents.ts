
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/fetch-utils.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

/**
 * Fetch earnings call transcripts
 */
export async function fetchEarningTranscripts(symbol: string) {
  try {
    // Use the stable/earning-call-transcript endpoint as shown in the documentation
    const url = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}?apikey=${FMP_API_KEY}`;
    console.log(`Fetching earnings transcripts from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
    
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
export async function fetchTranscriptContent(symbol: string, quarter: string, year: string) {
  try {
    const url = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}/${quarter}/${year}?apikey=${FMP_API_KEY}`;
    console.log(`Fetching transcript content from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
    
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

/**
 * Fetch SEC filings
 */
export async function fetchSECFilings(symbol: string) {
  const url = `https://financialmodelingprep.com/api/v3/sec_filings/${symbol}?limit=20&apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.warn(`SEC filings fetch failed with status ${response.status}`);
    return [];
  }
  
  const data = await response.json();
  return data;
}
