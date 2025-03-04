
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
      case "transcript-dates":
        return await this.fetchTranscriptDates(symbol);
      case "sec-filings":
        return await this.fetchSECFilings(symbol);
      case "sec-company-profile":
        return await this.fetchSECCompanyProfile(symbol);
      default:
        throw new Error(`Unsupported documents endpoint: ${endpoint}`);
    }
  }
  
  /**
   * Fetch earnings call transcripts
   */
  async fetchEarningTranscripts(symbol: string): Promise<any[]> {
    try {
      // Use the stable API endpoint
      const url = `https://financialmodelingprep.com/stable/earning-call-transcript?symbol=${symbol}&apikey=${FMP_API_KEY}`;
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
        url: `https://financialmodelingprep.com/stable/earning-call-transcript?symbol=${symbol}&quarter=${transcript.quarter || transcript.period}&year=${transcript.year}`
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
      const url = `https://financialmodelingprep.com/stable/earning-call-transcript?symbol=${symbol}&quarter=${quarter}&year=${year}&apikey=${FMP_API_KEY}`;
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
   * Fetch available transcript dates for a symbol
   */
  async fetchTranscriptDates(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/stable/earning-call-transcript-dates?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      console.log(`Fetching transcript dates from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.warn(`No transcript dates found for ${symbol}`);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching transcript dates for ${symbol}:`, error);
      return [];
    }
  }
  
  /**
   * Fetch SEC filings
   */
  async fetchSECFilings(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/stable/sec-filings-search/symbol?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      console.log(`Fetching SEC filings from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`SEC filings fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.warn(`No SEC filings found for ${symbol}`);
        return [];
      }
      
      // Format the response to match our SECFiling type
      return data.map((filing: any) => {
        // Determine filing type display name
        let typeName = "";
        switch (filing.form) {
          case "10-K": typeName = "10-K (Annual Report)"; break;
          case "10-Q": typeName = "10-Q (Quarterly Report)"; break;
          case "8-K": typeName = "8-K (Current Report)"; break;
          default: typeName = `${filing.form} (SEC Filing)`;
        }
        
        return {
          symbol: filing.symbol,
          type: typeName,
          filingDate: filing.filingDate || filing.acceptedDate,
          reportDate: filing.acceptedDate || filing.filingDate,
          cik: filing.cik,
          form: filing.form,
          url: filing.finalLink || filing.link,
          filingNumber: filing.accessionNumber || 'N/A'
        };
      });
    } catch (error) {
      console.error(`Error fetching SEC filings for ${symbol}:`, error);
      return [];
    }
  }
  
  /**
   * Fetch SEC company profile
   */
  async fetchSECCompanyProfile(symbol: string): Promise<any> {
    try {
      const url = `https://financialmodelingprep.com/stable/sec-profile?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      console.log(`Fetching SEC company profile from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`SEC company profile fetch failed with status ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error(`Error fetching SEC company profile for ${symbol}:`, error);
      return null;
    }
  }
}
