
import { makeApiRequest, buildFmpUrl, handleApiResponse } from "../../_shared/api-utils.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

export class ProfileController {
  /**
   * Handle requests for company profile data
   */
  async handleRequest(endpoint: string, symbol: string): Promise<any> {
    switch (endpoint) {
      case "profile":
        return await this.fetchProfile(symbol);
      case "quote":
        return await this.fetchQuote(symbol);
      case "rating":
        return await this.fetchRating(symbol);
      default:
        throw new Error(`Unsupported profile endpoint: ${endpoint}`);
    }
  }
  
  /**
   * Fetch company profile data
   */
  async fetchProfile(symbol: string): Promise<any[]> {
    const url = buildFmpUrl("profile", symbol);
    console.log(`Fetching profile from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
    
    const data = await makeApiRequest<any[]>(
      url, 
      `Unable to fetch profile data for ${symbol}`
    );
    
    return handleApiResponse(data, `No profile data found for ${symbol}`);
  }
  
  /**
   * Fetch company quote data
   */
  async fetchQuote(symbol: string): Promise<any[]> {
    const url = buildFmpUrl("quote", symbol);
    console.log(`Fetching quote from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
    
    const data = await makeApiRequest<any[]>(
      url,
      `Unable to fetch quote data for ${symbol}`
    );
    
    return handleApiResponse(data, `No quote data found for ${symbol}`);
  }
  
  /**
   * Fetch company rating data
   */
  async fetchRating(symbol: string): Promise<any[]> {
    try {
      const url = buildFmpUrl("stock_rating", symbol);
      const data = await makeApiRequest<any[]>(url);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn(`No rating data found for ${symbol}`);
        return [{ rating: "N/A" }];
      }
      
      return data;
    } catch (error) {
      console.warn(`Rating data fetch failed: ${error.message}`);
      return [{ rating: "N/A" }];
    }
  }
  
  /**
   * Create placeholder profile data when API calls fail
   */
  createPlaceholderProfile(symbol: string): any[] {
    return [{
      symbol,
      companyName: `${symbol} (Data Unavailable)`,
      price: 0,
      exchange: "Unknown",
      industry: "Unknown",
      sector: "Unknown",
      description: `We couldn't retrieve company data for ${symbol}. Please try again later or check if this symbol is valid.`,
      error: "Data unavailable after multiple attempts"
    }];
  }
  
  /**
   * Create placeholder quote data when API calls fail
   */
  createPlaceholderQuote(symbol: string): any[] {
    return [{
      symbol,
      name: `${symbol} (Data Unavailable)`,
      price: 0,
      change: 0,
      changesPercentage: 0,
      error: "Data unavailable after multiple attempts"
    }];
  }
}
