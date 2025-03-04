
import { makeApiRequest, handleApiResponse } from "../../_shared/api-utils.ts";
import { FMP_API_KEY } from "../../_shared/constants.ts";
import { BaseProfileController } from "./base-profile-controller.ts";

/**
 * Controller for company profile data
 */
export class CompanyProfileController extends BaseProfileController {
  /**
   * Fetch company profile data
   */
  async fetchProfile(symbol: string): Promise<any[]> {
    const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
    this.logApiRequest(url, "profile", symbol);
    
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
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`;
    this.logApiRequest(url, "quote", symbol);
    
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
      const url = `https://financialmodelingprep.com/api/v3/stock_rating/${symbol}?apikey=${FMP_API_KEY}`;
      this.logApiRequest(url, "rating", symbol);
      
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
}
