
import { makeApiRequest, handleApiResponse, logApiRequest } from "../../../_shared/api-utils.ts";
import { FMP_API_KEY } from "../../../_shared/constants.ts";

/**
 * Base controller for profile-related endpoints with shared functionality
 */
export class BaseProfileController {
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
  
  /**
   * Log API request with obfuscated API key
   */
  logApiRequest(url: string, type: string, symbol: string) {
    const maskedUrl = url.replace(FMP_API_KEY, "API_KEY_HIDDEN");
    console.log(`Fetching ${type} from: ${maskedUrl} for symbol: ${symbol}`);
  }
}
