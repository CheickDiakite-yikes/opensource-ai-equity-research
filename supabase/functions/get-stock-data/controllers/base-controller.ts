
import { API_BASE_URLS, FMP_API_KEY } from "../../_shared/constants.ts";

export abstract class BaseController {
  protected apiBaseUrl = API_BASE_URLS.FMP;
  protected stableApiBaseUrl = API_BASE_URLS.FMP_STABLE;
  protected apiKey = FMP_API_KEY;

  /**
   * Make an API request to FMP
   */
  protected async makeApiRequest<T>(url: string): Promise<T> {
    console.log(`Making API request to: ${url.replace(this.apiKey, "API_KEY_HIDDEN")}`);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error (${response.status}): ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`Error making API request to ${url.replace(this.apiKey, "API_KEY_HIDDEN")}:`, error);
      throw error;
    }
  }

  /**
   * Build a URL with API key
   */
  protected buildUrl(endpoint: string, params: Record<string, string | undefined> = {}): string {
    let url = `${this.apiBaseUrl}/${endpoint}`;
    const queryParams: string[] = [];
    
    // Add all non-undefined parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.push(`${key}=${encodeURIComponent(value)}`);
      }
    });
    
    // Add API key
    queryParams.push(`apikey=${this.apiKey}`);
    
    // Append query parameters to URL
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    return url;
  }

  /**
   * Build a URL with API key using the stable API
   */
  protected buildStableUrl(endpoint: string, params: Record<string, string | undefined> = {}): string {
    let url = `${this.stableApiBaseUrl}/${endpoint}`;
    const queryParams: string[] = [];
    
    // Add all non-undefined parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.push(`${key}=${encodeURIComponent(value)}`);
      }
    });
    
    // Add API key
    queryParams.push(`apikey=${this.apiKey}`);
    
    // Append query parameters to URL
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    return url;
  }
}
