
import { makeApiRequest, buildFmpUrl } from "../../_shared/api-utils.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

export class DocumentsController {
  /**
   * Handle requests for document data
   */
  async handleRequest(endpoint: string, symbol: string, quarter?: string, year?: string): Promise<any> {
    switch (endpoint) {
      case "earning-transcripts":
        return await this.fetchEarningTranscripts(symbol);
      case "transcript-content":
        if (!quarter || !year) {
          throw new Error("Quarter and year are required for transcript content");
        }
        return await this.fetchTranscriptContent(symbol, quarter, year);
      case "sec-filings":
        return await this.fetchSECFilings(symbol);
      default:
        throw new Error(`Unsupported documents endpoint: ${endpoint}`);
    }
  }
  
  /**
   * Fetch earnings call transcripts
   */
  async fetchEarningTranscripts(symbol: string): Promise<any[]> {
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
      return data.map((transcript: any) => ({
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
  async fetchTranscriptContent(symbol: string, quarter: string, year: string): Promise<any> {
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
  async fetchSECFilings(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/sec_filings/${symbol}?limit=20&apikey=${FMP_API_KEY}`;
      console.log(`Fetching SEC filings from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`SEC filings fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching SEC filings for ${symbol}:`, error);
      return [];
    }
  }
}
