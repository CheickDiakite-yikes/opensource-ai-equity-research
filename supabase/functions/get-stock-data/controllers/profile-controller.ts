
import { makeApiRequest, buildFmpUrl, handleApiResponse } from "../../_shared/api-utils.ts";
import { FMP_API_KEY } from "../../_shared/constants.ts";

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
      case "peers":
        return await this.fetchPeers(symbol);
      case "market-cap":
        return await this.fetchMarketCap(symbol);
      case "historical-market-cap":
        return await this.fetchHistoricalMarketCap(symbol);
      case "shares-float":
        return await this.fetchSharesFloat(symbol);
      case "executives":
        return await this.fetchExecutives(symbol);
      case "executive-compensation":
        return await this.fetchExecutiveCompensation(symbol);
      case "company-notes":
        return await this.fetchCompanyNotes(symbol);
      case "employee-count":
        return await this.fetchEmployeeCount(symbol);
      case "historical-employee-count":
        return await this.fetchHistoricalEmployeeCount(symbol);
      default:
        throw new Error(`Unsupported profile endpoint: ${endpoint}`);
    }
  }
  
  /**
   * Fetch company profile data
   */
  async fetchProfile(symbol: string): Promise<any[]> {
    const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
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
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`;
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
      const url = `https://financialmodelingprep.com/api/v3/stock_rating/${symbol}?apikey=${FMP_API_KEY}`;
      console.log(`Fetching rating from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
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
   * Fetch company peers
   */
  async fetchPeers(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/stock-peers?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      console.log(`Fetching peers from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const data = await makeApiRequest<any[]>(url);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return [{ symbol, peers: [] }];
      }
      
      return data;
    } catch (error) {
      console.warn(`Peers data fetch failed: ${error.message}`);
      return [{ symbol, peers: [] }];
    }
  }

  /**
   * Fetch company market cap
   */
  async fetchMarketCap(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/market-capitalization/${symbol}?apikey=${FMP_API_KEY}`;
      console.log(`Fetching market cap from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const data = await makeApiRequest<any[]>(url);
      return handleApiResponse(data, `No market cap data found for ${symbol}`);
    } catch (error) {
      console.warn(`Market cap data fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch historical market cap
   */
  async fetchHistoricalMarketCap(symbol: string, limit: number = 100): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/historical-market-capitalization/${symbol}?limit=${limit}&apikey=${FMP_API_KEY}`;
      console.log(`Fetching historical market cap from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Historical market cap data fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch shares float
   */
  async fetchSharesFloat(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/shares-float/${symbol}?apikey=${FMP_API_KEY}`;
      console.log(`Fetching shares float from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Shares float data fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch company executives
   */
  async fetchExecutives(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/key-executives/${symbol}?apikey=${FMP_API_KEY}`;
      console.log(`Fetching executives from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Executives data fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch executive compensation
   */
  async fetchExecutiveCompensation(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/governance-executive-compensation/${symbol}?apikey=${FMP_API_KEY}`;
      console.log(`Fetching executive compensation from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Executive compensation data fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch company notes
   */
  async fetchCompanyNotes(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/company-notes?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      console.log(`Fetching company notes from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Company notes data fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch employee count
   */
  async fetchEmployeeCount(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/employee-count?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      console.log(`Fetching employee count from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Employee count data fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch historical employee count
   */
  async fetchHistoricalEmployeeCount(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/historical-employee-count?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      console.log(`Fetching historical employee count from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Historical employee count data fetch failed: ${error.message}`);
      return [];
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
